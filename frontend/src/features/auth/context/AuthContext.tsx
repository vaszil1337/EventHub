import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AuthUser, LoginInput, RegisterInput } from '@/features/auth/types';
import { authService } from '@/features/auth/services/authService';
import { setAuthToken, getAuthToken } from '@/shared/services/apiClient';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = 'eventhub_auth_user';

function getStoredUser(): AuthUser | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthUser;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function persistUser(user: AuthUser | null): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  } catch {
    // ignore
  }
}

const sanitizeUser = (u: AuthUser): AuthUser => ({
  ...u,
  fullName: u.fullName ? u.fullName.replace(/\s*\((Organizer|Participant|Szervező|Résztvevő)\)/gi, '').trim() : u.fullName,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getAuthToken());

  const logout = useCallback(() => {
    authService.logout();
    setAuthToken(null);
    persistUser(null);
    setToken(null);
    setUser(null);
  }, []);

  // Validate or sync user profile in background on mount if token is stored
  useEffect(() => {
    const savedToken = getAuthToken();
    if (savedToken) {
      authService.getCurrentUser()
        .then((fetchedUser) => {
          const cleaned = sanitizeUser(fetchedUser);
          setUser(cleaned);
          persistUser(cleaned);
        })
        .catch((err: any) => {
          if (err?.status === 401 || err?.status === 403) {
            logout();
          }
        });
    }
  }, [logout]);

  const login = useCallback(async (input: LoginInput): Promise<AuthUser> => {
    const response = await authService.login(input);
    const cleanedUser = sanitizeUser(response.user);
    setAuthToken(response.token);
    setToken(response.token);
    persistUser(cleanedUser);
    setUser(cleanedUser);
    return cleanedUser;
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<AuthUser> => {
    const response = await authService.register(input);
    const cleanedUser = sanitizeUser(response.user);
    setAuthToken(response.token);
    setToken(response.token);
    persistUser(cleanedUser);
    setUser(cleanedUser);
    return cleanedUser;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
