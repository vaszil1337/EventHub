import React, { createContext, useContext, ReactNode } from 'react';
import { useEvents } from '@/features/events/hooks/useEvents';
import { Event } from '@/features/events/types';

interface EventsContextValue {
  events: Event[];
  allEvents: Event[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: string[];
  refreshEvents: () => Promise<void>;
  resetEvents: () => Promise<void>;
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

export const EventsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const eventsData = useEvents();

  return (
    <EventsContext.Provider value={eventsData}>
      {children}
    </EventsContext.Provider>
  );
};

export function useEventsContext(): EventsContextValue {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEventsContext must be used within an EventsProvider');
  }
  return context;
}
