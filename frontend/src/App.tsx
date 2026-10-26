import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from '@/shared/ui/Navbar';
import { NotificationSnackbar, NotificationState } from '@/shared/ui/NotificationSnackbar';
import { useEvents } from '@/features/events/hooks/useEvents';
import { BookingDialog } from '@/features/ticket-booking/components/BookingDialog';
import { OrganizerEventDialog } from '@/features/events/components/OrganizerEventDialog';
import { EditEventDialog } from '@/features/events/components/EditEventDialog';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { AuthDialog } from '@/features/auth/components/AuthDialog';
import { AuthUser } from '@/features/auth/types';
import { Event } from '@/features/events/types';
import { Ticket } from '@/features/ticket-booking/types';
import { ticketService } from '@/features/ticket-booking/services/ticketService';
import { EventsPage } from '@/pages/EventsPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { TicketsPage } from '@/pages/TicketsPage';

function AppShell() {
  const { user, logout } = useAuth();
  const {
    events,
    allEvents,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    categories,
    refreshEvents,
  } = useEvents();

  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState<boolean>(false);
  const [isOrganizerDialogOpen, setIsOrganizerDialogOpen] = useState<boolean>(false);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<Event | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [bookingRefreshKey, setBookingRefreshKey] = useState<number>(0);

  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const updateTicketCount = useCallback(async () => {
    try {
      if (!user) {
        return;
      }
      const tickets = user.role === 'ORGANIZER'
        ? await ticketService.getTickets()
        : await ticketService.getTickets(user.email);
      const validTickets = tickets.filter((t) => t.status !== 'CANCELLED');
      setTotalTickets(validTickets.length);
    } catch {
      setTotalTickets(0);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      updateTicketCount();
    }
  }, [user, updateTicketCount, bookingRefreshKey]);

  const handleOpenBooking = (event: Event) => {
    setSelectedEventForBooking(event);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const handleOpenEdit = (event: Event) => {
    setSelectedEventForEdit(event);
    setIsEditDialogOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedEventForEdit(null);
  };

  const handleEventUpdated = (updated: Event) => {
    refreshEvents();
    setNotification({
      open: true,
      message: `Event "${updated.title}" successfully updated.`,
      severity: 'success',
    });
  };

  const handleBookingSuccess = async (ticket: Ticket) => {
    await refreshEvents();
    if (user) {
      await updateTicketCount();
    } else {
      setTotalTickets((prev) => prev + 1);
    }
    setBookingRefreshKey((prev) => prev + 1);
    const cleanParticipantName = ticket.participantName.replace(/\s*\((Organizer|Participant|Szervező|Résztvevő)\)/gi, '').trim();
    setNotification({
      open: true,
      message: `Success! Ticket ${ticket.ticketCode} reserved for ${cleanParticipantName}.`,
      severity: 'success',
    });
  };

  const handleTicketCancelled = async (ticket: Ticket) => {
    await refreshEvents();
    if (user) {
      await updateTicketCount();
    } else {
      setTotalTickets((prev) => Math.max(0, prev - 1));
    }
    setNotification({
      open: true,
      message: `Reservation ${ticket.ticketCode} cancelled. Seat capacity has been released.`,
      severity: 'info',
    });
  };

  const handleOrganizerSuccess = async (_event: Event, actionLabel: string) => {
    await refreshEvents();
    setNotification({
      open: true,
      message: actionLabel,
      severity: 'success',
    });
  };

  const handleAuthSuccess = (authenticatedUser: AuthUser) => {
    const cleanName = authenticatedUser.fullName.replace(/\s*\((Organizer|Participant|Szervező|Résztvevő)\)/gi, '').trim();
    setNotification({
      open: true,
      message: `Signed in as ${cleanName} (${authenticatedUser.role}).`,
      severity: 'success',
    });
  };

  const handleLogout = () => {
    logout();
    setTotalTickets(0);
    setNotification({
      open: true,
      message: 'Signed out successfully.',
      severity: 'info',
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <Navbar
          totalTicketsCount={totalTickets}
          user={user}
          onOpenAuthDialog={() => setIsAuthDialogOpen(true)}
          onLogout={handleLogout}
          onOpenOrganizerDialog={() => setIsOrganizerDialogOpen(true)}
        />

        {/* Main Routes Content */}
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            {/* Events Home Page */}
            <Route
              path="/"
              element={
                <EventsPage
                  events={events}
                  allEvents={allEvents}
                  loading={loading}
                  error={error}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  categories={categories}
                  onBookTicket={handleOpenBooking}
                  onEditEvent={handleOpenEdit}
                />
              }
            />

            {/* Event Detail Page */}
            <Route
              path="/events/:id"
              element={<EventDetailPage onBookTicket={handleOpenBooking} onEditEvent={handleOpenEdit} />}
            />

            {/* Tickets Page */}
            <Route
              path="/tickets"
              element={
                <TicketsPage
                  key={bookingRefreshKey}
                  userRole={user?.role || 'PARTICIPANT'}
                  onTicketCancelled={handleTicketCancelled}
                  onOpenAuth={() => setIsAuthDialogOpen(true)}
                />
              }
            />
          </Routes>
        </Box>

        {/* Booking Dialog Modal */}
        <BookingDialog
          open={isBookingOpen}
          event={selectedEventForBooking}
          currentUser={user}
          onClose={handleCloseBooking}
          onBookingSuccess={handleBookingSuccess}
        />

        {/* Authentication Modal */}
        <AuthDialog
          open={isAuthDialogOpen}
          onClose={() => setIsAuthDialogOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Organizer Management Modal */}
        <OrganizerEventDialog
          open={isOrganizerDialogOpen}
          onClose={() => setIsOrganizerDialogOpen(false)}
          events={allEvents}
          onEventCreatedOrUpdated={handleOrganizerSuccess}
        />

        {/* Organizer Edit Event Modal */}
        <EditEventDialog
          open={isEditDialogOpen}
          event={selectedEventForEdit}
          onClose={handleCloseEdit}
          onEventUpdated={handleEventUpdated}
        />

        {/* Global Notification Feedback */}
        <NotificationSnackbar
          notification={notification}
          onClose={handleCloseNotification}
        />

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Box sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontWeight: 500 }}>
            EventHub • Event & Ticket Management
          </Box>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
