import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { I18nProvider } from '@/shared/context/I18nContext';
import { NotificationProvider } from '@/shared/context/NotificationContext';
import { EventsProvider } from '@/features/events/context/EventsContext';
import { TicketProvider } from '@/features/ticket-booking/context/TicketContext';
import { ModalProvider } from '@/shared/context/ModalContext';
import { MainLayout } from '@/shared/ui/MainLayout';
import { EventsPage } from '@/pages/EventsPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { TicketsPage } from '@/pages/TicketsPage';

export function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <NotificationProvider>
          <TicketProvider>
            <EventsProvider>
              <ModalProvider>
                <BrowserRouter>
                  <Routes>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<EventsPage />} />
                      <Route path="/events/:id" element={<EventDetailPage />} />
                      <Route path="/tickets" element={<TicketsPage />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </ModalProvider>
            </EventsProvider>
          </TicketProvider>
        </NotificationProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
