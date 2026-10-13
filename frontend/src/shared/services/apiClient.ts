const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

/**
 * Universal fetch wrapper for communicating with the Spring Boot backend REST API.
 */
export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    const error = new Error(errorBody.message || 'API request failed');
    (error as any).status = response.status;
    (error as any).body = errorBody;
    throw error;
  }

  return response.json() as Promise<T>;
}
