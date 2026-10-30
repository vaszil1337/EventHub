import { Money } from '@/shared/types/money';

/**
 * Formats Money object to localized currency string.
 */
export function formatMoney(money: Money, locale: string = 'en'): string {
  try {
    const localeTag = locale === 'hu' ? 'hu-HU' : 'en-US';
    return new Intl.NumberFormat(localeTag, {
      style: 'currency',
      currency: money.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(money.amount);
  } catch {
    return `${money.amount} ${money.currency}`;
  }
}

/**
 * Formats an ISO date string into a friendly display format.
 * e.g., "Saturday, Oct 24, 2026 • 19:00"
 */
export function formatEventDate(isoDateString: string, locale: string = 'en'): string {
  try {
    const date = new Date(isoDateString);
    const localeTag = locale === 'hu' ? 'hu-HU' : 'en-US';
    return new Intl.DateTimeFormat(localeTag, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoDateString;
  }
}
