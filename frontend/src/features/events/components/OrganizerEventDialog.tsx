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
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create Event State
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
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
    try {
      setLoading(true);
      setError(null);
      const created = await eventService.createEvent({
        title,
        description,
        date,
        venueName,
        venueAddress,
        venueCapacity: Number(venueCapacity),
        basePriceAmount: Number(basePriceAmount),
        currency: 'USD',
        category,
      });
      setTitle('');
      setDescription('');
      setVenueName('');
      setVenueAddress('');
      onEventCreatedOrUpdated(created, `Event "${created.title}" created with default ticket tiers.`);
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
      setTierName('');
      setTierDescription('');
      onEventCreatedOrUpdated(updated, `Added ticket tier "${tierName}" to "${updated.title}".`);
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
              Manage Events
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Create new events or add ticket pricing tiers
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
          <Tab icon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Create New Event" />
          <Tab icon={<LocalOfferOutlinedIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Add Ticket Tier" />
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
            <TextField
              required
              label="Event Title"
              placeholder="e.g. Cloud Native Summit Budapest"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              required
              label="Description"
              placeholder="Describe the agenda, speakers, and experience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              size="small"
              fullWidth
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                required
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                size="small"
              />
              <TextField
                required
                label="ISO Date (UTC)"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                required
                label="Venue Name"
                placeholder="e.g. Millenáris Hall"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                size="small"
              />
              <TextField
                required
                label="Venue Address"
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
                label="Venue Capacity (Max Seats)"
                value={venueCapacity}
                onChange={(e) => setVenueCapacity(Number(e.target.value))}
                size="small"
              />
              <TextField
                required
                type="number"
                label="Base Ticket Price (USD)"
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
                  Starter Ticket Tiers (Auto-generated)
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.35, fontSize: '0.75rem' }}>
                Upon creation, 3 starter tiers are automatically generated from your base price (${basePriceAmount} USD) & capacity ({venueCapacity} seats):
                <strong> Early Bird</strong> (-20%), <strong>Standard</strong>, and <strong>VIP</strong> (+10%). You can add additional custom tiers anytime in the <em>Add Ticket Tier</em> tab!
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'divider', color: 'text.primary' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                Create Event
              </Button>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleAddTicketType} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, pt: 0.5 }}>
            <TextField
              select
              required
              label="Target Event"
              value={targetEventId}
              onChange={(e) => setTargetEventId(e.target.value)}
              size="small"
              fullWidth
            >
              {events.map((ev) => (
                <MenuItem key={ev.id} value={ev.id}>
                  {ev.title} ({ev.soldTicketsCount}/{ev.venue.capacity} seats)
                </MenuItem>
              ))}
            </TextField>

            <TextField
              required
              label="Tier Name"
              placeholder="e.g. Student Pass / Backstage VIP"
              value={tierName}
              onChange={(e) => setTierName(e.target.value)}
              size="small"
              fullWidth
            />

            <TextField
              required
              label="Tier Description"
              placeholder="e.g. Discounted university pass with valid student ID"
              value={tierDescription}
              onChange={(e) => setTierDescription(e.target.value)}
              size="small"
              fullWidth
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <TextField
                required
                type="number"
                label="Base Price (USD)"
                value={tierPrice}
                onChange={(e) => setTierPrice(Number(e.target.value))}
                size="small"
              />
              <TextField
                required
                type="number"
                label="Tier Quota (Seats)"
                value={tierQuota}
                onChange={(e) => setTierQuota(Number(e.target.value))}
                size="small"
              />
            </Box>

            <TextField
              select
              required
              label="Pricing Strategy Rule"
              value={pricingRule}
              onChange={(e) => setPricingRule(e.target.value as PricingRule)}
              size="small"
              fullWidth
            >
              <MenuItem value="EARLY_BIRD">EARLY_BIRD (-20% discount below 50% occupancy)</MenuItem>
              <MenuItem value="STANDARD">STANDARD (+15% surge above 80% occupancy)</MenuItem>
              <MenuItem value="DYNAMIC_SURGE">DYNAMIC_SURGE (+15% high-demand surge)</MenuItem>
              <MenuItem value="VIP">VIP (+10% scarcity premium above 90% occupancy)</MenuItem>
              <MenuItem value="FIXED">FIXED (Constant price regardless of occupancy)</MenuItem>
            </TextField>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button onClick={onClose} variant="outlined" sx={{ borderColor: 'divider', color: 'text.primary' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                Add Ticket Tier
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
