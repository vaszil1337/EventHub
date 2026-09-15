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

/**
 * Validates email format using standard regex
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * TicketService handles ticket issuance, capacity enforcement, and persistence.
 * Completely abstracted from UI components for future Spring Boot backend transition.
 */
export const ticketService = {
  /**
   * Books a ticket for the requested event.
   *
   * BUSINESS RULES:
   * 1. Validates participant name and email.
   * 2. Checks if event exists.
   * 3. Validates capacity: if soldTicketsCount >= venue.capacity, throws CapacityExceededError.
   * 4. Upon success, increments event soldTicketsCount, generates unique ticketCode, and saves ticket.
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
   * Retrieves all purchased tickets.
   */
  async getTickets(): Promise<Ticket[]> {
    const tickets = storage.get<Ticket[]>(STORAGE_KEYS.TICKETS, []);
    return Promise.resolve([...tickets]);
  },

  /**
   * Retrieves tickets for a specific event.
   */
  async getTicketsByEventId(eventId: string): Promise<Ticket[]> {
    const tickets = await this.getTickets();
    return Promise.resolve(tickets.filter((t) => t.eventId === eventId));
  },
};
