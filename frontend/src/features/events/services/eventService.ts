import { Event, CreateEventInput, AddTicketTypeInput } from '@/features/events/types';
import { apiFetch } from '@/shared/services/apiClient';

/**
 * EventService handles all data operations for Events.
 * Communicates directly with the PostgreSQL-backed Spring Boot REST API (/api/events).
 * Role authorization is validated server-side from the signed JWT Bearer token.
 */
export const eventService = {
  /**
   * Fetches all events from the backend REST API.
   */
  async getEvents(): Promise<Event[]> {
    return apiFetch<Event[]>('/events');
  },

  /**
   * Finds an event by its unique ID from the backend REST API.
   */
  async getEventById(id: string): Promise<Event | null> {
    try {
      return await apiFetch<Event>(`/events/${id}`);
    } catch (err: any) {
      if (err?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Creates a new event (requires ORGANIZER JWT token).
   */
  async createEvent(input: CreateEventInput): Promise<Event> {
    return apiFetch<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Updates an existing event (requires ORGANIZER JWT token).
   */
  async updateEvent(id: string, input: Partial<CreateEventInput>): Promise<Event> {
    return apiFetch<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  /**
   * Adds a new ticket type tier to an existing event (requires ORGANIZER JWT token).
   */
  async addTicketType(eventId: string, input: AddTicketTypeInput): Promise<Event> {
    return apiFetch<Event>(`/events/${eventId}/ticket-types`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Resets events back to initial sample seed data in the PostgreSQL database.
   */
  async resetToSeed(): Promise<void> {
    await apiFetch('/events/reset', { method: 'POST' });
  },
};
