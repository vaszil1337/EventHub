import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingDialog } from './BookingDialog';
import { Event } from '@/features/events/types';
import { eventService } from '@/features/events/services/eventService';

const mockAvailableEvent: Event = {
  id: 'evt-available-1',
  title: 'React & TypeScript Deep Dive',
  description: 'Learn modern patterns and feature-driven architecture.',
  date: '2026-10-25T14:00:00.000Z',
  venue: {
    id: 'venue-1',
    name: 'Tech Campus Hall',
    address: '123 Code Street',
    capacity: 100,
  },
  soldTicketsCount: 40,
  price: { amount: 50, currency: 'USD' },
};

const mockSoldOutEvent: Event = {
  id: 'evt-sold-out-1',
  title: 'Sold Out Masterclass',
  description: 'Event that has reached full capacity.',
  date: '2026-11-12T18:00:00.000Z',
  venue: {
    id: 'venue-2',
    name: 'Exclusive VIP Room',
    address: '456 Secret Alley',
    capacity: 20,
  },
  soldTicketsCount: 20, // 20 / 20 capacity reached!
  price: { amount: 150, currency: 'USD' },
};

describe('BookingDialog Integration Tests', () => {
  beforeEach(async () => {
    localStorage.clear();
    // Seed events in storage so eventService can look them up
    await eventService.updateEvent(mockAvailableEvent).catch(async () => {
      await eventService.resetToSeed();
      await eventService.updateEvent(mockAvailableEvent).catch(() => {});
    });
    // Ensure both mock events are present in storage
    const current = await eventService.getEvents();
    const updated = [
      ...current.filter((e) => e.id !== mockAvailableEvent.id && e.id !== mockSoldOutEvent.id),
      mockAvailableEvent,
      mockSoldOutEvent,
    ];
    localStorage.setItem('eventhub_events', JSON.stringify(updated));
  });

  it('renders event details and input fields when opened', () => {
    render(
      <BookingDialog
        open={true}
        event={mockAvailableEvent}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Book Event Ticket')).toBeInTheDocument();
    expect(screen.getByText('React & TypeScript Deep Dive')).toBeInTheDocument();
    expect(screen.getByText(/Tech Campus Hall/)).toBeInTheDocument();
    expect(screen.getByText(/40 \/ 100 seats/)).toBeInTheDocument();
    expect(screen.getByTestId('input-participant-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-participant-email')).toBeInTheDocument();
    expect(screen.getByTestId('submit-booking-button')).toBeInTheDocument();
  });

  it('successfully books a ticket and displays confirmation with ticketCode', async () => {
    const user = userEvent.setup();
    const onBookingSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <BookingDialog
        open={true}
        event={mockAvailableEvent}
        onClose={onClose}
        onBookingSuccess={onBookingSuccess}
      />
    );

    const nameInput = screen.getByTestId('input-participant-name');
    const emailInput = screen.getByTestId('input-participant-email');
    const submitButton = screen.getByTestId('submit-booking-button');

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john.doe@example.com');
    await user.click(submitButton);

    // Wait for success screen
    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
    });

    expect(screen.getByTestId('ticket-code-chip')).toHaveTextContent(/^EVT-\d{4}-[A-Z0-9]{4}$/);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(onBookingSuccess).toHaveBeenCalledTimes(1);
  });

  it('displays error alert and blocks booking when event is fully booked (capacity rule)', async () => {
    const user = userEvent.setup();
    const onBookingSuccess = vi.fn();

    render(
      <BookingDialog
        open={true}
        event={mockSoldOutEvent}
        onClose={vi.fn()}
        onBookingSuccess={onBookingSuccess}
      />
    );

    // Notice the capacity warning alert
    expect(screen.getByTestId('capacity-warning-alert')).toBeInTheDocument();
    expect(screen.getByText(/20 \/ 20 seats/)).toBeInTheDocument();

    const nameInput = screen.getByTestId('input-participant-name');
    const emailInput = screen.getByTestId('input-participant-email');
    const submitButton = screen.getByTestId('submit-booking-button');

    await user.type(nameInput, 'Eager Attendee');
    await user.type(emailInput, 'eager@example.com');
    await user.click(submitButton);

    // Should display explicit MUI error alert
    await waitFor(() => {
      const errorAlert = screen.getByTestId('booking-error-alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(/fully booked/i);
    });

    // Booking success callback should not have been called
    expect(onBookingSuccess).not.toHaveBeenCalled();
  });

  it('displays validation error alert when required fields are empty', async () => {
    const user = userEvent.setup();

    render(
      <BookingDialog
        open={true}
        event={mockAvailableEvent}
        onClose={vi.fn()}
      />
    );

    const submitButton = screen.getByTestId('submit-booking-button');
    await user.click(submitButton);

    await waitFor(() => {
      const errorAlert = screen.getByTestId('booking-error-alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(/participant name is required/i);
    });
  });
});
