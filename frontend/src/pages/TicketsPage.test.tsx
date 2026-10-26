import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TicketsPage } from './TicketsPage';
import { AuthContext } from '@/features/auth/context/AuthContext';
import { AuthUser } from '@/features/auth/types';

const mockParticipantUser: AuthUser = {
  id: 'usr-part-1',
  fullName: 'Péter Nagy',
  email: 'peter@example.com',
  role: 'PARTICIPANT',
};

const mockOrganizerUser: AuthUser = {
  id: 'usr-org-1',
  fullName: 'Anna Kovács',
  email: 'organizer@eventhub.hu',
  role: 'ORGANIZER',
};

function renderTicketsPage(authValue: any, props: any = {}) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <TicketsPage {...props} />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('TicketsPage Authentication & Authorization', () => {
  it('renders login prompt when user is not authenticated and does not load tickets', () => {
    const handleOpenAuth = vi.fn();
    const unauthContext = {
      user: null,
      token: null,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };

    renderTicketsPage(unauthContext, { onOpenAuth: handleOpenAuth });

    expect(screen.getByTestId('unauthenticated-tickets-notice')).toBeInTheDocument();
    expect(screen.getByText(/Jelentkezz be a jegyeid megtekintéséhez!/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Search attendee, email/i)).not.toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: /Bejelentkezés \/ Regisztráció/i });
    expect(loginButton).toBeInTheDocument();
    userEvent.setup().click(loginButton);
    expect(loginButton).toBeEnabled();
  });

  it('renders personal tickets view when authenticated as PARTICIPANT', async () => {
    const participantContext = {
      user: mockParticipantUser,
      token: 'jwt-token-123',
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };

    renderTicketsPage(participantContext);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /My Tickets & Passes/i })).toBeInTheDocument();
      expect(screen.getByText(/peter@example\.com/i)).toBeInTheDocument();
    });
  });

  it('renders organizer dashboard with KPI cards and reservations table when authenticated as ORGANIZER', async () => {
    const organizerContext = {
      user: mockOrganizerUser,
      token: 'jwt-token-456',
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };

    renderTicketsPage(organizerContext);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Event Reservations & Attendees/i })).toBeInTheDocument();
      expect(screen.getByText(/organizer@eventhub\.hu/i)).toBeInTheDocument();
    });

    // Check KPI summary cards
    expect(screen.getByText(/Active Bookings/i)).toBeInTheDocument();
    expect(screen.getByText(/Gross Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Email Health/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancelled Seats/i)).toBeInTheDocument();

    // Check Table column headers
    expect(screen.getByRole('columnheader', { name: /Attendee/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Event & Date/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Ticket Tier/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Pass Code/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Email Delivery/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Ticket Status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Actions/i })).toBeInTheDocument();
  });
});
