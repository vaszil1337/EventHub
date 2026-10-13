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
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
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
    <Box sx={{ py: 3 }}>
      {/* Controls Bar: Title & Filters */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 4,
          pb: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}
          >
            All Events
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Showing {events.length} upcoming {events.length === 1 ? 'event' : 'events'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search events, venues..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: '100%', sm: 240 },
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-root': {
                height: 40,
                fontSize: '0.875rem',
              },
            }}
          />

          <TextField
            select
            size="small"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 160 },
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-root': {
                height: 40,
                fontSize: '0.875rem',
              },
            }}
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
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'error.main',
            bgcolor: 'error.light',
            color: 'error.dark',
          }}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress size={32} sx={{ color: 'primary.main' }} />
        </Box>
      )}

      {/* Empty State */}
      {!loading && events.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 10,
            px: 3,
            bgcolor: 'background.paper',
            borderRadius: '12px',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <CalendarMonthOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1.5 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            No events found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
