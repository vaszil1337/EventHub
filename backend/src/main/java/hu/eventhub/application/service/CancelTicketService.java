package hu.eventhub.application.service;

import hu.eventhub.application.port.in.CancelTicketUseCase;
import hu.eventhub.domain.exception.TicketNotFoundException;
import hu.eventhub.domain.model.EventRepository;
import hu.eventhub.domain.model.Ticket;
import hu.eventhub.domain.model.TicketId;
import hu.eventhub.domain.model.TicketRepository;

import java.util.Objects;

public class CancelTicketService implements CancelTicketUseCase {
    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;

    public CancelTicketService(TicketRepository ticketRepository, EventRepository eventRepository) {
        this.ticketRepository = Objects.requireNonNull(ticketRepository, "ticketRepository cannot be null");
        this.eventRepository = Objects.requireNonNull(eventRepository, "eventRepository cannot be null");
    }

    public CancelTicketService(EventRepository eventRepository, TicketRepository ticketRepository) {
        this(ticketRepository, eventRepository);
    }

    @Override
    public Ticket cancelTicket(TicketId ticketId) {
        Objects.requireNonNull(ticketId, "ticketId cannot be null");
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new TicketNotFoundException("Ticket with ID \"" + ticketId.value() + "\" does not exist."));

        // Transitions status to CANCELLED (or throws InvalidBookingException if already cancelled)
        ticket.cancel();

        // Release capacity on the associated event & ticket tier
        eventRepository.findById(ticket.getEventId()).ifPresent(event -> {
            event.cancelBooking(ticket.getTicketTypeId());
            eventRepository.save(event);
        });

        return ticketRepository.save(ticket);
    }
}
