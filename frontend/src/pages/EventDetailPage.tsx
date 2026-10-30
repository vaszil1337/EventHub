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
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Event } from '@/features/events/types';
import { eventService } from '@/features/events/services/eventService';
import { CapacityBadge } from '@/features/events/components/CapacityBadge';
import { formatMoney, formatEventDate } from '@/shared/utils/formatters';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTranslation } from '@/shared/context/I18nContext';
import { getLocalizedEventTitle, getLocalizedEventDescription } from '@/shared/utils/eventLocalization';
import { translateBackendMessage } from '@/shared/utils/errorTranslator';

interface EventDetailPageProps {
  onBookTicket: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ onBookTicket, onEditEvent }) => {
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const isOrganizer = user?.role === 'ORGANIZER';
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const displayTitle = event ? getLocalizedEventTitle(event, locale) : '';
  const displayDescription = event ? getLocalizedEventDescription(event, locale) : '';

  useEffect(() => {
    async function loadEvent() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await eventService.getEventById(id);
        if (!data) {
          setError(t('backend_messages.event_not_found'));
        } else {
          setEvent(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('backend_messages.generic_error'));
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress size={32} sx={{ color: 'primary.main' }} />
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'error.main',
            bgcolor: 'error.light',
            color: 'error.dark',
          }}
        >
          {error ? translateBackendMessage(error, t) : t('backend_messages.event_not_found')}
        </Alert>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackOutlinedIcon />}
          sx={{ color: 'text.primary', fontWeight: 600 }}
        >
          {t('events.backToEvents')}
        </Button>
      </Container>
    );
  }

  const isSoldOut = event.soldTicketsCount >= event.venue.capacity;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Back Link */}
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />}
        sx={{
          mb: 3,
          color: 'text.secondary',
          fontWeight: 500,
          borderRadius: '8px',
          px: 1.5,
          '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
        }}
      >
        {t('events.backToEvents')}
      </Button>

      {/* Main Card */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {event.imageUrl && (
          <Box
            component="img"
            src={event.imageUrl}
            alt={displayTitle}
            sx={{
              width: '100%',
              height: { xs: 220, md: 380 },
              objectFit: 'cover',
            }}
          />
        )}

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          {/* Category & Date Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
            {event.category && (
              <Box
                sx={{
                  px: 1.25,
                  py: 0.35,
                  borderRadius: '6px',
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {t(`categories.${event.category.toLowerCase()}`) || event.category}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: '0.9rem' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {formatEventDate(event.date, locale)}
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              mb: 3,
              letterSpacing: '-0.025em',
              lineHeight: 1.25,
            }}
          >
            {displayTitle}
          </Typography>

          {/* Venue Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.25,
              mb: 4,
              borderRadius: '10px',
              bgcolor: 'background.default',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <PlaceOutlinedIcon sx={{ color: 'primary.main', mt: 0.3, fontSize: 20 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                {event.venue.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                {event.venue.address}
              </Typography>
            </Box>
          </Paper>

          {/* Description */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('events.aboutEvent')}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.7,
              mb: 4,
              fontSize: '0.95rem',
            }}
          >
            {displayDescription}
          </Typography>

          <Divider sx={{ my: 4, borderColor: 'divider' }} />

          {/* Booking & Capacity Action Area */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 3,
              p: 2.5,
              borderRadius: '10px',
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ flexGrow: 1, maxWidth: { sm: 340 } }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', mb: 0.5 }}>
                {t('events.ticketPrice')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5, fontFeatureSettings: '"tnum"' }}>
                {formatMoney(event.price, locale)}
              </Typography>
              <CapacityBadge soldCount={event.soldTicketsCount} capacity={event.venue.capacity} />
            </Box>

            {isOrganizer ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<EditOutlinedIcon />}
                onClick={() => onEditEvent && onEditEvent(event)}
                data-testid="detail-edit-event-button"
                sx={{
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                  borderRadius: '8px',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                }}
              >
                {t('events.editEvent')}
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                disabled={isSoldOut}
                onClick={() => onBookTicket(event)}
                data-testid="detail-book-button"
                startIcon={!isSoldOut ? <ConfirmationNumberOutlinedIcon /> : <BlockOutlinedIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                  borderRadius: '8px',
                  bgcolor: isSoldOut ? 'error.light' : 'primary.main',
                  color: isSoldOut ? 'error.dark' : 'primary.contrastText',
                  border: isSoldOut ? '1px solid' : 'none',
                  borderColor: 'error.main',
                  '&:hover': {
                    bgcolor: isSoldOut ? 'error.light' : 'primary.light',
                  },
                }}
              >
                {isSoldOut ? t('events.soldOutCapacityReached') : t('events.bookTicketNow')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
