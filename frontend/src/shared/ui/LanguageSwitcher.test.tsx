import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { I18nProvider } from '../context/I18nContext';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('renders language switcher with default active EN selection', () => {
    render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>
    );

    const switcher = screen.getByTestId('language-switcher');
    expect(switcher).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('switches to HU when Hungarian option is selected from dropdown', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <LanguageSwitcher />
      </I18nProvider>
    );

    const selectTrigger = screen.getByRole('combobox');
    await user.click(selectTrigger);

    const huOption = await screen.findByTestId('language-btn-hu');
    await user.click(huOption);

    expect(screen.getByText('HU')).toBeInTheDocument();
  });
});
