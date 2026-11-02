import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ticketService } from '@/features/ticket-booking/services/ticketService';

interface TicketContextValue {
  totalTickets: number;
  refreshTicketCount: () => Promise<void>;
  incrementTicketCount: () => void;
  decrementTicketCount: () => void;
  resetTicketCount: () => void;
}

const TicketContext = createContext<TicketContextValue | undefined>(undefined);

export const TicketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [totalTickets, setTotalTickets] = useState<number>(0);

  const refreshTicketCount = useCallback(async () => {
    if (!user) {
      setTotalTickets(0);
      return;
    }
    try {
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
    refreshTicketCount();
  }, [refreshTicketCount]);

  const incrementTicketCount = useCallback(() => {
    setTotalTickets((prev) => prev + 1);
  }, []);

  const decrementTicketCount = useCallback(() => {
    setTotalTickets((prev) => Math.max(0, prev - 1));
  }, []);

  const resetTicketCount = useCallback(() => {
    setTotalTickets(0);
  }, []);

  return (
    <TicketContext.Provider
      value={{
        totalTickets,
        refreshTicketCount,
        incrementTicketCount,
        decrementTicketCount,
        resetTicketCount,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export function useTicket(): TicketContextValue {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTicket must be used within a TicketProvider');
  }
  return context;
}
