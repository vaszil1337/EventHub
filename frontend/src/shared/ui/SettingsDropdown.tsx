import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import { useTranslation } from '../context/I18nContext';
import { Locale } from '../locales/types';

export const SettingsDropdown: React.FC = () => {
  const { locale, setLocale, t } = useTranslation();
  const { mode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectLanguage = (newLocale: Locale) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
    }
    handleClose();
  };

  const handleSelectTheme = (newMode: 'light' | 'dark') => {
    setMode(newMode);
    handleClose();
  };

  const currentMode = mode || 'light';

  return (
    <Box data-testid="settings-dropdown" sx={{ display: 'inline-flex' }}>
      <Button
        id="settings-menu-button"
        aria-controls={open ? 'settings-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label={t('common.settings')}
        data-testid="settings-dropdown-button"
        onClick={handleClick}
        endIcon={
          <KeyboardArrowDownOutlinedIcon
            sx={{
              fontSize: 16,
              color: 'text.secondary',
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        }
        sx={{
          height: 36,
          px: 1.25,
          py: 0.5,
          borderRadius: '8px',
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          fontSize: '0.8125rem',
          fontWeight: 600,
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          '&:hover': {
            bgcolor: 'action.selected',
            borderColor: 'text.secondary',
          },
        }}
      >
        <SettingsOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: '0.78rem',
              letterSpacing: '0.04em',
              color: 'text.primary',
            }}
          >
            {locale.toUpperCase()}
          </Typography>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'text.secondary',
              ml: 0.25,
            }}
          >
            {currentMode === 'dark' ? (
              <DarkModeOutlinedIcon sx={{ fontSize: 15 }} />
            ) : (
              <LightModeOutlinedIcon sx={{ fontSize: 15 }} />
            )}
          </Box>
        </Box>
      </Button>

      <Menu
        id="settings-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'settings-menu-button',
          sx: { py: 0.75 },
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 10px 25px -5px rgba(0,0,0,0.6)'
                  : '0 10px 25px -5px rgba(0,0,0,0.1)',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Language Section */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 2,
            pt: 0.5,
            pb: 0.5,
            fontWeight: 700,
            fontSize: '0.7rem',
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {t('common.language')}
        </Typography>

        <MenuItem
          onClick={() => handleSelectLanguage('en')}
          selected={locale === 'en'}
          data-testid="language-btn-en"
          sx={{
            py: 0.75,
            px: 2,
            borderRadius: '6px',
            mx: 0.5,
            '&.Mui-selected': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
            <TranslateOutlinedIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText
            primary="English (EN)"
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: locale === 'en' ? 700 : 500,
              fontSize: '0.85rem',
            }}
          />
          {locale === 'en' && (
            <CheckOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', ml: 1 }} />
          )}
        </MenuItem>

        <MenuItem
          onClick={() => handleSelectLanguage('hu')}
          selected={locale === 'hu'}
          data-testid="language-btn-hu"
          sx={{
            py: 0.75,
            px: 2,
            borderRadius: '6px',
            mx: 0.5,
            '&.Mui-selected': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
            <TranslateOutlinedIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText
            primary="Magyar (HU)"
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: locale === 'hu' ? 700 : 500,
              fontSize: '0.85rem',
            }}
          />
          {locale === 'hu' && (
            <CheckOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', ml: 1 }} />
          )}
        </MenuItem>

        <Divider sx={{ my: 0.75 }} />

        {/* Appearance / Theme Section */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 2,
            pt: 0.5,
            pb: 0.5,
            fontWeight: 700,
            fontSize: '0.7rem',
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {t('common.appearance')}
        </Typography>

        <MenuItem
          onClick={() => handleSelectTheme('light')}
          selected={currentMode === 'light'}
          data-testid="theme-btn-light"
          sx={{
            py: 0.75,
            px: 2,
            borderRadius: '6px',
            mx: 0.5,
            '&.Mui-selected': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
            <LightModeOutlinedIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText
            primary={t('common.themeLight')}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: currentMode === 'light' ? 700 : 500,
              fontSize: '0.85rem',
            }}
          />
          {currentMode === 'light' && (
            <CheckOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', ml: 1 }} />
          )}
        </MenuItem>

        <MenuItem
          onClick={() => handleSelectTheme('dark')}
          selected={currentMode === 'dark'}
          data-testid="theme-btn-dark"
          sx={{
            py: 0.75,
            px: 2,
            borderRadius: '6px',
            mx: 0.5,
            '&.Mui-selected': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: 'text.secondary' }}>
            <DarkModeOutlinedIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText
            primary={t('common.themeDark')}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: currentMode === 'dark' ? 700 : 500,
              fontSize: '0.85rem',
            }}
          />
          {currentMode === 'dark' && (
            <CheckOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', ml: 1 }} />
          )}
        </MenuItem>
      </Menu>
    </Box>
  );
};
