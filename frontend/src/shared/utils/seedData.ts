import { Event } from '@/features/events/types';
import { storage } from './localStorage';

export const STORAGE_KEYS = {
  EVENTS: 'eventhub_events',
  TICKETS: 'eventhub_tickets',
} as const;

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt-tech-summit-2026',
    title: 'Tech Horizons Summit 2026',
    description:
      'Join leading engineers, product innovators, and researchers for keynotes on cutting-edge cloud architectures, TypeScript, and modern web platforms.',
    date: '2026-10-18T09:00:00.000Z',
    venue: {
      id: 'venue-grand-hall',
      name: 'Grand Tech Arena',
      address: '101 Innovation Way, Silicon Quarter',
      capacity: 100,
    },
    soldTicketsCount: 45,
    price: {
      amount: 120,
      currency: 'USD',
    },
    category: 'Technology',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'evt-jazz-night-2026',
    title: 'Smooth Jazz & Soul Evening',
    description:
      'An intimate acoustic evening featuring world-class jazz musicians and soul vocalists in an acoustic-tuned venue.',
    date: '2026-11-05T19:30:00.000Z',
    venue: {
      id: 'venue-blue-note',
      name: 'Blue Note Lounge',
      address: '42 Harmon Street, Downtown Arts District',
      capacity: 30,
    },
    soldTicketsCount: 28,
    price: {
      amount: 35,
      currency: 'USD',
    },
    category: 'Music',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'evt-ai-masterclass-2026',
    title: 'Executive AI & Deep Learning Masterclass',
    description:
      'Intensive hands-on masterclass on neural architecture design, reasoning models, and enterprise deployment strategies.',
    date: '2026-11-20T10:00:00.000Z',
    venue: {
      id: 'venue-silicon-hub',
      name: 'Silicon Conference Hub',
      address: '740 AI Parkway, Building B',
      capacity: 50,
    },
    soldTicketsCount: 50, // Fully booked to test capacity limit!
    price: {
      amount: 250,
      currency: 'USD',
    },
    category: 'Workshop',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
  },
];

/**
 * Ensures initial seed data is loaded into localStorage if no events exist yet.
 * Can also be forced to reset demo data.
 */
export function seedInitialData(forceReset = false): void {
  const existingEvents = storage.get<Event[] | null>(STORAGE_KEYS.EVENTS, null);
  if (!existingEvents || existingEvents.length === 0 || forceReset) {
    storage.set(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    if (forceReset) {
      storage.remove(STORAGE_KEYS.TICKETS);
    }
  }
}
