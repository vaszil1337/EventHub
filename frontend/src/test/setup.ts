import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';
import { INITIAL_EVENTS } from '@/shared/utils/seedData';
import { Event } from '@/features/events/types';
import { Ticket } from '@/features/ticket-booking/types';

// Mock localStorage for headless test environment
if (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== 'function') {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => Array.from(store.keys())[index] || null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  }
}

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

  // POST /api/auth/login
  if (url === '/api/auth/login' && method === 'POST') {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    const isOrganizer = String(body.email || '').includes('organizer');
    return new Response(
      JSON.stringify({
        token: isOrganizer ? 'jwt-organizer-token' : 'jwt-participant-token',
        user: {
          id: isOrganizer ? 'usr-org-1' : 'usr-part-1',
          fullName: isOrganizer ? 'Anna Kovács' : 'Péter Nagy',
          email: body.email,
          role: isOrganizer ? 'ORGANIZER' : 'PARTICIPANT',
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // POST /api/auth/register
  if (url === '/api/auth/register' && method === 'POST') {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    return new Response(
      JSON.stringify({
        token: 'jwt-registered-token',
        user: {
          id: `usr-${Date.now()}`,
          fullName: body.fullName,
          email: body.email,
          role: body.role || 'PARTICIPANT',
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // GET /api/auth/me
  if (url === '/api/auth/me' && method === 'GET') {
    const authHeader = (init?.headers as Record<string, string>)?.[
      'Authorization'
    ] || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ status: 401, message: 'Unauthorized' }), { status: 401 });
    }
    const isOrganizer = authHeader.includes('organizer');
    return new Response(
      JSON.stringify({
        id: isOrganizer ? 'usr-org-1' : 'usr-part-1',
        fullName: isOrganizer ? 'Anna Kovács' : 'Péter Nagy',
        email: isOrganizer ? 'organizer@eventhub.hu' : 'participant@eventhub.hu',
        role: isOrganizer ? 'ORGANIZER' : 'PARTICIPANT',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // GET /api/events
  if (url === '/api/events' && method === 'GET') {
    return new Response(JSON.stringify(mockEvents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/events
  if (url === '/api/events' && method === 'POST') {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      title: body.title,
      description: body.description,
      date: body.date || new Date().toISOString(),
      venue: {
        id: `ven-${Date.now()}`,
        name: body.venueName,
        address: body.venueAddress,
        capacity: body.venueCapacity,
      },
      soldTicketsCount: 0,
      price: { amount: body.basePriceAmount, currency: body.currency || 'USD' },
      category: body.category || 'General',
    };
    mockEvents.push(newEvent);
    return new Response(JSON.stringify(newEvent), {
      status: 201,
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

  // PUT /api/events/:id
  if (eventMatch && method === 'PUT') {
    const id = eventMatch[1];
    const index = mockEvents.findIndex((e) => e.id === id);
    if (index === -1) {
      return new Response(JSON.stringify({ status: 404, message: 'Event not found' }), { status: 404 });
    }
    const body = init?.body ? JSON.parse(init.body as string) : {};
    const existing = mockEvents[index];
    const updated: Event = {
      ...existing,
      title: body.title !== undefined ? body.title : existing.title,
      description: body.description !== undefined ? body.description : existing.description,
      date: body.date !== undefined ? body.date : existing.date,
      venue: {
        ...existing.venue,
        name: body.venueName !== undefined ? body.venueName : existing.venue.name,
        address: body.venueAddress !== undefined ? body.venueAddress : existing.venue.address,
        capacity: body.venueCapacity !== undefined ? body.venueCapacity : existing.venue.capacity,
      },
      price: {
        amount: body.basePriceAmount !== undefined ? body.basePriceAmount : existing.price.amount,
        currency: body.currency !== undefined ? body.currency : existing.price.currency,
      },
      category: body.category !== undefined ? body.category : existing.category,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
    };
    mockEvents[index] = updated;
    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/tickets/book
  if (url === '/api/tickets/book' && method === 'POST') {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    const { eventId, participantName, participantEmail, ticketTypeId } = body;

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
    const isFailEmail = String(participantEmail || '').endsWith('@fail-email.test');
    const ticket: Ticket = {
      id: `tkt-${ticketCounter}`,
      ticketCode: `EVT-${ticketCounter}-A1B2`,
      eventId: event.id,
      participantName,
      participantEmail,
      price: event.price,
      purchaseDate: new Date().toISOString(),
      ticketTypeId: ticketTypeId || `${event.id}-standard`,
      ticketTypeName: 'Standard',
      status: 'VALID',
      emailStatus: isFailEmail ? 'FAILED_PENDING_RETRY' : 'SENT',
    };
    mockTickets.push(ticket);

    return new Response(JSON.stringify(ticket), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // POST /api/tickets/:id/cancel
  const cancelMatch = url.match(/^\/api\/tickets\/([^/?]+)\/cancel$/);
  if (cancelMatch && method === 'POST') {
    const ticketId = cancelMatch[1];
    const ticket = mockTickets.find((t) => t.id === ticketId);
    if (!ticket) {
      return new Response(JSON.stringify({ status: 404, message: 'Ticket not found' }), { status: 404 });
    }
    ticket.status = 'CANCELLED';
    const event = mockEvents.find((e) => e.id === ticket.eventId);
    if (event && event.soldTicketsCount > 0) {
      event.soldTicketsCount -= 1;
    }
    return new Response(JSON.stringify(ticket), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // GET /api/tickets (with optional ?email=...)
  if (url.startsWith('/api/tickets') && !url.startsWith('/api/tickets/event/') && method === 'GET') {
    const parsedUrl = new URL(url, 'http://localhost');
    const emailParam = parsedUrl.searchParams.get('email');
    let filtered = mockTickets;
    if (emailParam) {
      filtered = filtered.filter((t) => t.participantEmail.toLowerCase() === emailParam.toLowerCase());
    }
    return new Response(JSON.stringify(filtered), {
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
