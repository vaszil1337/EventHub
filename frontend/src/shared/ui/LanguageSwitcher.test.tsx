import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { I18nProvider } from '../context/I18nContext';
import { SettingsDropdown } from './SettingsDropdown';

describe('SettingsDropdown / LanguageSwitcher', () => {
  it('renders settings dropdown with default active EN selection', () => {
    render(
      <I18nProvider>
        <SettingsDropdown />
      </I18nProvider>
    );

    const dropdown = screen.getByTestId('settings-dropdown');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('switches to HU when Hungarian option is selected from dropdown', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <SettingsDropdown />
      </I18nProvider>
    );

    const trigger = screen.getByTestId('settings-dropdown-button');
    await user.click(trigger);

    const huOption = await screen.findByTestId('language-btn-hu');
    await user.click(huOption);

    expect(screen.getByText('HU')).toBeInTheDocument();
  });

  it('renders theme switching options in dropdown menu', async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider>
        <SettingsDropdown />
      </I18nProvider>
    );

    const trigger = screen.getByTestId('settings-dropdown-button');
    await user.click(trigger);

    expect(await screen.findByTestId('theme-btn-light')).toBeInTheDocument();
    expect(await screen.findByTestId('theme-btn-dark')).toBeInTheDocument();
  });
});
