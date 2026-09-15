import { Money } from '@/shared/types/money';

export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: Venue;
  soldTicketsCount: number;
  price: Money;
  category?: string;
  imageUrl?: string;
}
