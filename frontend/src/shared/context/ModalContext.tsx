import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useTranslation } from '@/shared/context/I18nContext';
import { useNotification } from '@/shared/context/NotificationContext';
import { useTicket } from '@/features/ticket-booking/context/TicketContext';
import { useEventsContext } from '@/features/events/context/EventsContext';
import { Event } from '@/features/events/types';
import { Ticket } from '@/features/ticket-booking/types';
import { AuthUser } from '@/features/auth/types';
import { getLocalizedEventTitle } from '@/shared/utils/eventLocalization';

import { BookingDialog } from '@/features/ticket-booking/components/BookingDialog';
import { AuthDialog } from '@/features/auth/components/AuthDialog';
import { OrganizerEventDialog } from '@/features/events/components/OrganizerEventDialog';
import { EditEventDialog } from '@/features/events/components/EditEventDialog';

interface ModalContextValue {
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openOrganizerModal: () => void;
  closeOrganizerModal: () => void;
  openBookingModal: (event: Event) => void;
  closeBookingModal: () => void;
  openEditModal: (event: Event) => void;
  closeEditModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const { notify } = useNotification();
  const { refreshTicketCount, incrementTicketCount } = useTicket();
  const { allEvents, refreshEvents } = useEventsContext();

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState<boolean>(false);
  const [bookingEvent, setBookingEvent] = useState<Event | null>(null);
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  const openAuthModal = useCallback(() => setIsAuthOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthOpen(false), []);

  const openOrganizerModal = useCallback(() => setIsOrganizerOpen(true), []);
  const closeOrganizerModal = useCallback(() => setIsOrganizerOpen(false), []);

  const openBookingModal = useCallback((event: Event) => setBookingEvent(event), []);
  const closeBookingModal = useCallback(() => setBookingEvent(null), []);

  const openEditModal = useCallback((event: Event) => setEditEvent(event), []);
  const closeEditModal = useCallback(() => setEditEvent(null), []);

  const handleAuthSuccess = useCallback(
    (authenticatedUser: AuthUser) => {
      const cleanName = authenticatedUser.fullName
        .replace(/\s*\((Organizer|Participant|Szervező|Résztvevő)\)/gi, '')
        .trim();
      const roleLabel =
        authenticatedUser.role === 'ORGANIZER' ? t('auth.organizer') : t('auth.participant');
      notify(t('auth.signedInAs', { name: cleanName, role: roleLabel }), 'success');
      refreshTicketCount();
    },
    [notify, refreshTicketCount, t]
  );

  const handleBookingSuccess = useCallback(
    async (ticket: Ticket) => {
      await refreshEvents();
      if (user) {
        await refreshTicketCount();
      } else {
        incrementTicketCount();
      }
      const cleanParticipantName = ticket.participantName
        .replace(/\s*\((Organizer|Participant|Szervező|Résztvevő)\)/gi, '')
        .trim();
      notify(
        t('booking.ticketReservedSuccess', {
          code: ticket.ticketCode,
          name: cleanParticipantName,
        }),
        'success'
      );
    },
    [incrementTicketCount, notify, refreshEvents, refreshTicketCount, t, user]
  );

  const handleOrganizerSuccess = useCallback(
    async (_event: Event, actionLabel: string) => {
      await refreshEvents();
      notify(actionLabel, 'success');
    },
    [notify, refreshEvents]
  );

  const handleEventUpdated = useCallback(
    (updated: Event) => {
      refreshEvents();
      const localizedTitle = getLocalizedEventTitle(updated, locale);
      notify(t('organizer.eventUpdatedSuccess', { title: localizedTitle }), 'success');
    },
    [locale, notify, refreshEvents, t]
  );

  return (
    <ModalContext.Provider
      value={{
        openAuthModal,
        closeAuthModal,
        openOrganizerModal,
        closeOrganizerModal,
        openBookingModal,
        closeBookingModal,
        openEditModal,
        closeEditModal,
      }}
    >
      {children}

      {/* Booking Dialog Modal */}
      <BookingDialog
        open={Boolean(bookingEvent)}
        event={bookingEvent}
        currentUser={user}
        onClose={closeBookingModal}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Authentication Modal */}
      <AuthDialog
        open={isAuthOpen}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Organizer Management Modal */}
      <OrganizerEventDialog
        open={isOrganizerOpen}
        onClose={closeOrganizerModal}
        events={allEvents}
        onEventCreatedOrUpdated={handleOrganizerSuccess}
      />

      {/* Organizer Edit Event Modal */}
      <EditEventDialog
        open={Boolean(editEvent)}
        event={editEvent}
        onClose={closeEditModal}
        onEventUpdated={handleEventUpdated}
      />
    </ModalContext.Provider>
  );
};

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
