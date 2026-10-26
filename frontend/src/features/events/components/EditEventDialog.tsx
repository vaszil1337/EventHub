import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  alpha,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Event } from '@/features/events/types';
import { eventService } from '@/features/events/services/eventService';

interface EditEventDialogProps {
  open: boolean;
  event: Event | null;
  onClose: () => void;
  onEventUpdated: (updatedEvent: Event) => void;
}

export const EditEventDialog: React.FC<EditEventDialogProps> = ({
  open,
  event,
  onClose,
  onEventUpdated,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [venueName, setVenueName] = useState<string>('');
  const [venueAddress, setVenueAddress] = useState<string>('');
  const [venueCapacity, setVenueCapacity] = useState<number>(100);
  const [basePriceAmount, setBasePriceAmount] = useState<number>(50);
  const [category, setCategory] = useState<string>('Technology');
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setDate(event.date);
      setVenueName(event.venue.name);
      setVenueAddress(event.venue.address);
      setVenueCapacity(event.venue.capacity);
      setBasePriceAmount(event.price.amount);
      setCategory(event.category || 'Technology');
      setImageUrl(event.imageUrl || '');
      setError(null);
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (venueCapacity < event.soldTicketsCount) {
      setError(`Venue capacity cannot be less than already reserved seats (${event.soldTicketsCount}).`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updated = await eventService.updateEvent(event.id, {
        title,
        description,
        date,
        venueName,
        venueAddress,
        venueCapacity: Number(venueCapacity),
        basePriceAmount: Number(basePriceAmount),
        currency: event.price.currency || 'USD',
        category,
        imageUrl,
      });

      onEventUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err?.body?.message || err?.message || 'Failed to update event.');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

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
          minHeight: 630,
          maxHeight: 630,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      data-testid="edit-event-dialog"
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
            <EditOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Edit Event
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Update event details, venue information, and base pricing
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '16px !important', px: 1.5, flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
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

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, flex: 1, pt: 0.5 }}>
          <TextField
            required
            label="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
            fullWidth
          />

          <TextField
            required
            label="Description"
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
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              size="small"
            />
            <TextField
              required
              label="Venue Address"
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
              helperText={`Bookings: ${event.soldTicketsCount} / ${event.venue.capacity}`}
              size="small"
            />
            <TextField
              required
              type="number"
              label="Base Ticket Price"
              value={basePriceAmount}
              onChange={(e) => setBasePriceAmount(Number(e.target.value))}
              size="small"
            />
          </Box>

          <TextField
            label="Cover Image URL (Optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            size="small"
            fullWidth
          />

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
              Save Changes
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
