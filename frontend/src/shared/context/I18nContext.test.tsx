import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { I18nProvider, useTranslation, LANGUAGE_STORAGE_KEY } from './I18nContext';

const TestComponent = () => {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div>
      <span data-testid="current-locale">{locale}</span>
      <span data-testid="translated-common">{t('common.save')}</span>
      <span data-testid="translated-param">{t('auth.welcomeBack', { name: 'Alice' })}</span>
      <span data-testid="translated-fallback">{t('unknown.nested.key')}</span>
      <button onClick={() => setLocale('hu')} data-testid="switch-to-hu">
        Switch to HU
      </button>
      <button onClick={() => setLocale('en')} data-testid="switch-to-en">
        Switch to EN
      </button>
    </div>
  );
};

describe('I18nContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('provides default English locale and translations when localStorage is empty', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('current-locale').textContent).toBe('en');
    expect(screen.getByTestId('translated-common').textContent).toBe('Save');
    expect(screen.getByTestId('translated-param').textContent).toBe('Welcome back, Alice!');
  });

  it('switches locale to Hungarian and updates localStorage and document lang', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    await act(async () => {
      await user.click(screen.getByTestId('switch-to-hu'));
    });

    expect(screen.getByTestId('current-locale').textContent).toBe('hu');
    expect(screen.getByTestId('translated-common').textContent).toBe('Mentés');
    expect(screen.getByTestId('translated-param').textContent).toBe('Üdv újra, Alice!');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('hu');
    expect(document.documentElement.lang).toBe('hu');
  });

  it('restores saved locale from localStorage on initial render', () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'hu');

    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('current-locale').textContent).toBe('hu');
    expect(screen.getByTestId('translated-common').textContent).toBe('Mentés');
  });

  it('returns raw key if translation key does not exist', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByTestId('translated-fallback').textContent).toBe('unknown.nested.key');
  });
});
