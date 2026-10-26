import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from './authService';
import { getAuthToken } from '@/shared/services/apiClient';

describe('authService', () => {
  beforeEach(() => {
    authService.logout();
  });

  it('logs in successfully and saves token', async () => {
    const result = await authService.login({
      email: 'organizer@eventhub.hu',
      password: 'organizer123',
    });

    expect(result.token).toBe('jwt-organizer-token');
    expect(result.user.email).toBe('organizer@eventhub.hu');
    expect(result.user.role).toBe('ORGANIZER');
    expect(getAuthToken()).toBe('jwt-organizer-token');
  });

  it('registers a new participant successfully and sets token', async () => {
    const result = await authService.register({
      fullName: 'Teszt Elek',
      email: 'elek@eventhub.hu',
      password: 'password123',
      role: 'PARTICIPANT',
    });

    expect(result.token).toBe('jwt-registered-token');
    expect(result.user.fullName).toBe('Teszt Elek');
    expect(result.user.email).toBe('elek@eventhub.hu');
    expect(result.user.role).toBe('PARTICIPANT');
    expect(getAuthToken()).toBe('jwt-registered-token');
  });

  it('clears token on logout', async () => {
    await authService.login({
      email: 'organizer@eventhub.hu',
      password: 'organizer123',
    });
    expect(getAuthToken()).toBeTruthy();

    authService.logout();
    expect(getAuthToken()).toBeNull();
  });
});
