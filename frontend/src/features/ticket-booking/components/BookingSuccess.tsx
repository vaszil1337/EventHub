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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
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
    <Box sx={{ textAlign: 'center', py: 2 }} data-testid="booking-success-view">
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: '#dcfce7',
          color: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 40 }} />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Booking Confirmed!
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your ticket has been reserved and registered to LocalStorage.
      </Typography>

      {/* Ticket Pass Container */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          bgcolor: '#f8fafc',
          border: '2px dashed #cbd5e1',
          borderRadius: 3,
          textAlign: 'left',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ConfirmationNumberIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
              Ticket Code
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label={ticket.ticketCode}
              color="primary"
              sx={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em' }}
              data-testid="ticket-code-chip"
            />
            <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
              <IconButton size="small" onClick={handleCopyCode} color={copied ? 'success' : 'default'}>
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Attendee
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {ticket.participantName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ticket.participantEmail}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Price Paid
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatMoney(ticket.price)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(ticket.purchaseDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box>
          <Typography variant="caption" color="text.secondary">
            Event & Venue
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {event.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatEventDate(event.date)} • {event.venue.name}
          </Typography>
        </Box>
      </Paper>

      <Button variant="contained" fullWidth onClick={onClose} sx={{ py: 1.2, fontWeight: 700 }}>
        Done
      </Button>
    </Box>
  );
};
