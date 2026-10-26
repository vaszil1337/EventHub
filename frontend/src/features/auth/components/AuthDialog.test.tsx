import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthDialog } from './AuthDialog';
import { AuthProvider } from '@/features/auth/context/AuthContext';

describe('AuthDialog Integration Tests', () => {
  it('renders login form by default with demo credentials buttons', () => {
    render(
      <AuthProvider>
        <AuthDialog open={true} onClose={vi.fn()} />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Organizer Demo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Participant Demo/i })).toBeInTheDocument();
  });

  it('fills inputs when quick demo account is clicked and submits successfully', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthDialog open={true} onClose={handleClose} onAuthSuccess={handleSuccess} />
      </AuthProvider>
    );

    const demoOrganizerBtn = screen.getByRole('button', { name: /Organizer Demo/i });
    await user.click(demoOrganizerBtn);

    const loginSubmitBtn = screen.getByRole('button', { name: /^Sign In$/i });
    await user.click(loginSubmitBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'ORGANIZER',
        })
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('allows switching to registration tab', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthDialog open={true} onClose={vi.fn()} />
      </AuthProvider>
    );

    const registerTab = screen.getByRole('tab', { name: /Create Account/i });
    await user.click(registerTab);

    expect(screen.getByRole('button', { name: /Register & Sign In/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
  });
});
