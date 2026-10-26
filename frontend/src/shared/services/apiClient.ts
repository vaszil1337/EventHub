const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
const TOKEN_STORAGE_KEY = 'eventhub_auth_token';

function getStoredToken(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
  return null;
}

function persistToken(token: string | null): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  } catch {
    // ignore
  }
}

let currentAuthToken: string | null = getStoredToken();

export function setAuthToken(token: string | null): void {
  currentAuthToken = token;
  persistToken(token);
}

export function getAuthToken(): string | null {
  if (!currentAuthToken) {
    currentAuthToken = getStoredToken();
  }
  return currentAuthToken;
}

/**
 * Universal fetch wrapper for communicating with the backend REST API.
 * Automatically attaches the JWT Bearer token when a user is authenticated.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (currentAuthToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    const error = new Error(errorBody.message || 'API request failed');
    (error as any).status = response.status;
    (error as any).body = errorBody;
    throw error;
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as unknown as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
