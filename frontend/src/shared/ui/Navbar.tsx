import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
  Container,
  alpha,
} from '@mui/material';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { NavLink as RouterNavLink, Link as RouterLink } from 'react-router-dom';
import { AuthUser } from '@/features/auth/types';
import { SettingsDropdown } from './SettingsDropdown';
import { useTranslation } from '@/shared/context/I18nContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTicket } from '@/features/ticket-booking/context/TicketContext';
import { useModal } from '@/shared/context/ModalContext';
import { useNotification } from '@/shared/context/NotificationContext';

function useSafeTicket() {
  try {
    return useTicket();
  } catch {
    return { totalTickets: 0, refreshTicketCount: async () => {}, incrementTicketCount: () => {}, decrementTicketCount: () => {}, resetTicketCount: () => {} };
  }
}

function useSafeModal() {
  try {
    return useModal();
  } catch {
    return {
      openAuthModal: () => {},
      closeAuthModal: () => {},
      openOrganizerModal: () => {},
      closeOrganizerModal: () => {},
      openBookingModal: () => {},
      closeBookingModal: () => {},
      openEditModal: () => {},
      closeEditModal: () => {},
    };
  }
}

function useSafeNotification() {
  try {
    return useNotification();
  } catch {
    return { notify: () => {}, closeNotification: () => {}, notification: { open: false, message: '', severity: 'info' as const } };
  }
}

interface NavbarProps {
  totalTicketsCount?: number;
  user?: AuthUser | null;
  onOpenAuthDialog?: () => void;
  onLogout?: () => void;
  onOpenOrganizerDialog?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalTicketsCount,
  user: propUser,
  onOpenAuthDialog,
  onLogout: propOnLogout,
  onOpenOrganizerDialog,
}) => {
  const { t } = useTranslation();
  const { user: authUser, logout: authLogout } = useAuth();
  const { totalTickets } = useSafeTicket();
  const { openAuthModal, openOrganizerModal } = useSafeModal();
  const { notify } = useSafeNotification();

  const user = propUser !== undefined ? propUser : authUser;
  const count = totalTicketsCount !== undefined ? totalTicketsCount : totalTickets;
  const handleOpenAuth = onOpenAuthDialog ?? openAuthModal;
  const handleOpenOrganizer = onOpenOrganizerDialog ?? openOrganizerModal;

  const handleLogout = React.useCallback(() => {
    if (propOnLogout) {
      propOnLogout();
    } else {
      authLogout();
      notify(t('auth.signedOutSuccess'), 'info');
    }
  }, [propOnLogout, authLogout, notify, t]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.85),
        backdropFilter: 'blur(12px)',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64, py: 0.5, gap: 1, flexWrap: 'wrap' }}>
          {/* Logo & Brand */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.contrastText',
                boxShadow: (theme) => `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
              }}
            >
              <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  EventHub
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.7rem',
                  display: 'block',
                  fontWeight: 500,
                }}
              >
                {t('nav.brandSubtitle')}
              </Typography>
            </Box>
          </Box>

          {/* Navigation Links & Authenticated User Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              component={RouterNavLink}
              to="/"
              end
              startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                fontWeight: 500,
                fontSize: '0.875rem',
                color: 'text.secondary',
                px: 1.5,
                py: 0.75,
                borderRadius: '6px',
                '&.active': {
                  color: 'text.primary',
                  fontWeight: 600,
                  bgcolor: 'action.hover',
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              {t('nav.events')}
            </Button>

            <Button
              component={RouterNavLink}
              to="/tickets"
              startIcon={
                user?.role === 'ORGANIZER' ? (
                  <AssignmentOutlinedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} />
                )
              }
              sx={{
                fontWeight: 500,
                fontSize: '0.875rem',
                color: 'text.secondary',
                px: 1.5,
                py: 0.75,
                borderRadius: '6px',
                '&.active': {
                  color: 'text.primary',
                  fontWeight: 600,
                  bgcolor: 'action.hover',
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              {user?.role === 'ORGANIZER' ? t('nav.reservations') : t('nav.myTickets')}
              {count > 0 && (
                <Chip
                  label={count}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 18,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    px: 0.25,
                  }}
                />
              )}
            </Button>

            {/* Organizer Action Button (Visible when authenticated as ORGANIZER) */}
            {user?.role === 'ORGANIZER' && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
                onClick={handleOpenOrganizer}
                data-testid="organizer-manage-button"
                sx={{
                  borderRadius: '6px',
                  px: 1.5,
                  py: 0.6,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {t('nav.manageEvents')}
              </Button>
            )}

            {/* Unified Preferences: Language & Theme Switcher */}
            <SettingsDropdown />

            {/* Authenticated User Badge or Sign In Button */}
            {user ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  pl: 1.25,
                  pr: 0.5,
                  py: 0.35,
                  borderRadius: '8px',
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  ml: 0.5,
                }}
                data-testid="authenticated-user-badge"
              >
                {user.role === 'ORGANIZER' ? (
                  <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                ) : (
                  <PersonOutlineIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                )}
                <Box sx={{ lineHeight: 1.1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block' }}>
                    {user.fullName.replace(/\s*\((Organizer|Participant|Szervező|Résztvevő)\)/gi, '').trim()}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 600 }}>
                    {user.role === 'ORGANIZER' ? t('auth.organizer') : t('auth.participant')}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={handleLogout}
                  startIcon={<LogoutOutlinedIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    minWidth: 'auto',
                    px: 1,
                    py: 0.35,
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'text.secondary',
                    borderRadius: '6px',
                    '&:hover': { bgcolor: 'background.paper', color: 'error.main' },
                  }}
                >
                  {t('nav.signOut')}
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<LoginOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={handleOpenAuth}
                data-testid="open-auth-dialog-button"
                sx={{
                  ml: 0.5,
                  borderRadius: '8px',
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  px: 1.5,
                  py: 0.6,
                  '&:hover': {
                    borderColor: 'text.secondary',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {t('nav.signIn')}
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
