import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  alpha,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { Event, PricingRule } from '@/features/events/types';
import { eventService } from '@/features/events/services/eventService';
import { useTranslation } from '@/shared/context/I18nContext';
import { getLocalizedEventTitle } from '@/shared/utils/eventLocalization';

interface OrganizerEventDialogProps {
  open: boolean;
  onClose: () => void;
  events: Event[];
  onEventCreatedOrUpdated: (event: Event, actionLabel: string) => void;
}

export const OrganizerEventDialog: React.FC<OrganizerEventDialogProps> = ({
  open,
  onClose,
  events,
  onEventCreatedOrUpdated,
}) => {
  const { locale, t } = useTranslation();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create Event State
  const [title, setTitle] = useState<string>('');
  const [titleHu, setTitleHu] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [descriptionHu, setDescriptionHu] = useState<string>('');
  const [date, setDate] = useState<string>('2026-11-15T09:00:00Z');
  const [venueName, setVenueName] = useState<string>('');
  const [venueAddress, setVenueAddress] = useState<string>('');
  const [venueCapacity, setVenueCapacity] = useState<number>(120);
  const [basePriceAmount, setBasePriceAmount] = useState<number>(75);
  const [category, setCategory] = useState<string>('Technology');

  // Add Ticket Type State
  const [targetEventId, setTargetEventId] = useState<string>(events[0]?.id || 'evt-tech-summit-2026');
  const [tierName, setTierName] = useState<string>('');
  const [tierDescription, setTierDescription] = useState<string>('');
  const [tierPrice, setTierPrice] = useState<number>(50);
  const [tierQuota, setTierQuota] = useState<number>(20);
  const [pricingRule, setPricingRule] = useState<PricingRule>('EARLY_BIRD');

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !titleHu.trim()) {
      setError(t('organizer.bothTitlesRequired'));
      return;
    }
    if (!description.trim() || !descriptionHu.trim()) {
      setError(t('organizer.bothDescriptionsRequired'));
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const created = await eventService.createEvent({
        title,
        titleHu,
        description,
        descriptionHu,
        date,
        venueName,
        venueAddress,
        venueCapacity: Number(venueCapacity),
        basePriceAmount: Number(basePriceAmount),
        currency: 'USD',
        category,
      });
      setTitle('');
      setTitleHu('');
      setDescription('');
      setDescriptionHu('');
      setVenueName('');
      setVenueAddress('');
      const localizedTitle = getLocalizedEventTitle(created, locale);
      onEventCreatedOrUpdated(created, t('organizer.eventCreatedSuccess', { title: localizedTitle }));
      onClose();
    } catch (err: any) {
      setError(err?.body?.message || err?.message || 'Failed to create event.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicketType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const updated = await eventService.addTicketType(targetEventId, {
        name: tierName,
        description: tierDescription,
        basePriceAmount: Number(tierPrice),
        currency: 'USD',
        quota: Number(tierQuota),
        pricingRule,
      });
      const localizedTitle = getLocalizedEventTitle(updated, locale);
      setTierName('');
      setTierDescription('');
      onEventCreatedOrUpdated(updated, t('organizer.tierAddedSuccess', { tier: tierName, title: localizedTitle }));
      onClose();
    } catch (err: any) {
      setError(err?.body?.message || err?.message || 'Failed to add ticket tier.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: { xs: 1.5, sm: 2.5 },
          boxShadow: (theme) => `0 20px 25px -5px ${alpha(theme.palette.common.black, 0.1)}`,
          minHeight: 670,
          maxHeight: 670,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      data-testid="organizer-dialog"
    >
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          pt: 1,
          px: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {t('organizer.dialogTitle')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('organizer.dialogSubtitle')}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '16px !important', px: 1, flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setError(null);
          }}
          sx={{
            mb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              fontWeight: 600,
              fontSize: '0.85rem',
            },
          }}
        >
          <Tab icon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={t('organizer.tabCreateEvent')} />
          <Tab icon={<LocalOfferOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label={t('organizer.tabAddTicketTier')} />
        </Tabs>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'error.main',
              bgcolor: 'error.light',
              color: 'error.dark',
              fontSize: '0.8125rem',
            }}
          >
            {error}
          </Alert>
        )}

        {activeTab === 0 ? (
          <Box component="form" onSubmit={handleCreateEvent} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, pt: 0.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                required
                label={t('organizer.eventTitleEn')}
                placeholder="e.g. Cloud Native Summit Budapest"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="small"
                fullWidth
              />
              <TextField
                required
                label={t('organizer.eventTitleHu')}
                placeholder="pl. Cloud Native Csúcstalálkozó Budapest"
                value={titleHu}
                onChange={(e) => setTitleHu(e.target.value)}
                size="small"
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                required
                label={t('organizer.descriptionEn')}
                placeholder="Describe the agenda, speakers, and experience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={2}
                size="small"
                fullWidth
              />
              <TextField
                required
                label={t('organizer.descriptionHu')}
                placeholder="Ismertesd a programot, előadókat magyarul..."
                value={descriptionHu}
                onChange={(e) => setDescriptionHu(e.target.value)}
                multiline
                rows={2}
                size="small"
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                required
                label={t('organizer.category')}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                size="small"
              />
              <TextField
                required
                label={t('organizer.dateIso')}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                required
                label={t('organizer.venueName')}
                placeholder="e.g. Millenáris Hall"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                size="small"
              />
              <TextField
                required
                label={t('organizer.venueAddress')}
                placeholder="e.g. Kis Rókus u. 16, Budapest"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                required
                type="number"
                label={t('organizer.venueCapacity')}
                value={venueCapacity}
                onChange={(e) => setVenueCapacity(Number(e.target.value))}
                size="small"
              />
              <TextField
                required
                type="number"
                label={t('organizer.basePrice')}
                value={basePriceAmount}
                onChange={(e) => setBasePriceAmount(Number(e.target.value))}
                size="small"
              />
            </Box>

            {/* Starter Ticket Tiers Info Box */}
            <Box
              sx={{
                p: 1.25,
                borderRadius: '8px',
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                <LocalOfferOutlinedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {t('organizer.starterTiersTitle')}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.35, fontSize: '0.75rem' }}>
                {t('organizer.starterTiersNotice', { price: `$${basePriceAmount} USD`, capacity: venueCapacity })}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'divider', color: 'text.primary' }}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {t('organizer.createButton')}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleAddTicketType} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, pt: 0.5 }}>
            <TextField
              select
              required
              label={t('organizer.targetEvent')}
              value={targetEventId}
              onChange={(e) => setTargetEventId(e.target.value)}
              size="small"
              fullWidth
            >
              {events.map((ev) => (
                <MenuItem key={ev.id} value={ev.id}>
                  {getLocalizedEventTitle(ev, locale)} ({ev.soldTicketsCount}/{ev.venue.capacity} {t('organizer.seatsCount', { sold: ev.soldTicketsCount, capacity: ev.venue.capacity })})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              required
              label={t('organizer.tierName')}
              placeholder={t('organizer.tierNamePlaceholder')}
              value={tierName}
              onChange={(e) => setTierName(e.target.value)}
              size="small"
              fullWidth
            />

            <TextField
              required
              label={t('organizer.tierDescription')}
              placeholder={t('organizer.tierDescriptionPlaceholder')}
              value={tierDescription}
              onChange={(e) => setTierDescription(e.target.value)}
              size="small"
              fullWidth
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                required
                type="number"
                label={t('organizer.tierPrice')}
                value={tierPrice}
                onChange={(e) => setTierPrice(Number(e.target.value))}
                size="small"
              />
              <TextField
                required
                type="number"
                label={t('organizer.tierQuota')}
                value={tierQuota}
                onChange={(e) => setTierQuota(Number(e.target.value))}
                size="small"
              />
            </Box>

            <TextField
              select
              required
              label={t('organizer.pricingRule')}
              value={pricingRule}
              onChange={(e) => setPricingRule(e.target.value as PricingRule)}
              size="small"
              fullWidth
            >
              <MenuItem value="EARLY_BIRD">{t('organizer.ruleEarlyBird')}</MenuItem>
              <MenuItem value="STANDARD">{t('organizer.ruleStandard')}</MenuItem>
              <MenuItem value="DYNAMIC_SURGE">{t('organizer.ruleDynamic')}</MenuItem>
              <MenuItem value="VIP">{t('organizer.ruleVip')}</MenuItem>
              <MenuItem value="FIXED">{t('organizer.ruleFixed')}</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'divider', color: 'text.primary' }}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {t('organizer.addTierButton')}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
