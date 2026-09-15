import { Money } from '@/shared/types/money';

/**
 * Formats Money object to localized currency string.
 */
export function formatMoney(money: Money): string {
  try {
    return new Intl.NumberFormat('en-US', {
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
export function formatEventDate(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat('en-US', {
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
