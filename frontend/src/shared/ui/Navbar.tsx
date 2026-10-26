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
import { NavLink as RouterNavLink, Link as RouterLink } from 'react-router-dom';
import { UserRole } from '@/features/events/types';

interface NavbarProps {
  totalTicketsCount?: number;
  userRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onOpenOrganizerDialog?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalTicketsCount = 0,
  userRole = 'PARTICIPANT',
  onRoleChange,
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

          {/* Navigation Links & Role Switcher */}
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
              startIcon={<ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} />}
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
              My Tickets
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

            {/* Organizer Action Button */}
            {userRole === 'ORGANIZER' && onOpenOrganizerDialog && (
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

            {/* Role Switcher Pill */}
            {onRoleChange && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  p: 0.35,
                  borderRadius: '8px',
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  ml: 0.5,
                }}
                data-testid="role-switcher"
              >
                <Button
                  size="small"
                  startIcon={<PersonOutlineIcon sx={{ fontSize: 15 }} />}
                  onClick={() => onRoleChange('PARTICIPANT')}
                  sx={{
                    minWidth: 'auto',
                    px: 1.25,
                    py: 0.35,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    bgcolor: userRole === 'PARTICIPANT' ? 'background.paper' : 'transparent',
                    color: userRole === 'PARTICIPANT' ? 'text.primary' : 'text.secondary',
                    boxShadow: userRole === 'PARTICIPANT' ? 1 : 0,
                  }}
                >
                  Participant
                </Button>
                <Button
                  size="small"
                  startIcon={<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 15 }} />}
                  onClick={() => onRoleChange('ORGANIZER')}
                  sx={{
                    minWidth: 'auto',
                    px: 1.25,
                    py: 0.35,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    bgcolor: userRole === 'ORGANIZER' ? 'background.paper' : 'transparent',
                    color: userRole === 'ORGANIZER' ? 'text.primary' : 'text.secondary',
                    boxShadow: userRole === 'ORGANIZER' ? 1 : 0,
                  }}
                >
                  Organizer
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
