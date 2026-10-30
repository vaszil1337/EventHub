import { Money } from '@/shared/types/money';

export type PricingRule = 'STANDARD' | 'EARLY_BIRD' | 'DYNAMIC_SURGE' | 'VIP' | 'FIXED';

export type UserRole = 'PARTICIPANT' | 'ORGANIZER';

export interface TicketType {
  id: string;
  name: string;
  description: string;
  basePrice: Money;
  effectivePrice: Money;
  quota: number;
  soldCount: number;
  pricingRule: PricingRule;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
}

export interface Event {
  id: string;
  title: string;
  titleHu?: string;
  description: string;
  descriptionHu?: string;
  date: string;
  venue: Venue;
  soldTicketsCount: number;
  price: Money;
  category?: string;
  imageUrl?: string;
  ticketTypes?: TicketType[];
}

export interface CreateEventInput {
  title: string;
  titleHu?: string;
  description: string;
  descriptionHu?: string;
  date: string;
  venueName: string;
  venueAddress: string;
  venueCapacity: number;
  basePriceAmount: number;
  currency: string;
  category: string;
  imageUrl?: string;
}

export interface AddTicketTypeInput {
  name: string;
  description: string;
  basePriceAmount: number;
  currency: string;
  quota: number;
  pricingRule: PricingRule;
}
