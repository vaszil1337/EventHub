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

interface NavbarProps {
  totalTicketsCount?: number;
  user?: AuthUser | null;
  onOpenAuthDialog?: () => void;
  onLogout?: () => void;
  onOpenOrganizerDialog?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalTicketsCount = 0,
  user = null,
  onOpenAuthDialog,
  onLogout,
  onOpenOrganizerDialog,
}) => {
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
                Event & Ticket Management
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
              Events
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
              {user?.role === 'ORGANIZER' ? 'Reservations' : 'My Tickets'}
              {totalTicketsCount > 0 && (
                <Chip
                  label={totalTicketsCount}
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
            {user?.role === 'ORGANIZER' && onOpenOrganizerDialog && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
                onClick={onOpenOrganizerDialog}
                data-testid="organizer-manage-button"
                sx={{
                  borderRadius: '6px',
                  px: 1.5,
                  py: 0.6,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                Manage Events
              </Button>
            )}

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
                    {user.role}
                  </Typography>
                </Box>
                {onLogout && (
                  <Button
                    size="small"
                    onClick={onLogout}
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
                    Sign Out
                  </Button>
                )}
              </Box>
            ) : (
              onOpenAuthDialog && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LoginOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={onOpenAuthDialog}
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
                  Sign In
                </Button>
              )
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
