import { Event } from '@/features/events/types';
import { Locale } from '@/shared/locales/types';
import { INITIAL_EVENTS } from './seedData';

/**
 * Returns the localized event title based on the active locale.
 * If titleHu is not populated from backend response, falls back to seeded initial events by ID or title.
 */
export function getLocalizedEventTitle(event: Event, locale: Locale): string {
  if (locale === 'hu') {
    if (event.titleHu && event.titleHu.trim()) {
      return event.titleHu;
    }
    const seed = INITIAL_EVENTS.find((e) => e.id === event.id || e.title === event.title);
    if (seed?.titleHu) {
      return seed.titleHu;
    }
  }
  return event.title;
}

/**
 * Returns the localized event description based on the active locale.
 * If descriptionHu is not populated from backend response, falls back to seeded initial events by ID or title.
 */
export function getLocalizedEventDescription(event: Event, locale: Locale): string {
  if (locale === 'hu') {
    if (event.descriptionHu && event.descriptionHu.trim()) {
      return event.descriptionHu;
    }
    const seed = INITIAL_EVENTS.find((e) => e.id === event.id || e.title === event.title);
    if (seed?.descriptionHu) {
      return seed.descriptionHu;
    }
  }
  return event.description;
}
