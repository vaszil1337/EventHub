import { describe, it, expect } from 'vitest';
import { translateBackendMessage } from './errorTranslator';
import { en } from '../locales/en';
import { hu } from '../locales/hu';

describe('errorTranslator', () => {
  const enTranslate = (key: string) => {
    const parts = key.split('.');
    let curr: any = en;
    for (const p of parts) curr = curr?.[p];
    return curr || key;
  };

  const huTranslate = (key: string) => {
    const parts = key.split('.');
    let curr: any = hu;
    for (const p of parts) curr = curr?.[p];
    return curr || key;
  };

  it('translates capacity exceeded errors to localized text', () => {
    const raw = 'Event has reached full capacity. No tickets available.';
    expect(translateBackendMessage(raw, enTranslate)).toBe(en.backend_messages.capacity_exceeded);
    expect(translateBackendMessage(raw, huTranslate)).toBe(hu.backend_messages.capacity_exceeded);
  });

  it('translates invalid credentials error', () => {
    const raw = 'Invalid email or password.';
    expect(translateBackendMessage(raw, enTranslate)).toBe(en.backend_messages.invalid_credentials);
    expect(translateBackendMessage(raw, huTranslate)).toBe(hu.backend_messages.invalid_credentials);
  });

  it('translates user already registered error', () => {
    const raw = 'A user with email "test@example.com" is already registered.';
    expect(translateBackendMessage(raw, enTranslate)).toBe(en.backend_messages.user_already_exists);
    expect(translateBackendMessage(raw, huTranslate)).toBe(hu.backend_messages.user_already_exists);
  });

  it('translates forbidden role error', () => {
    const raw = 'Access is denied (requires ORGANIZER role)';
    expect(translateBackendMessage(raw, enTranslate)).toBe(en.backend_messages.forbidden);
    expect(translateBackendMessage(raw, huTranslate)).toBe(hu.backend_messages.forbidden);
  });

  it('falls back to generic error when message is empty or null', () => {
    expect(translateBackendMessage('', enTranslate)).toBe(en.backend_messages.generic_error);
    expect(translateBackendMessage(null, huTranslate)).toBe(hu.backend_messages.generic_error);
  });

  it('preserves custom message when it does not match known error patterns', () => {
    const custom = 'Specific custom error message from 3rd party';
    expect(translateBackendMessage(custom, enTranslate)).toBe(custom);
  });
});
