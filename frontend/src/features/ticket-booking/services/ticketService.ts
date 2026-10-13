import {
  Ticket,
  BookingRequest,
  CapacityExceededError,
  BookingValidationError,
} from '@/features/ticket-booking/types';
import { eventService } from '@/features/events/services/eventService';
import { storage } from '@/shared/utils/localStorage';
import { STORAGE_KEYS } from '@/shared/utils/seedData';
import { generateTicketCode, generateId } from '@/shared/utils/codeGenerator';
import { apiFetch } from '@/shared/services/apiClient';

/**
 * Validates email format using standard regex
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * TicketService handles ticket issuance, capacity enforcement, and persistence.
 * Integrated with Spring Boot Hexagonal Backend REST API (/api/tickets).
 */
export const ticketService = {
  /**
   * Books a ticket for the requested event.
   *
   * BUSINESS RULES:
   * 1. Validates participant name and email format.
   * 2. Checks if event exists.
   * 3. Validates capacity: if soldTicketsCount >= venue.capacity, throws CapacityExceededError.
   * 4. Integrates with Spring Boot backend POST /api/tickets/book, with graceful fallback.
   */
  async bookTicket(request: BookingRequest): Promise<Ticket> {
    const trimmedName = request.participantName?.trim();
    const trimmedEmail = request.participantEmail?.trim();

    if (!trimmedName) {
      throw new BookingValidationError('Participant name is required.');
    }

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      throw new BookingValidationError('A valid participant email is required.');
    }

    if (!request.eventId) {
      throw new BookingValidationError('Event ID is required.');
    }

    try {
      const bookedTicket = await apiFetch<Ticket>('/tickets/book', {
        method: 'POST',
        body: JSON.stringify({
          eventId: request.eventId,
          participantName: trimmedName,
          participantEmail: trimmedEmail,
        }),
      });

      if (bookedTicket && bookedTicket.ticketCode) {
        // Synchronize local storage ticket cache
        const existingTickets = storage.get<Ticket[]>(STORAGE_KEYS.TICKETS, []);
        storage.set(STORAGE_KEYS.TICKETS, [bookedTicket, ...existingTickets]);

        // Synchronize event counter in local cache
        const events = await eventService.getEvents();
        const event = events.find((e) => e.id === request.eventId);
        if (event) {
          await eventService.updateEvent({
            ...event,
            soldTicketsCount: event.soldTicketsCount + 1,
          });
        }

        return bookedTicket;
      }
    } catch (err: any) {
      if (err?.status === 409) {
        throw new CapacityExceededError(
          err?.body?.message || err?.message || 'Event has reached full capacity. No tickets available.'
        );
      }
      if (err?.status === 400) {
        throw new BookingValidationError(err?.body?.message || err?.message || 'Invalid booking data.');
      }
      // If network error / backend offline, proceed with local fallback below
    }

    // Client-side fallback for offline / test environments
    const event = await eventService.getEventById(request.eventId);
    if (!event) {
      throw new Error(`Event with ID "${request.eventId}" does not exist.`);
    }

    // Critical Business Rule: Capacity Constraint
    if (event.soldTicketsCount >= event.venue.capacity) {
      throw new CapacityExceededError(
        `Event "${event.title}" is fully booked (${event.soldTicketsCount}/${event.venue.capacity} seats taken). No tickets available.`
      );
    }

    // Generate unique ticket code
    const ticketCode = generateTicketCode();

    // Create ticket record
    const newTicket: Ticket = {
      id: generateId(),
      eventId: event.id,
      participantName: trimmedName,
      participantEmail: trimmedEmail,
      ticketCode,
      price: { ...event.price },
      purchaseDate: new Date().toISOString(),
    };

    // Update event sold count
    const updatedEvent = {
      ...event,
      soldTicketsCount: event.soldTicketsCount + 1,
    };
    await eventService.updateEvent(updatedEvent);

    // Save ticket in storage
    const existingTickets = storage.get<Ticket[]>(STORAGE_KEYS.TICKETS, []);
    storage.set(STORAGE_KEYS.TICKETS, [newTicket, ...existingTickets]);

    return Promise.resolve(newTicket);
  },

  /**
   * Retrieves all purchased tickets from backend or storage.
   */
  async getTickets(): Promise<Ticket[]> {
    try {
      const tickets = await apiFetch<Ticket[]>('/tickets');
      if (Array.isArray(tickets)) {
        storage.set(STORAGE_KEYS.TICKETS, tickets);
        return [...tickets];
      }
    } catch {
      // Offline fallback
    }

    const localTickets = storage.get<Ticket[]>(STORAGE_KEYS.TICKETS, []);
    return Promise.resolve([...localTickets]);
  },

  /**
   * Retrieves tickets for a specific event.
   */
  async getTicketsByEventId(eventId: string): Promise<Ticket[]> {
    try {
      const tickets = await apiFetch<Ticket[]>(`/tickets/event/${eventId}`);
      if (Array.isArray(tickets)) {
        return [...tickets];
      }
    } catch {
      // Offline fallback
    }

    const tickets = await this.getTickets();
    return Promise.resolve(tickets.filter((t) => t.eventId === eventId));
  },
};
