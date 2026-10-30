import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import { Ticket } from '@/features/ticket-booking/types';
import { Event } from '@/features/events/types';
import { formatMoney, formatEventDate } from '@/shared/utils/formatters';
import { useTranslation } from '@/shared/context/I18nContext';

interface BookingSuccessProps {
  ticket: Ticket;
  event: Event;
  onClose: () => void;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({ ticket, event, onClose }) => {
  const { locale, t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(ticket.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailFailed = ticket.emailStatus === 'FAILED_PENDING_RETRY';
  const displayTitle = locale === 'hu' && event.titleHu ? event.titleHu : event.title;

  return (
    <Box sx={{ textAlign: 'center', py: 1 }} data-testid="booking-success-view">
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          bgcolor: 'success.light',
          border: '1px solid',
          borderColor: 'success.main',
          color: 'success.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}
      >
        <CheckCircleOutlinedIcon sx={{ fontSize: 32 }} />
      </Box>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          color: 'text.primary',
          letterSpacing: '-0.02em',
          mb: 0.5,
        }}
      >
        {t('booking.bookingSuccessTitle')}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {t('booking.bookingSuccessSubtitle')}
      </Typography>

      {emailFailed && (
        <Alert
          severity="warning"
          sx={{
            mb: 2.5,
            textAlign: 'left',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'warning.main',
            bgcolor: 'warning.light',
            color: 'warning.dark',
            fontSize: '0.8rem',
          }}
        >
          <strong>{t('booking.emailGatewayNoticeTitle')}</strong> {t('booking.emailGatewayNoticeText')}
        </Alert>
      )}

      {/* Ticket Pass Container */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '10px',
          textAlign: 'left',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ConfirmationNumberOutlinedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('booking.ticketCode')} {ticket.ticketTypeName ? `• ${ticket.ticketTypeName}` : ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Chip
              label={ticket.ticketCode}
              sx={{
                fontWeight: 700,
                fontSize: '0.875rem',
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '0.03em',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: '6px',
                height: 28,
              }}
              data-testid="ticket-code-chip"
            />
            <Tooltip title={copied ? t('booking.codeCopied') : t('booking.copyCode')}>
              <IconButton size="small" onClick={handleCopyCode} sx={{ color: copied ? 'success.main' : 'text.secondary' }}>
                {copied ? <CheckOutlinedIcon fontSize="small" /> : <ContentCopyOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: 'divider' }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {t('booking.attendee')}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {ticket.participantName.replace(/\s*\((Organizer|Participant|Szervező|Résztvevő)\)/gi, '').trim()}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {ticket.participantEmail}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {t('booking.amountPaid')}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {formatMoney(ticket.price)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {new Date(ticket.purchaseDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: 'divider' }} />

        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {t('booking.eventAndVenue')}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {displayTitle}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {formatEventDate(event.date)} • {event.venue.name}
          </Typography>
        </Box>
      </Paper>

      <Button
        variant="contained"
        fullWidth
        onClick={onClose}
        sx={{
          py: 1.25,
          fontWeight: 600,
          borderRadius: '8px',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': { bgcolor: 'primary.light' },
        }}
      >
        {t('booking.done')}
      </Button>
    </Box>
  );
};
