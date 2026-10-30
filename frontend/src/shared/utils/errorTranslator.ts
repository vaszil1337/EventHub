/**
 * Helper to translate backend error responses and exceptions into localized user-facing messages.
 */
export function translateBackendMessage(
  rawMessage: string | undefined | null,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (!rawMessage || !rawMessage.trim()) {
    return t('backend_messages.generic_error');
  }

  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes('capacity') ||
    normalized.includes('fully booked') ||
    normalized.includes('no tickets available') ||
    normalized.includes('megtelt')
  ) {
    return t('backend_messages.capacity_exceeded');
  }

  if (
    normalized.includes('invalid email or password') ||
    normalized.includes('invalid credentials') ||
    normalized.includes('érvénytelen e-mail')
  ) {
    return t('backend_messages.invalid_credentials');
  }

  if (
    normalized.includes('already registered') ||
    normalized.includes('user already exists') ||
    normalized.includes('már regisztráltak')
  ) {
    return t('backend_messages.user_already_exists');
  }

  if (
    normalized.includes('unauthorized') ||
    normalized.includes('full authentication is required') ||
    normalized.includes('bejelentkezés szükséges')
  ) {
    return t('backend_messages.unauthorized');
  }

  if (
    normalized.includes('forbidden') ||
    normalized.includes('access is denied') ||
    normalized.includes('organizer role') ||
    normalized.includes('nincs jogosultságod')
  ) {
    return t('backend_messages.forbidden');
  }

  if (
    normalized.includes('event not found') ||
    normalized.includes('nem található')
  ) {
    return t('backend_messages.event_not_found');
  }

  if (
    normalized.includes('already cancelled') ||
    normalized.includes('lemondásra került')
  ) {
    return t('backend_messages.already_cancelled');
  }

  return rawMessage;
}
