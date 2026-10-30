import React from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import { Event } from '@/features/events/types';
import { EventList } from '@/features/events/components/EventList';
import { useTranslation } from '@/shared/context/I18nContext';

interface EventsPageProps {
  events: Event[];
  allEvents?: Event[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  categories: string[];
  onBookTicket: (event: Event) => void;
  onEditEvent?: (event: Event) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  loading,
  error,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onBookTicket,
  onEditEvent,
}) => {
  const { t } = useTranslation();

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
