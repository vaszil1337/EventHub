import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from '@/shared/ui/Navbar';
import { NotificationSnackbar, NotificationState } from '@/shared/ui/NotificationSnackbar';
import { useEvents } from '@/features/events/hooks/useEvents';
import { BookingDialog } from '@/features/ticket-booking/components/BookingDialog';
import { Event } from '@/features/events/types';
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
      setTotalTickets(tickets.length);
    } catch {
      // Fallback
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
    setBookingRefreshKey((prev) => prev + 1); // Trigger TicketsPage refresh
    setNotification({
      open: true,
      message: `Success! Ticket ${ticket.ticketCode} reserved for ${ticket.participantName}.`,
      severity: 'success',
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <Navbar totalTicketsCount={totalTickets} />

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
            <Route path="/tickets" element={<TicketsPage key={bookingRefreshKey} />} />
          </Routes>
        </Box>

        {/* Booking Dialog Modal */}
        <BookingDialog
          open={isBookingOpen}
          event={selectedEventForBooking}
          onClose={handleCloseBooking}
          onBookingSuccess={handleBookingSuccess}
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
