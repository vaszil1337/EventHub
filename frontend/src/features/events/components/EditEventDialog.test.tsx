import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditEventDialog } from './EditEventDialog';
import { Event } from '@/features/events/types';
import { setMockEvents } from '@/test/setup';

const mockEvent: Event = {
  id: 'evt-test-1',
  title: 'Cloud Native Summit',
  titleHu: 'Cloud Native Csúcstalálkozó',
  description: 'Original event description.',
  descriptionHu: 'Eredeti magyar leírás.',
  date: '2026-11-20T09:00:00.000Z',
  venue: {
    id: 'venue-1',
    name: 'Millenáris Hall',
    address: 'Budapest',
    capacity: 100,
  },
  soldTicketsCount: 25,
  price: { amount: 80, currency: 'USD' },
  category: 'Technology',
};

describe('EditEventDialog', () => {
  beforeEach(() => {
    setMockEvents([mockEvent]);
  });
  it('renders prefilled form fields with current event data', () => {
    render(
      <EditEventDialog
        open={true}
        event={mockEvent}
        onClose={vi.fn()}
        onEventUpdated={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Edit Event/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cloud Native Summit')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cloud Native Csúcstalálkozó')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Original event description.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Eredeti magyar leírás.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Millenáris Hall')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Budapest')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  it('rejects capacity smaller than already sold tickets', async () => {
    const user = userEvent.setup();
    render(
      <EditEventDialog
        open={true}
        event={mockEvent}
        onClose={vi.fn()}
        onEventUpdated={vi.fn()}
      />
    );

    const capacityInput = screen.getByLabelText(/Venue Capacity/i);
    await user.clear(capacityInput);
    await user.type(capacityInput, '10'); // 10 < 25 sold tickets!

    const submitBtn = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Venue capacity cannot be less than already reserved seats/i)).toBeInTheDocument();
  });

  it('validates required Hungarian and English titles and descriptions', async () => {
    const user = userEvent.setup();
    render(
      <EditEventDialog
        open={true}
        event={mockEvent}
        onClose={vi.fn()}
        onEventUpdated={vi.fn()}
      />
    );

    const titleHuInput = screen.getByLabelText(/Esemény címe \(Magyar\)/i);
    await user.clear(titleHuInput);
    await user.type(titleHuInput, '   ');

    const submitBtn = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Both English and Hungarian titles are required/i)).toBeInTheDocument();
  });

  it('submits valid updates and invokes onEventUpdated callback', async () => {
    const user = userEvent.setup();
    const handleUpdated = vi.fn();
    const handleClose = vi.fn();

    render(
      <EditEventDialog
        open={true}
        event={mockEvent}
        onClose={handleClose}
        onEventUpdated={handleUpdated}
      />
    );

    const titleInput = screen.getByLabelText(/Event Title \(English\)/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Summit Title');

    const titleHuInput = screen.getByLabelText(/Esemény címe \(Magyar\)/i);
    await user.clear(titleHuInput);
    await user.type(titleHuInput, 'Frissített Csúcstalálkozó Cím');

    const submitBtn = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleUpdated).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Summit Title',
          titleHu: 'Frissített Csúcstalálkozó Cím',
        })
      );
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
