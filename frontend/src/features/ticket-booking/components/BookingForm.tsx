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
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { Event, TicketType } from '@/features/events/types';
import { formatMoney } from '@/shared/utils/formatters';

interface BookingFormProps {
  event: Event;
  participantName: string;
  onNameChange: (value: string) => void;
  participantEmail: string;
  onEmailChange: (value: string) => void;
  selectedTicketTypeId?: string;
  onTicketTypeChange?: (ticketTypeId: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function formatRuleLabel(tier: TicketType): string {
  if (tier.effectivePrice.amount < tier.basePrice.amount) {
    return 'EARLY BIRD -20%';
  }
  if (tier.effectivePrice.amount > tier.basePrice.amount) {
    return tier.pricingRule === 'VIP' ? 'SCARCITY +10%' : 'HIGH DEMAND +15%';
  }
  switch (tier.pricingRule) {
    case 'EARLY_BIRD':
      return 'EARLY BIRD TIER';
    case 'VIP':
      return 'VIP ACCESS';
    case 'DYNAMIC_SURGE':
      return 'DYNAMIC PRICING';
    case 'FIXED':
      return 'FIXED PRICE';
    default:
      return 'STANDARD TIER';
  }
}

export const BookingForm: React.FC<BookingFormProps> = ({
  event,
  participantName,
  onNameChange,
  participantEmail,
  onEmailChange,
  selectedTicketTypeId,
  onTicketTypeChange,
  loading,
  error,
  onSubmit,
  onCancel,
}) => {
  const isSoldOut = event.soldTicketsCount >= event.venue.capacity;
  const tiers = event.ticketTypes || [];
  const activeTier = tiers.find((t) => t.id === selectedTicketTypeId) || tiers[0];
  const displayPrice = activeTier ? activeTier.effectivePrice : event.price;

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
            Price: {formatMoney(displayPrice)}
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

      {/* Ticket Tier Selector (Multiple Ticket Types & Dynamic Pricing Strategy) */}
      {tiers.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <LocalOfferOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Select Ticket Tier (Dynamic Pricing)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {tiers.map((tier) => {
              const tierSoldOut = tier.soldCount >= tier.quota;
              const isSelected = (selectedTicketTypeId || tiers[0]?.id) === tier.id;
              const isDiscounted = tier.effectivePrice.amount < tier.basePrice.amount;
              const isSurged = tier.effectivePrice.amount > tier.basePrice.amount;

              return (
                <Box
                  key={tier.id}
                  onClick={() => {
                    if (!tierSoldOut && onTicketTypeChange) {
                      onTicketTypeChange(tier.id);
                    }
                  }}
                  data-testid={`ticket-tier-${tier.id}`}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: isSelected ? 'action.hover' : 'background.paper',
                    opacity: tierSoldOut ? 0.55 : 1,
                    cursor: tierSoldOut ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box sx={{ pr: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {tier.name}
                      </Typography>
                      <Box
                        sx={{
                          px: 0.85,
                          py: 0.15,
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: isDiscounted
                            ? 'success.light'
                            : isSurged
                              ? 'warning.light'
                              : 'background.default',
                          color: isDiscounted
                            ? 'success.dark'
                            : isSurged
                              ? 'warning.dark'
                              : 'text.secondary',
                          border: '1px solid',
                          borderColor: isDiscounted
                            ? 'success.main'
                            : isSurged
                              ? 'warning.main'
                              : 'divider',
                        }}
                      >
                        {formatRuleLabel(tier)}
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                      {tier.description} • {tier.quota - tier.soldCount} / {tier.quota} left
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    {tier.effectivePrice.amount !== tier.basePrice.amount && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'line-through',
                          display: 'block',
                          lineHeight: 1,
                        }}
                      >
                        {formatMoney(tier.basePrice)}
                      </Typography>
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {tierSoldOut ? 'Sold Out' : formatMoney(tier.effectivePrice)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

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
        placeholder="e.g. jane.doe@example.com (use @fail-email.test to test SMTP retry)"
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
