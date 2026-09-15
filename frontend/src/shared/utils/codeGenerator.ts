/**
 * Generates a unique ticket code in the format: EVT-YYYY-XXXX
 * Example: EVT-2026-A8K2
 */
export function generateTicketCode(year = new Date().getFullYear()): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like 0/O, 1/I
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    suffix += characters.charAt(randomIndex);
  }
  return `EVT-${year}-${suffix}`;
}

/**
 * Generates a random unique ID (for entities)
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
}
