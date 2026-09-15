import { Event } from '@/features/events/types';
import { storage } from '@/shared/utils/localStorage';
import { STORAGE_KEYS, INITIAL_EVENTS, seedInitialData } from '@/shared/utils/seedData';

/**
 * EventService handles all data operations for Events.
 * Decoupled from UI components to allow future replacement with Spring Boot REST API calls.
 */
export const eventService = {
  /**
   * Fetches all events, ensuring storage is seeded on first access.
   */
  async getEvents(): Promise<Event[]> {
    seedInitialData();
    const events = storage.get<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    return Promise.resolve([...events]);
  },

  /**
   * Finds an event by its unique ID.
   */
  async getEventById(id: string): Promise<Event | null> {
    const events = await this.getEvents();
    const found = events.find((e) => e.id === id);
    return Promise.resolve(found ? { ...found } : null);
  },

  /**
   * Updates an existing event.
   */
  async updateEvent(updatedEvent: Event): Promise<Event> {
    const events = await this.getEvents();
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
   * Resets events back to initial sample seed data.
   */
  async resetToSeed(): Promise<void> {
    seedInitialData(true);
    return Promise.resolve();
  },
};
