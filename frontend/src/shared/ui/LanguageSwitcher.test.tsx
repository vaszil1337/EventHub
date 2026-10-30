import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { I18nProvider } from '../context/I18nContext';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('renders language switcher with default active EN button', () => {
    render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>
    );

    const switcher = screen.getByTestId('language-switcher');
    expect(switcher).toBeInTheDocument();

    const enBtn = screen.getByTestId('language-btn-en');
    const huBtn = screen.getByTestId('language-btn-hu');

    expect(enBtn).toHaveAttribute('aria-pressed', 'true');
    expect(huBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to HU when Hungarian button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>
    );

    const huBtn = screen.getByTestId('language-btn-hu');
    const enBtn = screen.getByTestId('language-btn-en');

    await act(async () => {
      await user.click(huBtn);
    });

    expect(huBtn).toHaveAttribute('aria-pressed', 'true');
    expect(enBtn).toHaveAttribute('aria-pressed', 'false');
  });
});
