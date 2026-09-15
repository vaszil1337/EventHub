import { describe, it, expect, beforeEach } from 'vitest';
import { ticketService } from './ticketService';
import { eventService } from '@/features/events/services/eventService';
import { CapacityExceededError, BookingValidationError } from '@/features/ticket-booking/types';

describe('ticketService', () => {
  beforeEach(async () => {
    localStorage.clear();
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
      // Event 1 is 'evt-tech-summit-2026' with 45/100
      const availableEventId = 'evt-tech-summit-2026';

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
      expect(ticket.price.amount).toBe(120);
      expect(ticket.price.currency).toBe('USD');

      // Verify event sold count was incremented from 45 to 46
      const updatedEvent = await eventService.getEventById(availableEventId);
      expect(updatedEvent?.soldTicketsCount).toBe(46);

      // Verify ticket was saved in storage
      const savedTickets = await ticketService.getTickets();
      expect(savedTickets).toHaveLength(1);
      expect(savedTickets[0].ticketCode).toBe(ticket.ticketCode);
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
          eventId: 'evt-tech-summit-2026',
          participantName: '   ',
          participantEmail: 'valid@example.com',
        })
      ).rejects.toThrow(BookingValidationError);
    });

    it('throws BookingValidationError when email is missing or has invalid format', async () => {
      await expect(
        ticketService.bookTicket({
          eventId: 'evt-tech-summit-2026',
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
