import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  alpha,
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { Event } from '@/features/events/types';
import { CapacityBadge } from './CapacityBadge';
import { formatMoney, formatEventDate } from '@/shared/utils/formatters';
import { useAuth } from '@/features/auth/context/AuthContext';

interface EventCardProps {
  event: Event;
  onBookTicket: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onBookTicket, onEditEvent }) => {
  const { user } = useAuth();
  const isOrganizer = user?.role === 'ORGANIZER';
  const isSoldOut = event.soldTicketsCount >= event.venue.capacity;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: isSoldOut ? 'error.main' : 'divider',
        borderRadius: '12px',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          borderColor: isSoldOut ? 'error.main' : 'text.secondary',
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 8px 24px -4px ${alpha(theme.palette.common.black, 0.08)}`,
        },
      }}
    >
      {/* Image with pinned Category Badge */}
      {event.imageUrl && (
        <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={event.imageUrl}
            alt={event.title}
            sx={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              filter: isSoldOut ? 'grayscale(30%) brightness(0.95)' : 'none',
              transition: 'transform 0.4s ease',
              '&:hover': {
                transform: 'scale(1.03)',
              },
            }}
          />
          {event.category && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.92),
                backdropFilter: 'blur(8px)',
                px: 1.25,
                py: 0.35,
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'text.primary',
                boxShadow: (theme) => `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {event.category}
            </Box>
          )}
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5, pb: 1.5 }}>
        {/* Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', mb: 1 }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: '0.85rem' }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {formatEventDate(event.date)}
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component={RouterLink}
          to={`/events/${event.id}`}
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            lineHeight: 1.35,
            textDecoration: 'none',
            color: 'text.primary',
            mb: 1,
            transition: 'color 0.15s ease',
            '&:hover': {
              color: 'secondary.main',
            },
          }}
        >
          {event.title}
        </Typography>

        {/* Venue */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 1.5 }}>
          <PlaceOutlinedIcon sx={{ fontSize: '1rem', mt: 0.2, color: 'text.secondary', flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
              {event.venue.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.venue.address}
            </Typography>
          </Box>
        </Box>

        {/* Description snippet */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.55,
            mb: 2,
          }}
        >
          {event.description}
        </Typography>

        {/* Price & Capacity Meter */}
        <Box
          sx={{
            mt: 'auto',
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.25 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Price per seat
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {formatMoney(event.price)}
            </Typography>
          </Box>

          <CapacityBadge
            soldCount={event.soldTicketsCount}
            capacity={event.venue.capacity}
          />
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
        <Button
          component={RouterLink}
          to={`/events/${event.id}`}
          size="small"
          variant="outlined"
          sx={{
            borderColor: 'divider',
            color: 'text.primary',
            fontWeight: 600,
            py: 0.85,
            px: 1.5,
            borderRadius: '8px',
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: 'action.hover',
            },
          }}
        >
          Details
        </Button>

        {isOrganizer ? (
          <Button
            fullWidth
            variant="contained"
            onClick={() => onEditEvent && onEditEvent(event)}
            data-testid={`edit-button-${event.id}`}
            startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              py: 0.85,
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: '8px',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.light',
              },
            }}
          >
            Edit Event
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            onClick={() => onBookTicket(event)}
            data-testid={`book-button-${event.id}`}
            endIcon={!isSoldOut ? <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} /> : <BlockOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              py: 0.85,
              fontWeight: 600,
              fontSize: '0.875rem',
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
            {isSoldOut ? 'Sold Out (Capacity Limit)' : 'Book Ticket'}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
