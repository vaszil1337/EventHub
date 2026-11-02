import React from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import { Event } from '@/features/events/types';
import { EventList } from '@/features/events/components/EventList';
import { useTranslation } from '@/shared/context/I18nContext';
import { useEventsContext } from '@/features/events/context/EventsContext';
import { useModal } from '@/shared/context/ModalContext';

function useSafeEventsContext() {
  try {
    return useEventsContext();
  } catch {
    return {
      events: [],
      allEvents: [],
      loading: false,
      error: null,
      searchTerm: '',
      setSearchTerm: () => {},
      selectedCategory: 'all',
      setSelectedCategory: () => {},
      categories: [],
      refreshEvents: async () => {},
      resetEvents: async () => {},
    };
  }
}

function useSafeModal() {
  try {
    return useModal();
  } catch {
    return {
      openAuthModal: () => {},
      closeAuthModal: () => {},
      openOrganizerModal: () => {},
      closeOrganizerModal: () => {},
      openBookingModal: () => {},
      closeBookingModal: () => {},
      openEditModal: () => {},
      closeEditModal: () => {},
    };
  }
}

export interface EventsPageProps {
  events?: Event[];
  allEvents?: Event[];
  loading?: boolean;
  error?: string | null;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (val: string) => void;
  categories?: string[];
  onBookTicket?: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
}

export const EventsPage: React.FC<EventsPageProps> = (props) => {
  const { t } = useTranslation();
  const contextEvents = useSafeEventsContext();
  const { openBookingModal, openEditModal } = useSafeModal();

  const events = props.events ?? contextEvents.events;
  const loading = props.loading ?? contextEvents.loading;
  const error = props.error !== undefined ? props.error : contextEvents.error;
  const searchTerm = props.searchTerm ?? contextEvents.searchTerm;
  const onSearchChange = props.onSearchChange ?? contextEvents.setSearchTerm;
  const selectedCategory = props.selectedCategory ?? contextEvents.selectedCategory;
  const onCategoryChange = props.onCategoryChange ?? contextEvents.setSelectedCategory;
  const categories = props.categories ?? contextEvents.categories;
  const onBookTicket = props.onBookTicket ?? openBookingModal;
  const onEditEvent = props.onEditEvent ?? openEditModal;

  return (
    <Box sx={{ pb: 8 }}>
      {/* Clean Editorial Header */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pt: { xs: 5, md: 7 },
          pb: { xs: 4, md: 5 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 680 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                color: 'text.primary',
                mb: 1.5,
                fontSize: { xs: '2rem', md: '2.5rem' },
                letterSpacing: '-0.03em',
              }}
            >
              {t('events.exploreTitle')}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
              }}
            >
              {t('events.exploreSubtitle')}
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Events Catalog */}
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <EventList
          events={events}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          categories={categories}
          onBookTicket={onBookTicket}
          onEditEvent={onEditEvent}
        />
      </Container>
    </Box>
  );
};
