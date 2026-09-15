import React from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  Typography,
  CircularProgress,
  Divider,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Event } from '@/features/events/types';
import { formatMoney } from '@/shared/utils/formatters';

interface BookingFormProps {
  event: Event;
  participantName: string;
  onNameChange: (value: string) => void;
  participantEmail: string;
  onEmailChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  event,
  participantName,
  onNameChange,
  participantEmail,
  onEmailChange,
  loading,
  error,
  onSubmit,
  onCancel,
}) => {
  const isSoldOut = event.soldTicketsCount >= event.venue.capacity;

  return (
    <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
      {/* Event Summary Box */}
      <Box
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 2,
          bgcolor: isSoldOut ? '#fff1f2' : '#f0fdf4',
          border: isSoldOut ? '1px solid #fecdd3' : '1px solid #bbf7d0',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isSoldOut ? 'error.dark' : 'success.dark' }}>
          {event.title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
          📍 {event.venue.name} • {event.venue.address}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Price: {formatMoney(event.price)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: isSoldOut ? 'error.main' : 'text.primary',
            }}
          >
            Occupancy: {event.soldTicketsCount} / {event.venue.capacity} seats
          </Typography>
        </Box>
      </Box>

      {/* Sold Out Warning Alert */}
      {isSoldOut && (
        <Alert
          severity="warning"
          icon={<ErrorOutlineIcon />}
          sx={{ mb: 2.5, borderRadius: 2 }}
          data-testid="capacity-warning-alert"
        >
          <strong>Capacity Limit Notice:</strong> This event has reached maximum capacity ({event.soldTicketsCount}/{event.venue.capacity} seats). Attempting registration will trigger the capacity constraint rule.
        </Alert>
      )}

      {/* Error Alert (e.g. CapacityExceededError or Validation) */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5, borderRadius: 2 }}
          data-testid="booking-error-alert"
        >
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        required
        label="Participant Name"
        placeholder="e.g. Jane Doe"
        value={participantName}
        onChange={(e) => onNameChange(e.target.value)}
        margin="normal"
        autoFocus
        InputProps={{
          startAdornment: <PersonOutlineIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
        inputProps={{ 'data-testid': 'input-participant-name' }}
      />

      <TextField
        fullWidth
        required
        type="email"
        label="Email Address"
        placeholder="e.g. jane.doe@example.com"
        value={participantEmail}
        onChange={(e) => onEmailChange(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: <MailOutlineIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
        inputProps={{ 'data-testid': 'input-participant-email' }}
      />

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button onClick={onCancel} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color={isSoldOut ? 'error' : 'primary'}
          disabled={loading}
          data-testid="submit-booking-button"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ px: 3 }}
        >
          {loading ? 'Processing...' : isSoldOut ? 'Attempt Registration (Check Capacity)' : 'Confirm & Reserve Ticket'}
        </Button>
      </Box>
    </Box>
  );
};
