import { AuthResponse, AuthUser, LoginInput, RegisterInput } from '@/features/auth/types';
import { apiFetch, setAuthToken } from '@/shared/services/apiClient';

export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setAuthToken(response.token);
    return response;
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setAuthToken(response.token);
    return response;
  },

  async getCurrentUser(): Promise<AuthUser> {
    return apiFetch<AuthUser>('/auth/me');
  },

  logout(): void {
    setAuthToken(null);
  },
};
