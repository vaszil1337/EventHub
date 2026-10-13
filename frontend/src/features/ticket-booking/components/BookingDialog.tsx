import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  alpha,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import { Event } from '@/features/events/types';
import { Ticket } from '@/features/ticket-booking/types';
import { useTicketBooking } from '@/features/ticket-booking/hooks/useTicketBooking';
import { BookingForm } from './BookingForm';
import { BookingSuccess } from './BookingSuccess';

interface BookingDialogProps {
  open: boolean;
  event: Event | null;
  onClose: () => void;
  onBookingSuccess?: (ticket: Ticket) => void;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  event,
  onClose,
  onBookingSuccess,
}) => {
  const {
    participantName,
    setParticipantName,
    participantEmail,
    setParticipantEmail,
    loading,
    error,
    bookedTicket,
    openBooking,
    closeBooking,
    submitBooking,
  } = useTicketBooking({
    onSuccess: onBookingSuccess,
  });

  useEffect(() => {
    if (open && event) {
      openBooking(event);
    } else if (!open) {
      closeBooking();
    }
  }, [open, event, openBooking, closeBooking]);

  const handleClose = () => {
    closeBooking();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitBooking();
  };

  if (!event) return null;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
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
        },
      }}
      data-testid="booking-dialog"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1.5,
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
            <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em' }}>
            {bookedTicket ? 'Ticket Issued' : 'Book Event Ticket'}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, px: 1 }}>
        {bookedTicket ? (
          <BookingSuccess
            ticket={bookedTicket}
            event={event}
            onClose={handleClose}
          />
        ) : (
          <BookingForm
            event={event}
            participantName={participantName}
            onNameChange={setParticipantName}
            participantEmail={participantEmail}
            onEmailChange={setParticipantEmail}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
