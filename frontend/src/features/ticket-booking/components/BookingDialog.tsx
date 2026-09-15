import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
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
          borderRadius: 3,
          p: { xs: 1, sm: 2 },
        },
      }}
      data-testid="booking-dialog"
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ConfirmationNumberIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {bookedTicket ? 'Ticket Issued' : 'Book Event Ticket'}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
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
