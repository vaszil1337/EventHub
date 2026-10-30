import { Event } from '@/features/events/types';
import { Locale } from '@/shared/locales/types';
import { en } from '@/shared/locales/en';
import { hu } from '@/shared/locales/hu';
import { INITIAL_EVENTS } from './seedData';

const DICTIONARIES = { en, hu } as const;

// Fast O(1) lookup table for seeded events fallback
const INITIAL_EVENTS_MAP = new Map(INITIAL_EVENTS.map((e) => [e.id, e]));

/**
 * Returns the localized event title based on the active locale.
 * Fallback priority: event.titleHu -> seeded initial events map -> default title.
 */
export function getLocalizedEventTitle(event: Event, locale: Locale): string {
  if (locale === 'hu') {
    return event.titleHu?.trim() || INITIAL_EVENTS_MAP.get(event.id)?.titleHu || event.title;
  }
  return event.title;
}

/**
 * Returns the localized event description based on the active locale.
 * Fallback priority: event.descriptionHu -> seeded initial events map -> default description.
 */
export function getLocalizedEventDescription(event: Event, locale: Locale): string {
  if (locale === 'hu') {
    return event.descriptionHu?.trim() || INITIAL_EVENTS_MAP.get(event.id)?.descriptionHu || event.description;
  }
  return event.description;
}

/**
 * Normalization map associating known tier name variants to dictionary keys.
 */
const TIER_KEY_MAP: Record<string, keyof typeof en.tiers> = {
  standard: 'standardPass',
  'standard pass': 'standardPass',
  'early bird': 'earlyBirdPass',
  'early bird pass': 'earlyBirdPass',
  vip: 'vipPass',
  'vip pass': 'vipPass',
  'vip priority pass': 'vipPass',
  student: 'studentPass',
  'student pass': 'studentPass',
};

/**
 * Returns the localized ticket tier name based on active locale using dictionary lookup.
 */
export function getLocalizedTierName(tierName: string, locale: Locale): string {
  if (!tierName) return '';
  const normalized = tierName.trim().toLowerCase();
  const key = TIER_KEY_MAP[normalized];
  return key ? DICTIONARIES[locale]?.tiers[key] ?? tierName : tierName;
}

/**
 * Declarative matcher table for recognizing known starter tier descriptions.
 */
const DESCRIPTION_MATCHERS: Array<{
  matcher: RegExp;
  key: keyof typeof en.tiers;
}> = [
  { matcher: /early access|-20%/i, key: 'descEarlyBird' },
  { matcher: /\+15%|above 80% occupancy/i, key: 'descStandardSurge' },
  { matcher: /general admission/i, key: 'descStandardGeneral' },
  { matcher: /priority front-row|networking lounge/i, key: 'descVipLounge' },
];

/**
 * Returns the localized ticket tier description based on active locale using declarative patterns.
 */
export function getLocalizedTierDescription(description: string, locale: Locale): string {
  if (!description) return '';
  const match = DESCRIPTION_MATCHERS.find((item) => item.matcher.test(description));
  return match ? DICTIONARIES[locale]?.tiers[match.key] ?? description : description;
}
