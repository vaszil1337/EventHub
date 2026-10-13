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
import { NavLink as RouterNavLink, Link as RouterLink } from 'react-router-dom';

interface NavbarProps {
  totalTicketsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ totalTicketsCount = 0 }) => {
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
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 64, py: 0.5 }}>
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

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Button
              component={RouterNavLink}
              to="/"
              end
              startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                fontWeight: 500,
                fontSize: '0.875rem',
                color: 'text.secondary',
                px: 1.75,
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
                px: 1.75,
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
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
