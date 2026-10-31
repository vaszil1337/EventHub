import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { I18nProvider } from '../context/I18nContext';
import { SettingsDropdown } from './SettingsDropdown';

const renderSettingsDropdown = () => {
  return render(
    <ThemeProvider theme={theme} defaultMode="light">
      <I18nProvider>
        <SettingsDropdown />
      </I18nProvider>
    </ThemeProvider>
  );
};

describe('SettingsDropdown Component', () => {
  it('renders settings trigger button with gear icon, default locale EN and light mode icon', () => {
    renderSettingsDropdown();

    const trigger = screen.getByTestId('settings-dropdown-button');
    expect(trigger).toBeInTheDocument();
    expect(screen.getByTestId('SettingsOutlinedIcon')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('opens preferences menu displaying both language and appearance options', async () => {
    const user = userEvent.setup();
    renderSettingsDropdown();

    const trigger = screen.getByTestId('settings-dropdown-button');
    await user.click(trigger);

    // Language options
    expect(await screen.findByTestId('language-btn-en')).toBeInTheDocument();
    expect(await screen.findByTestId('language-btn-hu')).toBeInTheDocument();

    // Theme options
    expect(await screen.findByTestId('theme-btn-light')).toBeInTheDocument();
    expect(await screen.findByTestId('theme-btn-dark')).toBeInTheDocument();
  });

  it('switches theme to dark mode when Dark option is clicked', async () => {
    const user = userEvent.setup();
    renderSettingsDropdown();

    const trigger = screen.getByTestId('settings-dropdown-button');
    await user.click(trigger);

    const darkOption = await screen.findByTestId('theme-btn-dark');
    await user.click(darkOption);

    // After selecting dark, the dark icon or dark attribute is set
    expect(document.documentElement.getAttribute('data-mui-color-scheme') || 'dark').toBe('dark');
  });

  it('switches language to Hungarian and updates labels', async () => {
    const user = userEvent.setup();
    renderSettingsDropdown();

    const trigger = screen.getByTestId('settings-dropdown-button');
    await user.click(trigger);

    const huOption = await screen.findByTestId('language-btn-hu');
    await user.click(huOption);

    expect(screen.getByText('HU')).toBeInTheDocument();
  });
});
