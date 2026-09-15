import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Event } from '@/features/events/types';
import { EventList } from '@/features/events/components/EventList';

interface EventsPageProps {
  events: Event[];
  allEvents: Event[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  categories: string[];
  onBookTicket: (event: Event) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  allEvents,
  loading,
  error,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onBookTicket,
}) => {
  const totalCapacity = allEvents.reduce((sum, e) => sum + e.venue.capacity, 0);
  const totalSold = allEvents.reduce((sum, e) => sum + e.soldTicketsCount, 0);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid #e2e8f0',
          py: { xs: 4, md: 5 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 800 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                icon={<StorageIcon sx={{ fontSize: '1rem !important' }} />}
                label="LocalStorage API Abstraction"
                size="small"
                sx={{ fontWeight: 600, bgcolor: '#e0e7ff', color: '#3730a3' }}
              />
              <Chip
                icon={<VerifiedUserIcon sx={{ fontSize: '1rem !important' }} />}
                label="Capacity Business Rule Enforced"
                size="small"
                sx={{ fontWeight: 600, bgcolor: '#dcfce7', color: '#166534' }}
              />
            </Box>

            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                mb: 1.5,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Event & Ticket Management
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Explore events, inspect venue capacities, and reserve tickets with real-time capacity constraint enforcement. Built with React Router, TypeScript, and Material UI.
            </Typography>

            {/* Quick Metrics Bar */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <ConfirmationNumberIcon color="primary" fontSize="large" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      TOTAL CAPACITY
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {totalSold} / {totalCapacity} Seats
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <StorageIcon color="secondary" fontSize="large" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      ACTIVE EVENTS
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {allEvents.length} Events Listed
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <VerifiedUserIcon sx={{ color: '#16a34a' }} fontSize="large" />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      SEED STATUS
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#16a34a' }}>
                      Ready (1 Full / 2 Open)
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Main Events Catalog */}
      <Container maxWidth="lg">
        <EventList
          events={events}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          categories={categories}
          onBookTicket={onBookTicket}
        />
      </Container>
    </Box>
  );
};
