import { Event } from '@/features/events/types';
import { storage } from '@/shared/utils/localStorage';
import { STORAGE_KEYS, INITIAL_EVENTS, seedInitialData } from '@/shared/utils/seedData';
import { apiFetch } from '@/shared/services/apiClient';

/**
 * EventService handles all data operations for Events.
 * Integrated with Spring Boot REST API (/api/events) with local storage cache fallback.
 */
export const eventService = {
  /**
   * Fetches all events from the backend REST API, falling back to local storage if offline.
   */
  async getEvents(): Promise<Event[]> {
    try {
      const events = await apiFetch<Event[]>('/events');
      if (Array.isArray(events) && events.length > 0) {
        storage.set(STORAGE_KEYS.EVENTS, events);
        return [...events];
      }
    } catch {
      // Graceful offline/test fallback
    }

    seedInitialData();
    const localEvents = storage.get<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    return Promise.resolve([...localEvents]);
  },

  /**
   * Finds an event by its unique ID.
   */
  async getEventById(id: string): Promise<Event | null> {
    try {
      const event = await apiFetch<Event>(`/events/${id}`);
      if (event && event.id) {
        return event;
      }
    } catch (err: any) {
      if (err?.status === 404) {
        return null;
      }
      // Graceful fallback
    }

    const events = await this.getEvents();
    const found = events.find((e) => e.id === id);
    return Promise.resolve(found ? { ...found } : null);
  },

  /**
   * Updates an existing event in local storage / sync.
   */
  async updateEvent(updatedEvent: Event): Promise<Event> {
    const events = storage.get<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const index = events.findIndex((e) => e.id === updatedEvent.id);

    if (index === -1) {
      throw new Error(`Event with ID "${updatedEvent.id}" not found.`);
    }

    const newEvents = [...events];
    newEvents[index] = { ...updatedEvent };
    storage.set(STORAGE_KEYS.EVENTS, newEvents);

    return Promise.resolve({ ...newEvents[index] });
  },

  /**
   * Resets events back to initial sample seed data on the backend and locally.
   */
  async resetToSeed(): Promise<void> {
    try {
      await apiFetch('/events/reset', { method: 'POST' });
    } catch {
      // Offline fallback
    }
    seedInitialData(true);
    return Promise.resolve();
  },
};
