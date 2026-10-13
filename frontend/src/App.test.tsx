import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/ui/theme';
import App from './App';
import { eventService } from '@/features/events/services/eventService';

function renderApp() {
  return render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
}

describe('App End-to-End Component Flow with React Router', () => {
  beforeEach(async () => {
    await eventService.resetToSeed();
  });

  it('renders navbar, hero stats, and all 3 seeded events', async () => {
    renderApp();

    // Verify Navbar branding
    expect(screen.getByText('EventHub')).toBeInTheDocument();
    expect(screen.getAllByText('Event & Ticket Management').length).toBeGreaterThanOrEqual(1);

    // Wait for events to load and render
    await waitFor(() => {
      expect(screen.getByText('Tech Horizons Summit 2026')).toBeInTheDocument();
      expect(screen.getByText('Smooth Jazz & Soul Evening')).toBeInTheDocument();
      expect(screen.getByText('Executive AI & Deep Learning Masterclass')).toBeInTheDocument();
    });

    // Check capacity displays
    const capacityTexts = screen.getAllByTestId('capacity-text');
    expect(capacityTexts.some((el) => el.textContent?.includes('45 / 100 seats taken'))).toBe(true);
    expect(capacityTexts.some((el) => el.textContent?.includes('28 / 30 seats taken'))).toBe(true);
    expect(capacityTexts.some((el) => el.textContent?.includes('50 / 50 seats taken'))).toBe(true);

    // Fully booked event card has "Sold Out" button
    expect(
      screen.getByRole('button', { name: /Sold Out \(Capacity Limit\)/i })
    ).toBeInTheDocument();
  });

  it('filters events using search bar', async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Tech Horizons Summit 2026')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search events, venues.../i);
    await user.type(searchInput, 'Jazz');

    expect(screen.getByText('Smooth Jazz & Soul Evening')).toBeInTheDocument();
    expect(screen.queryByText('Tech Horizons Summit 2026')).not.toBeInTheDocument();
    expect(screen.queryByText('Executive AI & Deep Learning Masterclass')).not.toBeInTheDocument();
  });

  it('books a ticket for an available event and updates seat count on the card', async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Tech Horizons Summit 2026')).toBeInTheDocument();
    });

    // Initial seat count: 45 / 100
    const initialCapacityTexts = screen.getAllByTestId('capacity-text');
    expect(initialCapacityTexts.some((el) => el.textContent?.includes('45 / 100 seats taken'))).toBe(true);

    // Click "Book Ticket" on Tech Horizons Summit
    const bookButton = screen.getByTestId('book-button-evt-tech-summit-2026');
    await user.click(bookButton);

    // Dialog opens
    await waitFor(() => {
      expect(screen.getByText('Book Event Ticket')).toBeInTheDocument();
    });

    // Fill attendee details
    await user.type(screen.getByTestId('input-participant-name'), 'Sarah Connor');
    await user.type(screen.getByTestId('input-participant-email'), 'sarah@skynet.com');
    await user.click(screen.getByTestId('submit-booking-button'));

    // Confirmation shows ticket code
    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
      expect(screen.getByTestId('ticket-code-chip')).toHaveTextContent(/^EVT-\d{4}-[A-Z0-9]{4}$/);
    });

    // Close the dialog
    await user.click(screen.getByRole('button', { name: /Done/i }));

    // Seat count should now be 46 / 100 on the card!
    await waitFor(() => {
      const updatedCapacityTexts = screen.getAllByTestId('capacity-text');
      expect(updatedCapacityTexts.some((el) => el.textContent?.includes('46 / 100 seats taken'))).toBe(true);
    });

    // Total tickets count in Navbar should show "1" badge
    const ticketBadges = screen.getAllByText('1');
    expect(ticketBadges.some((badge) => badge.closest('.MuiChip-root'))).toBe(true);
  });

  it('prevents booking when clicking the fully booked event and shows capacity constraint alert', async () => {
    const user = userEvent.setup();
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Executive AI & Deep Learning Masterclass')).toBeInTheDocument();
    });

    // Click the sold out event button
    const soldOutButton = screen.getByTestId('book-button-evt-ai-masterclass-2026');
    await user.click(soldOutButton);

    // Dialog opens showing capacity warning notice
    await waitFor(() => {
      expect(screen.getByTestId('capacity-warning-alert')).toBeInTheDocument();
    });

    // Fill form and attempt to submit
    await user.type(screen.getByTestId('input-participant-name'), 'Curious Learner');
    await user.type(screen.getByTestId('input-participant-email'), 'curious@learner.io');
    await user.click(screen.getByTestId('submit-booking-button'));

    // Should display explicit CapacityExceeded error alert
    await waitFor(() => {
      const errorAlert = screen.getByTestId('booking-error-alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(/is fully booked/i);
    });
  });
});
