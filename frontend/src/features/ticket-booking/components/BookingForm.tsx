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
import { useTranslation } from '@/shared/context/I18nContext';
import {
  getLocalizedEventTitle,
  getLocalizedTierName,
  getLocalizedTierDescription,
} from '@/shared/utils/eventLocalization';
import { translateBackendMessage } from '@/shared/utils/errorTranslator';

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

function formatRuleLabel(tier: TicketType, t: (key: any) => string): string {
  if (tier.effectivePrice.amount < tier.basePrice.amount) {
    return t('booking.ruleEarlyBirdDiscount');
  }
  if (tier.effectivePrice.amount > tier.basePrice.amount) {
    return tier.pricingRule === 'VIP' ? t('booking.ruleVipSurge') : t('booking.ruleHighDemandSurge');
  }
  switch (tier.pricingRule) {
    case 'EARLY_BIRD':
      return t('booking.ruleEarlyBirdTier');
    case 'VIP':
      return t('booking.ruleVipAccess');
    case 'DYNAMIC_SURGE':
      return t('booking.ruleDynamicPricing');
    case 'FIXED':
      return t('booking.ruleFixedPrice');
    default:
      return t('booking.ruleStandardTier');
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
  const { locale, t } = useTranslation();
  const isSoldOut = event.soldTicketsCount >= event.venue.capacity;
  const tiers = event.ticketTypes || [];
  const activeTier = tiers.find((t) => t.id === selectedTicketTypeId) || tiers[0];
  const displayPrice = activeTier ? activeTier.effectivePrice : event.price;
  const displayTitle = getLocalizedEventTitle(event, locale);

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
          {displayTitle}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 1 }}>
          <PlaceOutlinedIcon sx={{ fontSize: '0.9rem' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {event.venue.name} • {event.venue.address}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {t('events.price')}: {formatMoney(displayPrice, locale)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: isSoldOut ? 'error.main' : 'text.secondary',
            }}
          >
            {t('events.capacity')}: {event.soldTicketsCount}{t('events.seatsTaken', { capacity: event.venue.capacity })}
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
              {t('booking.selectTierTitle')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {tiers.map((tier) => {
              const tierSoldOut = tier.soldCount >= tier.quota;
              const isSelected = (selectedTicketTypeId || tiers[0]?.id) === tier.id;
              const isDiscounted = tier.effectivePrice.amount < tier.basePrice.amount;
              const isSurged = tier.effectivePrice.amount > tier.basePrice.amount;
              const tierName = getLocalizedTierName(tier.name, locale);
              const tierDescription = getLocalizedTierDescription(tier.description, locale);

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
                        {tierName}
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
                        {formatRuleLabel(tier, t)}
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                      {tierDescription} • {t('booking.leftBadge', { count: tier.quota - tier.soldCount, quota: tier.quota })}
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
                        {formatMoney(tier.basePrice, locale)}
                      </Typography>
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {tierSoldOut ? t('events.soldOut') : formatMoney(tier.effectivePrice, locale)}
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
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
            fontSize: '0.8125rem',
          }}
          data-testid="capacity-warning-alert"
        >
          <strong>{t('booking.capacityNoticeTitle')}</strong> {t('booking.capacityNoticeText', { sold: event.soldTicketsCount, capacity: event.venue.capacity })}
        </Alert>
      )}

      {/* Dynamic Backend Error Alert */}
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
          {translateBackendMessage(error, t)}
        </Alert>
      )}

      {/* Booking Form Fields */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          required
          fullWidth
          size="small"
          label={t('booking.participantName')}
          placeholder={t('booking.participantNamePlaceholder')}
          value={participantName}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: <PersonOutlineIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          inputProps={{
            'data-testid': 'input-participant-name',
          }}
        />

        <TextField
          required
          fullWidth
          size="small"
          type="email"
          label={t('booking.participantEmail')}
          placeholder={t('booking.participantEmailPlaceholder')}
          value={participantEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: <MailOutlineIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          inputProps={{
            'data-testid': 'input-participant-email',
          }}
        />

        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', mt: 1 }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              fontWeight: 600,
              borderRadius: '8px',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover',
              },
            }}
          >
            {t('common.cancel')}
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            data-testid="submit-booking-button"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              fontWeight: 600,
              borderRadius: '8px',
              px: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.light',
              },
            }}
          >
            {loading ? t('booking.processing') : isSoldOut ? t('booking.attemptRegistration') : t('booking.confirmButton')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
