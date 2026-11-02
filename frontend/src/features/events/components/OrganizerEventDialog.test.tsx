import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrganizerEventDialog } from './OrganizerEventDialog';
import { setMockEvents } from '@/test/setup';
import { eventService } from '@/features/events/services/eventService';

describe('OrganizerEventDialog', () => {
  beforeEach(() => {
    setMockEvents([]);
    vi.clearAllMocks();
  });

  it('renders optional image URL field with default placeholder', () => {
    render(
      <OrganizerEventDialog
        open={true}
        onClose={vi.fn()}
        events={[]}
        onEventCreatedOrUpdated={vi.fn()}
      />
    );

    const imageInput = screen.getByTestId('event-image-url-input');
    expect(imageInput).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/photo-1505373877841-8d25f7d46678/i)).toBeInTheDocument();

    const dateInput = screen.getByTestId('event-date-input').querySelector('input');
    expect(dateInput).toHaveAttribute('type', 'datetime-local');

    const categorySelect = screen.getByTestId('event-category-select');
    expect(categorySelect).toBeInTheDocument();
  });

  it('submits with default image URL when image input is left empty', async () => {
    const createEventSpy = vi.spyOn(eventService, 'createEvent');
    const onCreated = vi.fn();
    const onClose = vi.fn();

    render(
      <OrganizerEventDialog
        open={true}
        onClose={onClose}
        events={[]}
        onEventCreatedOrUpdated={onCreated}
      />
    );

    await userEvent.type(screen.getByLabelText(/Event Title \(English\)/i), 'Go Conference');
    await userEvent.type(screen.getByLabelText(/Esemény címe \(Magyar\)/i), 'Go Konferencia');
    await userEvent.type(screen.getByLabelText(/Description \(English\)/i), 'Great Go event.');
    await userEvent.type(screen.getByLabelText(/Leírás \(Magyar\)/i), 'Nagyszeru Go esemeny.');
    await userEvent.type(screen.getByLabelText(/Venue Name/i), 'Arena');
    await userEvent.type(screen.getByLabelText(/Venue Address/i), 'Main Street 1');

    const submitBtn = screen.getByRole('button', { name: /^Create Event$/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(createEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Go Conference',
          imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80',
        })
      );
      expect(onCreated).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('submits with custom image URL when provided', async () => {
    const createEventSpy = vi.spyOn(eventService, 'createEvent');
    const onCreated = vi.fn();
    const onClose = vi.fn();

    render(
      <OrganizerEventDialog
        open={true}
        onClose={onClose}
        events={[]}
        onEventCreatedOrUpdated={onCreated}
      />
    );

    await userEvent.type(screen.getByLabelText(/Event Title \(English\)/i), 'Rust Summit');
    await userEvent.type(screen.getByLabelText(/Esemény címe \(Magyar\)/i), 'Rust Csúcs');
    await userEvent.type(screen.getByLabelText(/Description \(English\)/i), 'All about Rust.');
    await userEvent.type(screen.getByLabelText(/Leírás \(Magyar\)/i), 'Minden ami Rust.');
    await userEvent.type(screen.getByLabelText(/Venue Name/i), 'Tech Park');
    await userEvent.type(screen.getByLabelText(/Venue Address/i), 'Rust Way 5');

    const imageInput = screen.getByPlaceholderText(/photo-1505373877841-8d25f7d46678/i);
    await userEvent.type(imageInput, 'https://example.com/custom-rust-image.jpg');

    const submitBtn = screen.getByRole('button', { name: /^Create Event$/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(createEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Rust Summit',
          imageUrl: 'https://example.com/custom-rust-image.jpg',
        })
      );
      expect(onCreated).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
