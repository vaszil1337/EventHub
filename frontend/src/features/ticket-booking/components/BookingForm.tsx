import React from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  Typography,
  CircularProgress,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
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
          borderRadius: '8px',
          bgcolor: 'background.default',
          border: '1px solid',
          borderColor: isSoldOut ? 'error.main' : 'divider',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          {event.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 1 }}>
          <PlaceOutlinedIcon sx={{ fontSize: '0.9rem' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {event.venue.name} • {event.venue.address}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Price: {formatMoney(event.price)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: isSoldOut ? 'error.main' : 'text.secondary',
            }}
          >
            Capacity: {event.soldTicketsCount} / {event.venue.capacity} seats taken
          </Typography>
        </Box>
      </Box>

      {/* Sold Out Warning Alert */}
      {isSoldOut && (
        <Alert
          severity="warning"
          icon={<ErrorOutlineIcon fontSize="small" />}
          sx={{
            mb: 2.5,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'warning.main',
            bgcolor: 'warning.light',
            color: 'warning.dark',
            fontSize: '0.8125rem',
          }}
          data-testid="capacity-warning-alert"
        >
          <strong>Capacity Limit Notice:</strong> This event has reached maximum capacity ({event.soldTicketsCount}/{event.venue.capacity} seats). Attempting registration will trigger the capacity constraint rule.
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'error.main',
            bgcolor: 'error.light',
            color: 'error.dark',
            fontSize: '0.8125rem',
          }}
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
          startAdornment: <PersonOutlineIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
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
          startAdornment: <MailOutlineIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
        }}
        inputProps={{ 'data-testid': 'input-participant-email' }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          disabled={loading}
          sx={{
            borderRadius: '8px',
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          data-testid="submit-booking-button"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            px: 2.5,
            py: 1,
            borderRadius: '8px',
            bgcolor: isSoldOut ? 'error.main' : 'primary.main',
            color: isSoldOut ? 'error.contrastText' : 'primary.contrastText',
            '&:hover': {
              bgcolor: isSoldOut ? 'error.dark' : 'primary.light',
            },
          }}
        >
          {loading ? 'Processing...' : isSoldOut ? 'Attempt Registration (Check Capacity)' : 'Confirm & Reserve'}
        </Button>
      </Box>
    </Box>
  );
};
