import { Money } from '@/shared/types/money';

export type TicketStatus = 'VALID' | 'CANCELLED';
export type EmailDeliveryStatus = 'SENT' | 'FAILED_PENDING_RETRY';

export interface Ticket {
  id: string;
  eventId: string;
  participantName: string;
  participantEmail: string;
  ticketCode: string;
  price: Money;
  purchaseDate: string;
  ticketTypeId?: string;
  ticketTypeName?: string;
  status?: TicketStatus;
  emailStatus?: EmailDeliveryStatus;
}

export interface BookingRequest {
  eventId: string;
  participantName: string;
  participantEmail: string;
  ticketTypeId?: string;
}

/**
 * Custom error thrown when attempting to book a ticket for an event that has reached full capacity.
 */
export class CapacityExceededError extends Error {
  constructor(message = 'Event has reached full capacity. No more tickets can be issued.') {
    super(message);
    this.name = 'CapacityExceededError';
    Object.setPrototypeOf(this, CapacityExceededError.prototype);
  }
}

/**
 * Custom error thrown when invalid booking data is supplied.
 */
export class BookingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingValidationError';
    Object.setPrototypeOf(this, BookingValidationError.prototype);
  }
}
