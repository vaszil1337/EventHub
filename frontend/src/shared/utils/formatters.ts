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

/**
 * Converts an ISO string (or Date string) into 'YYYY-MM-DDTHH:mm' for datetime-local input.
 */
export function toDatetimeLocalValue(isoOrDateString?: string): string {
  if (!isoOrDateString) return '';
  const date = new Date(isoOrDateString);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Converts a datetime-local input value ('YYYY-MM-DDTHH:mm') into an ISO-8601 UTC string.
 */
export function fromDatetimeLocalValue(datetimeLocalString: string): string {
  if (!datetimeLocalString) return new Date().toISOString();
  const date = new Date(datetimeLocalString);
  if (isNaN(date.getTime())) return datetimeLocalString;
  return date.toISOString();
}

/**
 * Checks if an event ISO date string represents a date/time in the past compared to now.
 */
export function isEventPast(isoDateString?: string | null): boolean {
  if (!isoDateString) return false;
  const eventTime = new Date(isoDateString).getTime();
  if (isNaN(eventTime)) return false;
  return eventTime < Date.now();
}
