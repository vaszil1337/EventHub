import { describe, it, expect, beforeEach } from 'vitest';
import { ticketService } from './ticketService';
import { eventService } from '@/features/events/services/eventService';
import { CapacityExceededError, BookingValidationError } from '@/features/ticket-booking/types';

describe('ticketService', () => {
  beforeEach(async () => {
    await eventService.resetToSeed();
  });

  describe('Critical Business Rule: Capacity Constraint', () => {
    it('throws CapacityExceededError when booking a fully booked event (50/50)', async () => {
      // Event 3 is 'evt-ai-masterclass-2026' seeded with 50/50 tickets sold
      const fullyBookedEventId = 'evt-ai-masterclass-2026';

      const initialEvent = await eventService.getEventById(fullyBookedEventId);
      expect(initialEvent).not.toBeNull();
      expect(initialEvent?.soldTicketsCount).toBe(50);
      expect(initialEvent?.venue.capacity).toBe(50);

      // Attempt booking
      await expect(
        ticketService.bookTicket({
          eventId: fullyBookedEventId,
          participantName: 'Alice Johnson',
          participantEmail: 'alice@example.com',
        })
      ).rejects.toThrow(CapacityExceededError);

      // Verify soldTicketsCount was NOT incremented
      const eventAfter = await eventService.getEventById(fullyBookedEventId);
      expect(eventAfter?.soldTicketsCount).toBe(50);

      // Verify no ticket was persisted
      const tickets = await ticketService.getTicketsByEventId(fullyBookedEventId);
      expect(tickets).toHaveLength(0);
    });

    it('successfully books a ticket when capacity is available and increments soldTicketsCount', async () => {
      // Event 2 is 'evt-jazz-night-2026' with 28/30 (upcoming)
      const availableEventId = 'evt-jazz-night-2026';

      const ticket = await ticketService.bookTicket({
        eventId: availableEventId,
        participantName: 'Bob Smith',
        participantEmail: 'bob.smith@techcorp.io',
      });

      // Verify ticket properties
      expect(ticket).toBeDefined();
      expect(ticket.participantName).toBe('Bob Smith');
      expect(ticket.participantEmail).toBe('bob.smith@techcorp.io');
      expect(ticket.eventId).toBe(availableEventId);
      expect(ticket.ticketCode).toMatch(/^EVT-\d{4}-[A-Z0-9]{4}$/);
      expect(ticket.price.amount).toBe(35);
      expect(ticket.price.currency).toBe('USD');

      // Verify event sold count was incremented from 28 to 29
      const updatedEvent = await eventService.getEventById(availableEventId);
      expect(updatedEvent?.soldTicketsCount).toBe(29);

      // Verify ticket was saved in storage
      const savedTickets = await ticketService.getTickets();
      expect(savedTickets).toHaveLength(1);
      expect(savedTickets[0].ticketCode).toBe(ticket.ticketCode);
    });

    it('throws BookingValidationError when attempting to book a ticket for a past event', async () => {
      // Event 1 is 'evt-tech-summit-2026' with date in October 2026 (past)
      const pastEventId = 'evt-tech-summit-2026';

      await expect(
        ticketService.bookTicket({
          eventId: pastEventId,
          participantName: 'Late Booker',
          participantEmail: 'late@techcorp.io',
        })
      ).rejects.toThrow(/already ended/i);
    });

    it('successfully cancels a ticket for an upcoming event and decrements sold count', async () => {
      const availableEventId = 'evt-jazz-night-2026';
      const ticket = await ticketService.bookTicket({
        eventId: availableEventId,
        participantName: 'Cancel Test User',
        participantEmail: 'cancel@jazz.fm',
      });

      expect(ticket.status).toBe('VALID');
      const eventBefore = await eventService.getEventById(availableEventId);
      expect(eventBefore?.soldTicketsCount).toBe(29);

      const cancelledTicket = await ticketService.cancelTicket(ticket.id);
      expect(cancelledTicket.status).toBe('CANCELLED');

      const eventAfter = await eventService.getEventById(availableEventId);
      expect(eventAfter?.soldTicketsCount).toBe(28);
    });

    it('throws error when attempting to cancel a ticket for a past event', async () => {
      // Temporarily update past event to book a ticket, then revert to past date
      const pastEvent = await eventService.getEventById('evt-tech-summit-2026');
      expect(pastEvent).toBeDefined();

      // We can update date to future, book, then update back to past date
      await eventService.updateEvent('evt-tech-summit-2026', {
        date: '2026-11-20T10:00:00.000Z',
      });
      const ticket = await ticketService.bookTicket({
        eventId: 'evt-tech-summit-2026',
        participantName: 'Attendee',
        participantEmail: 'attendee@techsummit.io',
      });

      // Now set date back to past
      await eventService.updateEvent('evt-tech-summit-2026', {
        date: '2026-10-18T09:00:00.000Z',
      });

      // Attempting cancellation must fail
      await expect(
        ticketService.cancelTicket(ticket.id)
      ).rejects.toThrow(/already ended/i);
    });

    it('enforces capacity limit when last available tickets are purchased', async () => {
      // Event 2 is 'evt-jazz-night-2026' with capacity 30 and 28 sold (2 remaining)
      const eventId = 'evt-jazz-night-2026';

      // 1st booking: 29/30
      const ticket1 = await ticketService.bookTicket({
        eventId,
        participantName: 'Listener One',
        participantEmail: 'listener1@jazz.fm',
      });
      expect(ticket1).toBeDefined();

      let event = await eventService.getEventById(eventId);
      expect(event?.soldTicketsCount).toBe(29);

      // 2nd booking: 30/30 (reaches full capacity)
      const ticket2 = await ticketService.bookTicket({
        eventId,
        participantName: 'Listener Two',
        participantEmail: 'listener2@jazz.fm',
      });
      expect(ticket2).toBeDefined();

      event = await eventService.getEventById(eventId);
      expect(event?.soldTicketsCount).toBe(30);

      // 3rd booking: MUST FAIL as event is now 30/30
      await expect(
        ticketService.bookTicket({
          eventId,
          participantName: 'Listener Three',
          participantEmail: 'listener3@jazz.fm',
        })
      ).rejects.toThrow(CapacityExceededError);

      // Remains at 30
      event = await eventService.getEventById(eventId);
      expect(event?.soldTicketsCount).toBe(30);
    });
  });

  describe('Validation & Edge Cases', () => {
    it('throws BookingValidationError when participant name is empty or whitespace', async () => {
      await expect(
        ticketService.bookTicket({
          eventId: 'evt-jazz-night-2026',
          participantName: '   ',
          participantEmail: 'valid@example.com',
        })
      ).rejects.toThrow(BookingValidationError);
    });

    it('throws BookingValidationError when email is missing or has invalid format', async () => {
      await expect(
        ticketService.bookTicket({
          eventId: 'evt-jazz-night-2026',
          participantName: 'Valid Name',
          participantEmail: 'not-an-email',
        })
      ).rejects.toThrow(BookingValidationError);
    });

    it('throws error when event ID is not found', async () => {
      await expect(
        ticketService.bookTicket({
          eventId: 'non-existent-event',
          participantName: 'Valid Name',
          participantEmail: 'valid@example.com',
        })
      ).rejects.toThrow('does not exist');
    });
  });
});
