import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from '@/shared/ui/Navbar';
import { useTranslation } from '@/shared/context/I18nContext';

export const MainLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Box sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 500 }}>
          EventHub • {t('nav.brandSubtitle')}
        </Box>
      </Box>
    </Box>
  );
};
