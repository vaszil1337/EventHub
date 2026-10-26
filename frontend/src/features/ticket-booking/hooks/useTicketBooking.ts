import { useState, useCallback } from 'react';
import { Event } from '@/features/events/types';
import { Ticket } from '@/features/ticket-booking/types';
import { ticketService } from '@/features/ticket-booking/services/ticketService';

interface UseTicketBookingOptions {
  onSuccess?: (ticket: Ticket) => void;
}

export function useTicketBooking({ onSuccess }: UseTicketBookingOptions = {}) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [participantName, setParticipantName] = useState<string>('');
  const [participantEmail, setParticipantEmail] = useState<string>('');
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedTicket, setBookedTicket] = useState<Ticket | null>(null);

  const openBooking = useCallback((event: Event) => {
    setSelectedEvent(event);
    setParticipantName('');
    setParticipantEmail('');
    const firstAvailableTier = event.ticketTypes?.find((tt) => tt.soldCount < tt.quota) || event.ticketTypes?.[0];
    setSelectedTicketTypeId(firstAvailableTier ? firstAvailableTier.id : '');
    setError(null);
    setBookedTicket(null);
    setIsOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setIsOpen(false);
    setLoading(false);
    setError(null);
    setBookedTicket(null);
  }, []);

  const submitBooking = useCallback(async () => {
    if (!selectedEvent) return null;

    try {
      setLoading(true);
      setError(null);

      const ticket = await ticketService.bookTicket({
        eventId: selectedEvent.id,
        participantName,
        participantEmail,
        ticketTypeId: selectedTicketTypeId || undefined,
      });

      setBookedTicket(ticket);
      if (onSuccess) {
        onSuccess(ticket);
      }
      return ticket;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete booking.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedEvent, participantName, participantEmail, selectedTicketTypeId, onSuccess]);

  return {
    isOpen,
    selectedEvent,
    participantName,
    setParticipantName,
    participantEmail,
    setParticipantEmail,
    selectedTicketTypeId,
    setSelectedTicketTypeId,
    loading,
    error,
    bookedTicket,
    openBooking,
    closeBooking,
    submitBooking,
  };
}
