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
 * TicketService handles ticket issuance, cancellation, capacity enforcement, and persistence.
 * Communicates directly with the PostgreSQL-backed Spring Boot REST API (/api/tickets).
 */
export const ticketService = {
  /**
   * Books a ticket for the requested event via the backend REST API.
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
      const payload: Record<string, string> = {
        eventId: request.eventId,
        participantName: trimmedName,
        participantEmail: trimmedEmail,
      };
      if (request.ticketTypeId) {
        payload.ticketTypeId = request.ticketTypeId;
      }
      if (request.locale) {
        payload.locale = request.locale;
      }
      return await apiFetch<Ticket>('/tickets/book', {
        method: 'POST',
        body: JSON.stringify(payload),
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
   * Cancels a booked ticket and releases its seat capacity on the backend.
   */
  async cancelTicket(ticketId: string): Promise<Ticket> {
    return apiFetch<Ticket>(`/tickets/${ticketId}/cancel`, {
      method: 'POST',
    });
  },

  /**
   * Retrieves purchased tickets from the backend (optionally filtered by participant email).
   */
  async getTickets(participantEmail?: string): Promise<Ticket[]> {
    if (participantEmail && participantEmail.trim()) {
      const encoded = encodeURIComponent(participantEmail.trim());
      return apiFetch<Ticket[]>(`/tickets?email=${encoded}`);
    }
    return apiFetch<Ticket[]>('/tickets');
  },

  /**
   * Retrieves tickets for a specific event from the backend.
   */
  async getTicketsByEventId(eventId: string): Promise<Ticket[]> {
    return apiFetch<Ticket[]>(`/tickets/event/${eventId}`);
  },
};
