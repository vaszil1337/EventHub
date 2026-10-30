import React from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import { useTranslation } from '../context/I18nContext';
import { Locale } from '../locales/types';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useTranslation();

  const handleSelect = (newLocale: Locale) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
    }
  };

  return (
    <Box
      data-testid="language-switcher"
      aria-label={t('common.language')}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '8px',
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
        p: '2px',
        gap: '2px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pl: 0.75,
          pr: 0.25,
          color: 'text.secondary',
        }}
      >
        <TranslateOutlinedIcon sx={{ fontSize: 14 }} />
      </Box>

      <ButtonBase
        onClick={() => handleSelect('en')}
        data-testid="language-btn-en"
        aria-pressed={locale === 'en'}
        sx={{
          px: 1,
          py: 0.4,
          borderRadius: '6px',
          bgcolor: locale === 'en' ? 'background.paper' : 'transparent',
          color: locale === 'en' ? 'text.primary' : 'text.secondary',
          boxShadow: locale === 'en' ? 1 : 'none',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            color: 'text.primary',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: locale === 'en' ? 700 : 500,
            fontSize: '0.72rem',
            lineHeight: 1,
            letterSpacing: '0.5px',
          }}
        >
          EN
        </Typography>
      </ButtonBase>

      <ButtonBase
        onClick={() => handleSelect('hu')}
        data-testid="language-btn-hu"
        aria-pressed={locale === 'hu'}
        sx={{
          px: 1,
          py: 0.4,
          borderRadius: '6px',
          bgcolor: locale === 'hu' ? 'background.paper' : 'transparent',
          color: locale === 'hu' ? 'text.primary' : 'text.secondary',
          boxShadow: locale === 'hu' ? 1 : 'none',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            color: 'text.primary',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: locale === 'hu' ? 700 : 500,
            fontSize: '0.72rem',
            lineHeight: 1,
            letterSpacing: '0.5px',
          }}
        >
          HU
        </Typography>
      </ButtonBase>
    </Box>
  );
};
