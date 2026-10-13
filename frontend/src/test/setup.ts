import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';
import { INITIAL_EVENTS } from '@/shared/utils/seedData';
import { Event } from '@/features/events/types';
import { Ticket } from '@/features/ticket-booking/types';

// In-memory mock backend state for Vitest testing
let mockEvents: Event[] = [];
let mockTickets: Ticket[] = [];
let ticketCounter = 1000;

export function resetMockBackend(): void {
  mockEvents = JSON.parse(JSON.stringify(INITIAL_EVENTS));
  mockTickets = [];
  ticketCounter = 1000;
}

export function setMockEvents(events: Event[]): void {
  mockEvents = JSON.parse(JSON.stringify(events));
}

// Global fetch mock to simulate Spring Boot REST endpoints in JSDOM tests
globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method?.toUpperCase() || 'GET';

  // GET /api/events
  if (url === '/api/events' && method === 'GET') {
    return new Response(JSON.stringify(mockEvents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/events/reset
  if (url === '/api/events/reset' && method === 'POST') {
    resetMockBackend();
    return new Response(null, { status: 200 });
  }

  // GET /api/events/:id
  const eventMatch = url.match(/^\/api\/events\/([^/?]+)$/);
  if (eventMatch && method === 'GET') {
    const id = eventMatch[1];
    const event = mockEvents.find((e) => e.id === id);
    if (!event) {
      return new Response(
        JSON.stringify({
          status: 404,
          error: 'Not Found',
          message: `Event with id '${id}' not found.`,
          timestamp: new Date().toISOString(),
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify(event), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/tickets/book
  if (url === '/api/tickets/book' && method === 'POST') {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    const { eventId, participantName, participantEmail } = body;

    const event = mockEvents.find((e) => e.id === eventId);
    if (!event) {
      return new Response(
        JSON.stringify({
          status: 404,
          error: 'Not Found',
          message: `Event with id '${eventId}' does not exist.`,
          timestamp: new Date().toISOString(),
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (event.soldTicketsCount >= event.venue.capacity) {
      return new Response(
        JSON.stringify({
          status: 409,
          error: 'Conflict',
          message: `Capacity exceeded: Event '${event.title}' is fully booked (${event.venue.capacity}/${event.venue.capacity}).`,
          timestamp: new Date().toISOString(),
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    event.soldTicketsCount += 1;
    ticketCounter += 1;
    const ticket: Ticket = {
      id: `tkt-${ticketCounter}`,
      ticketCode: `EVT-${ticketCounter}-A1B2`,
      eventId: event.id,
      participantName,
      participantEmail,
      price: event.price,
      purchaseDate: new Date().toISOString(),
    };
    mockTickets.push(ticket);

    return new Response(JSON.stringify(ticket), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GET /api/tickets
  if (url === '/api/tickets' && method === 'GET') {
    return new Response(JSON.stringify(mockTickets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GET /api/tickets/event/:id
  const ticketEventMatch = url.match(/^\/api\/tickets\/event\/([^/?]+)$/);
  if (ticketEventMatch && method === 'GET') {
    const id = ticketEventMatch[1];
    const tickets = mockTickets.filter((t) => t.eventId === id);
    return new Response(JSON.stringify(tickets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Endpoint not mocked' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}) as any;

beforeEach(() => {
  resetMockBackend();
});
