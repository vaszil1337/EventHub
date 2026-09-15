import React from 'react';
import {
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Event } from '@/features/events/types';
import { EventCard } from './EventCard';

interface EventListProps {
  events: Event[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  onBookTicket: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  loading,
  error,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onBookTicket,
}) => {
  return (
    <Box sx={{ py: 4 }}>
      {/* Header and Filter Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800 }}>
            Upcoming Events
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore live conferences, workshops, and concerts. Reserve your tickets instantly.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search events, venues..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220, bgcolor: 'background.paper' }}
          />

          <TextField
            select
            size="small"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            sx={{ minWidth: 150, bgcolor: 'background.paper' }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat.toLowerCase()}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px dashed #cbd5e1',
          }}
        >
          <EventAvailableIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.primary">
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or category filter.
          </Typography>
        </Box>
      )}

      {/* Events Grid */}
      {!loading && events.length > 0 && (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id} sx={{ display: 'flex' }}>
              <EventCard event={event} onBookTicket={onBookTicket} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
