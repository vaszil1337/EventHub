package hu.eventhub.application.service;

import hu.eventhub.application.port.in.CancelTicketUseCase;
import hu.eventhub.domain.exception.InvalidBookingException;
import hu.eventhub.domain.exception.TicketNotFoundException;
import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventRepository;
import hu.eventhub.domain.model.Ticket;
import hu.eventhub.domain.model.TicketId;
import hu.eventhub.domain.model.TicketRepository;

import java.time.Clock;
import java.util.Objects;
import java.util.Optional;

public class CancelTicketService implements CancelTicketUseCase {
    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;
    private final Clock clock;

    public CancelTicketService(TicketRepository ticketRepository, EventRepository eventRepository, Clock clock) {
        this.ticketRepository = Objects.requireNonNull(ticketRepository, "ticketRepository cannot be null");
        this.eventRepository = Objects.requireNonNull(eventRepository, "eventRepository cannot be null");
        this.clock = Objects.requireNonNull(clock, "clock cannot be null");
    }

    public CancelTicketService(EventRepository eventRepository, TicketRepository ticketRepository, Clock clock) {
        this(ticketRepository, eventRepository, clock);
    }

    public CancelTicketService(TicketRepository ticketRepository, EventRepository eventRepository) {
        this(ticketRepository, eventRepository, Clock.systemUTC());
    }

    public CancelTicketService(EventRepository eventRepository, TicketRepository ticketRepository) {
        this(ticketRepository, eventRepository, Clock.systemUTC());
    }

    @Override
    public Ticket cancelTicket(TicketId ticketId) {
        Objects.requireNonNull(ticketId, "ticketId cannot be null");
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket with ID \"" + ticketId.value() + "\" does not exist."));

        Optional<Event> eventOpt = eventRepository.findById(ticket.getEventId());
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            if (event.getDate().isBefore(clock.instant())) {
                throw new InvalidBookingException("Cannot cancel a ticket for an event that has already ended.");
            }
        }

        // Transitions status to CANCELLED (or throws InvalidBookingException if already cancelled)
        ticket.cancel();

        // Release capacity on the associated event & ticket tier
        eventOpt.ifPresent(event -> {
            event.cancelBooking(ticket.getTicketTypeId());
            eventRepository.save(event);
        });

        return ticketRepository.save(ticket);
    }
}
