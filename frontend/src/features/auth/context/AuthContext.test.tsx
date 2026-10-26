import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

function TestConsumer() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'logged-in' : 'logged-out'}</span>
      <span data-testid="user-name">{user?.fullName || 'none'}</span>
      <span data-testid="user-role">{user?.role || 'none'}</span>
      <button onClick={() => login({ email: 'participant@eventhub.hu', password: '123' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext persistence across page refresh', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists logged in user and token in localStorage and restores immediately on remount (simulating refresh)', async () => {
    const user = userEvent.setup();

    // 1. Initial mount - unauthenticated
    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');

    // 2. Log in
    await user.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-in');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Péter Nagy');
      expect(screen.getByTestId('user-role')).toHaveTextContent('PARTICIPANT');
    });

    // 3. Unmount (simulates page refresh / browser reload)
    unmount();

    // 4. Remount AuthProvider - should immediately restore user from localStorage without layout shift!
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-in');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Péter Nagy');
    expect(screen.getByTestId('user-role')).toHaveTextContent('PARTICIPANT');
  });

  it('clears localStorage and user state on logout', async () => {
    const user = userEvent.setup();

    const { unmount } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-in');
    });

    // Logout
    await user.click(screen.getByRole('button', { name: /Logout/i }));
    expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');

    // Remount
    unmount();
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
  });
});
