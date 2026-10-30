import { describe, it, expect } from 'vitest';
import {
  getLocalizedEventTitle,
  getLocalizedEventDescription,
  getLocalizedTierName,
  getLocalizedTierDescription,
} from './eventLocalization';
import { Event } from '@/features/events/types';

describe('eventLocalization utility', () => {
  const mockEvent: Event = {
    id: 'evt-custom-1',
    title: 'Custom Tech Event',
    titleHu: 'Egyedi Technológiai Esemény',
    description: 'English description of custom event.',
    descriptionHu: 'Egyedi esemény magyar leírása.',
    date: '2026-11-20T10:00:00Z',
    venue: {
      id: 'v1',
      name: 'Test Venue',
      address: 'Test Address',
      capacity: 100,
    },
    soldTicketsCount: 10,
    price: { amount: 50, currency: 'USD' },
  };

  const mockEventWithoutHu: Event = {
    id: 'evt-tech-summit-2026', // matches seedData
    title: 'Tech Horizons Summit 2026',
    description: 'Join leading engineers...',
    date: '2026-10-18T09:00:00Z',
    venue: {
      id: 'v1',
      name: 'Arena',
      address: 'Way',
      capacity: 100,
    },
    soldTicketsCount: 45,
    price: { amount: 120, currency: 'USD' },
  };

  describe('getLocalizedEventTitle', () => {
    it('returns Hungarian title when locale is hu', () => {
      expect(getLocalizedEventTitle(mockEvent, 'hu')).toBe('Egyedi Technológiai Esemény');
    });

    it('returns English title when locale is en', () => {
      expect(getLocalizedEventTitle(mockEvent, 'en')).toBe('Custom Tech Event');
    });

    it('falls back to seed data Hungarian title if event.titleHu is missing', () => {
      expect(getLocalizedEventTitle(mockEventWithoutHu, 'hu')).toBe('Tech Horizontok Csúcstalálkozó 2026');
    });
  });

  describe('getLocalizedEventDescription', () => {
    it('returns Hungarian description when locale is hu', () => {
      expect(getLocalizedEventDescription(mockEvent, 'hu')).toBe('Egyedi esemény magyar leírása.');
    });

    it('returns English description when locale is en', () => {
      expect(getLocalizedEventDescription(mockEvent, 'en')).toBe('English description of custom event.');
    });

    it('falls back to seed data Hungarian description if missing on event', () => {
      const desc = getLocalizedEventDescription(mockEventWithoutHu, 'hu');
      expect(desc).toContain('Csatlakozz vezető mérnökökhöz');
    });
  });

  describe('getLocalizedTierName', () => {
    it('localizes standard tier names to Hungarian', () => {
      expect(getLocalizedTierName('STANDARD', 'hu')).toBe('Standard belépő');
      expect(getLocalizedTierName('Standard Pass', 'hu')).toBe('Standard belépő');
      expect(getLocalizedTierName('early bird', 'hu')).toBe('Early Bird belépő');
      expect(getLocalizedTierName('VIP Priority Pass', 'hu')).toBe('VIP belépő');
      expect(getLocalizedTierName('Student Pass', 'hu')).toBe('Diákjegy');
    });

    it('returns English tier names for en locale', () => {
      expect(getLocalizedTierName('Standard', 'en')).toBe('Standard Pass');
      expect(getLocalizedTierName('Early Bird', 'en')).toBe('Early Bird Pass');
      expect(getLocalizedTierName('VIP', 'en')).toBe('VIP Priority Pass');
      expect(getLocalizedTierName('Student', 'en')).toBe('Student Pass');
    });

    it('returns original custom tier name if not in dictionary', () => {
      expect(getLocalizedTierName('Backstage Workshop Pass', 'hu')).toBe('Backstage Workshop Pass');
      expect(getLocalizedTierName('Press Pass', 'en')).toBe('Press Pass');
    });

    it('handles empty string gracefully', () => {
      expect(getLocalizedTierName('', 'hu')).toBe('');
    });
  });

  describe('getLocalizedTierDescription', () => {
    it('localizes early bird starter description', () => {
      const enDesc = 'Discounted early access pass (-20% discount until 50% venue capacity)';
      expect(getLocalizedTierDescription(enDesc, 'hu')).toBe(
        'Kedvezményes elővételes belépő (-20% kedvezmény a helyszín 50%-os foglaltságáig)'
      );
      expect(getLocalizedTierDescription(enDesc, 'en')).toBe(enDesc);
    });

    it('localizes dynamic surge starter description', () => {
      const enDesc = 'General admission pass (+15% dynamic surge above 80% occupancy)';
      expect(getLocalizedTierDescription(enDesc, 'hu')).toBe(
        'Általános belépőjegy (+15% dinamikus felár 80% feletti foglaltságnál)'
      );
    });

    it('localizes VIP lounge starter description', () => {
      const enDesc = 'Priority front-row seating & VIP networking lounge';
      expect(getLocalizedTierDescription(enDesc, 'hu')).toBe(
        'Kiemelt ülőhely az első sorokban & VIP networking lounge'
      );
    });

    it('returns unmapped custom description unchanged', () => {
      const customDesc = 'Includes backstage tour and lunch with keynote speaker.';
      expect(getLocalizedTierDescription(customDesc, 'hu')).toBe(customDesc);
      expect(getLocalizedTierDescription(customDesc, 'en')).toBe(customDesc);
    });

    it('handles empty string gracefully', () => {
      expect(getLocalizedTierDescription('', 'hu')).toBe('');
    });
  });
});
