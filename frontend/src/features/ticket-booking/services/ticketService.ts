import {
  Ticket,
  BookingRequest,
  CapacityExceededError,
  BookingValidationError,
} from '@/features/ticket-booking/types';
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
 * Communicates directly with the PostgreSQL-backed Spring Boot REST API (/api/tickets).
 */
export const ticketService = {
  /**
   * Books a ticket for the requested event via the backend REST API.
   *
   * BUSINESS RULES:
   * 1. Validates participant name and email format on client.
   * 2. Checks if event ID is provided.
   * 3. Sends booking command to backend (POST /api/tickets/book).
   * 4. Converts 409 Conflict to CapacityExceededError.
   * 5. Converts 400 Bad Request to BookingValidationError.
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
      return await apiFetch<Ticket>('/tickets/book', {
        method: 'POST',
        body: JSON.stringify({
          eventId: request.eventId,
          participantName: trimmedName,
          participantEmail: trimmedEmail,
        }),
      });
    } catch (err: any) {
      if (err?.status === 409) {
        throw new CapacityExceededError(
          err?.body?.message || err?.message || 'Event has reached full capacity. No tickets available.'
        );
      }
      if (err?.status === 400) {
        throw new BookingValidationError(err?.body?.message || err?.message || 'Invalid booking data.');
      }
      throw err;
    }
  },

  /**
   * Retrieves all purchased tickets from the backend.
   */
  async getTickets(): Promise<Ticket[]> {
    return apiFetch<Ticket[]>('/tickets');
  },

  /**
   * Retrieves tickets for a specific event from the backend.
   */
  async getTicketsByEventId(eventId: string): Promise<Ticket[]> {
    return apiFetch<Ticket[]>(`/tickets/event/${eventId}`);
  },
};
