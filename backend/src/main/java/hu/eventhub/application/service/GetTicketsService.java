package hu.eventhub.application.service;

import hu.eventhub.application.port.in.GetTicketsUseCase;
import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.Ticket;
import hu.eventhub.domain.model.TicketRepository;

import java.util.List;
import java.util.Objects;

public class GetTicketsService implements GetTicketsUseCase {
    private final TicketRepository ticketRepository;

    public GetTicketsService(TicketRepository ticketRepository) {
        this.ticketRepository = Objects.requireNonNull(ticketRepository, "ticketRepository cannot be null");
    }

    @Override
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    @Override
    public List<Ticket> getTicketsByEventId(EventId eventId) {
        return ticketRepository.findByEventId(eventId);
    }
}
