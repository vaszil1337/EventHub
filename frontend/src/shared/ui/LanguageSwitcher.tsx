import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Box,
  Typography,
  SelectChangeEvent,
} from '@mui/material';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useTranslation } from '../context/I18nContext';
import { Locale } from '../locales/types';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useTranslation();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const selected = event.target.value as Locale;
    if (selected !== locale) {
      setLocale(selected);
    }
  };

  return (
    <FormControl size="small" data-testid="language-switcher">
      <Select
        value={locale}
        onChange={handleChange}
        IconComponent={KeyboardArrowDownOutlinedIcon}
        inputProps={{
          'aria-label': t('common.language'),
          'data-testid': 'language-select-input',
        }}
        data-testid="language-select"
        sx={{
          height: 36,
          borderRadius: '8px',
          bgcolor: 'action.hover',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'text.primary',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'text.secondary',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
          },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            py: 0.75,
            pr: '32px !important',
          },
        }}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <TranslateOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.04em' }}>
              {selected.toUpperCase()}
            </Typography>
          </Box>
        )}
      >
        <MenuItem value="en" data-testid="language-btn-en">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: locale === 'en' ? 700 : 500, fontSize: '0.85rem' }}>
              English (EN)
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem value="hu" data-testid="language-btn-hu">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: locale === 'hu' ? 700 : 500, fontSize: '0.85rem' }}>
              Magyar (HU)
            </Typography>
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  );
};
