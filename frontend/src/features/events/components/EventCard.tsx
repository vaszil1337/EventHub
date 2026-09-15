import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Divider,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BlockIcon from '@mui/icons-material/Block';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { Event } from '@/features/events/types';
import { CapacityBadge } from './CapacityBadge';
import { formatMoney, formatEventDate } from '@/shared/utils/formatters';

interface EventCardProps {
  event: Event;
  onBookTicket: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onBookTicket }) => {
  const isSoldOut = event.soldTicketsCount >= event.venue.capacity;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        border: isSoldOut ? '1px solid #fecaca' : '1px solid #e2e8f0',
      }}
    >
      {event.imageUrl && (
        <CardMedia
          component="img"
          height="180"
          image={event.imageUrl}
          alt={event.title}
          sx={{
            objectFit: 'cover',
            filter: isSoldOut ? 'grayscale(40%)' : 'none',
          }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, pb: 1 }}>
        {/* Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'primary.main' }}>
          <CalendarTodayIcon sx={{ fontSize: '0.9rem' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '0.02em' }}>
            {formatEventDate(event.date)}
          </Typography>
        </Box>

        {/* Title linking to details */}
        <Typography
          variant="h6"
          component={RouterLink}
          to={`/events/${event.id}`}
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            textDecoration: 'none',
            color: 'text.primary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          {event.title}
        </Typography>

        {/* Venue details */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, color: 'text.secondary' }}>
          <LocationOnIcon sx={{ fontSize: '1.1rem', mt: 0.2, color: '#94a3b8', flexShrink: 0 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {event.venue.name}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
              {event.venue.address}
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            my: 0.5,
          }}
        >
          {event.description}
        </Typography>

        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Divider sx={{ mb: 1.5 }} />

          {/* Price and Capacity */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Ticket Price
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.dark' }}>
              {formatMoney(event.price)}
            </Typography>
          </Box>

          <CapacityBadge
            soldCount={event.soldTicketsCount}
            capacity={event.venue.capacity}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          component={RouterLink}
          to={`/events/${event.id}`}
          size="small"
          variant="text"
          color="inherit"
          startIcon={<InfoOutlinedIcon />}
          sx={{ color: 'text.secondary', fontWeight: 600 }}
        >
          Details
        </Button>

        <Button
          fullWidth
          variant={isSoldOut ? 'outlined' : 'contained'}
          color={isSoldOut ? 'error' : 'primary'}
          startIcon={isSoldOut ? <BlockIcon /> : <ConfirmationNumberIcon />}
          onClick={() => onBookTicket(event)}
          data-testid={`book-button-${event.id}`}
          sx={{
            py: 1,
            fontWeight: 700,
          }}
        >
          {isSoldOut ? 'Sold Out (Capacity Limit)' : 'Book Ticket'}
        </Button>
      </CardActions>
    </Card>
  );
};
