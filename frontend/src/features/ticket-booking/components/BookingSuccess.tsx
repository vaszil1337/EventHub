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
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import { Ticket } from '@/features/ticket-booking/types';
import { Event } from '@/features/events/types';
import { formatMoney, formatEventDate } from '@/shared/utils/formatters';

interface BookingSuccessProps {
  ticket: Ticket;
  event: Event;
  onClose: () => void;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({ ticket, event, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(ticket.ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        Booking Confirmed!
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Your seat has been reserved and your ticket pass has been generated.
      </Typography>

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
              Ticket Code
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
            <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
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
              Attendee
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {ticket.participantName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {ticket.participantEmail}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Amount Paid
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
            Event & Venue
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {event.title}
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
        Done
      </Button>
    </Box>
  );
};
