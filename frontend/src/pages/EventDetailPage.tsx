import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BlockIcon from '@mui/icons-material/Block';
import { Event } from '@/features/events/types';
import { eventService } from '@/features/events/services/eventService';
import { CapacityBadge } from '@/features/events/components/CapacityBadge';
import { formatMoney, formatEventDate } from '@/shared/utils/formatters';

interface EventDetailPageProps {
  onBookTicket: (event: Event) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ onBookTicket }) => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await eventService.getEventById(id);
        if (!data) {
          setError(`Event with ID "${id}" was not found.`);
        } else {
          setEvent(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event details.');
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Event not found.'}
        </Alert>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />}>
          Back to Events
        </Button>
      </Container>
    );
  }

  const isSoldOut = event.soldTicketsCount >= event.venue.capacity;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, color: 'text.secondary', fontWeight: 600 }}
      >
        Back to Events
      </Button>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {event.imageUrl && (
          <Box
            component="img"
            src={event.imageUrl}
            alt={event.title}
            sx={{
              width: '100%',
              height: { xs: 220, md: 360 },
              objectFit: 'cover',
            }}
          />
        )}

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {/* Date & Category */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 1 }}>
            <CalendarTodayIcon fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {formatEventDate(event.date)}
            </Typography>
          </Box>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 2 }}>
            {event.title}
          </Typography>

          {/* Venue Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              bgcolor: '#f8fafc',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <LocationOnIcon sx={{ color: 'primary.main', mt: 0.3 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {event.venue.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.venue.address}
              </Typography>
            </Box>
          </Paper>

          {/* Description */}
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            About this Event
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 4 }}>
            {event.description}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Booking & Capacity Action Area */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 3,
            }}
          >
            <Box sx={{ flexGrow: 1, maxWidth: { sm: 320 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                TICKET PRICE
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.dark', mb: 1.5 }}>
                {formatMoney(event.price)}
              </Typography>
              <CapacityBadge soldCount={event.soldTicketsCount} capacity={event.venue.capacity} />
            </Box>

            <Button
              variant={isSoldOut ? 'outlined' : 'contained'}
              color={isSoldOut ? 'error' : 'primary'}
              size="large"
              startIcon={isSoldOut ? <BlockIcon /> : <ConfirmationNumberIcon />}
              onClick={() => onBookTicket(event)}
              data-testid="detail-book-ticket-button"
              sx={{ py: 1.5, px: 4, fontWeight: 700 }}
            >
              {isSoldOut ? 'Sold Out (Capacity Reached)' : 'Book Ticket Now'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
