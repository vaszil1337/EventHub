import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from '@/shared/ui/Navbar';
import { NotificationSnackbar, NotificationState } from '@/shared/ui/NotificationSnackbar';
import { useEvents } from '@/features/events/hooks/useEvents';
import { BookingDialog } from '@/features/ticket-booking/components/BookingDialog';
import { OrganizerEventDialog } from '@/features/events/components/OrganizerEventDialog';
import { Event, UserRole } from '@/features/events/types';
import { Ticket } from '@/features/ticket-booking/types';
import { ticketService } from '@/features/ticket-booking/services/ticketService';
import { EventsPage } from '@/pages/EventsPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { TicketsPage } from '@/pages/TicketsPage';

export function App() {
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

  const [userRole, setUserRole] = useState<UserRole>('PARTICIPANT');
  const [isOrganizerDialogOpen, setIsOrganizerDialogOpen] = useState<boolean>(false);
  const [selectedEventForBooking, setSelectedEventForBooking] = useState<Event | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [bookingRefreshKey, setBookingRefreshKey] = useState<number>(0);

  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const updateTicketCount = useCallback(async () => {
    try {
      const tickets = await ticketService.getTickets();
      const validTickets = tickets.filter((t) => t.status !== 'CANCELLED');
      setTotalTickets(validTickets.length);
    } catch {
      setTotalTickets(0);
    }
  }, []);

  useEffect(() => {
    updateTicketCount();
  }, [updateTicketCount, bookingRefreshKey]);

  const handleOpenBooking = (event: Event) => {
    setSelectedEventForBooking(event);
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
  };

  const handleBookingSuccess = async (ticket: Ticket) => {
    await refreshEvents();
    await updateTicketCount();
    setBookingRefreshKey((prev) => prev + 1);
    setNotification({
      open: true,
      message: `Success! Ticket ${ticket.ticketCode} reserved for ${ticket.participantName}.`,
      severity: 'success',
    });
  };

  const handleTicketCancelled = async (ticket: Ticket) => {
    await refreshEvents();
    await updateTicketCount();
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

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <Navbar
          totalTicketsCount={totalTickets}
          userRole={userRole}
          onRoleChange={setUserRole}
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
                />
              }
            />

            {/* Event Detail Page */}
            <Route
              path="/events/:id"
              element={<EventDetailPage onBookTicket={handleOpenBooking} />}
            />

            {/* Tickets Page */}
            <Route
              path="/tickets"
              element={
                <TicketsPage
                  key={bookingRefreshKey}
                  userRole={userRole}
                  onTicketCancelled={handleTicketCancelled}
                />
              }
            />
          </Routes>
        </Box>

        {/* Booking Dialog Modal */}
        <BookingDialog
          open={isBookingOpen}
          event={selectedEventForBooking}
          onClose={handleCloseBooking}
          onBookingSuccess={handleBookingSuccess}
        />

        {/* Organizer Management Modal */}
        <OrganizerEventDialog
          open={isOrganizerDialogOpen}
          onClose={() => setIsOrganizerDialogOpen(false)}
          events={allEvents}
          userRole={userRole}
          onEventCreatedOrUpdated={handleOrganizerSuccess}
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

export default App;
