import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
  Tooltip,
  Container,
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { NavLink as RouterNavLink, Link as RouterLink } from 'react-router-dom';

interface NavbarProps {
  totalTicketsCount?: number;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ totalTicketsCount = 0, onResetData }) => {
  return (
    <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
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
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <ConfirmationNumberIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h6" color="text.primary" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                EventHub
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Event & Ticket Management
              </Typography>
            </Box>
            <Chip
              label="MVP Week 1"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 1, height: 22, fontSize: '0.72rem', fontWeight: 600 }}
            />
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              component={RouterNavLink}
              to="/"
              end
              startIcon={<EventAvailableIcon />}
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                '&.active': {
                  color: 'primary.main',
                  bgcolor: '#eef2ff',
                },
              }}
            >
              Events
            </Button>

            <Button
              component={RouterNavLink}
              to="/tickets"
              startIcon={<ConfirmationNumberIcon />}
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                '&.active': {
                  color: 'primary.main',
                  bgcolor: '#eef2ff',
                },
              }}
            >
              My Tickets
              {totalTicketsCount > 0 && (
                <Chip
                  label={totalTicketsCount}
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 20, fontSize: '0.72rem', fontWeight: 700 }}
                />
              )}
            </Button>

            <Tooltip title="Reset demo events and tickets to initial seed">
              <Button
                variant="outlined"
                size="small"
                startIcon={<RestartAltIcon />}
                onClick={onResetData}
                color="inherit"
                sx={{ ml: 1, borderColor: '#cbd5e1', color: 'text.secondary' }}
              >
                Reset Data
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
