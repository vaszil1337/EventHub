package hu.eventhub.application.service;

import hu.eventhub.application.port.in.ResetEventsUseCase;
import hu.eventhub.domain.model.EventRepository;
import hu.eventhub.domain.model.TicketRepository;

import java.util.Objects;

public class ResetEventsService implements ResetEventsUseCase {
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;

    public ResetEventsService(EventRepository eventRepository, TicketRepository ticketRepository) {
        this.eventRepository = Objects.requireNonNull(eventRepository, "eventRepository cannot be null");
        this.ticketRepository = Objects.requireNonNull(ticketRepository, "ticketRepository cannot be null");
    }

    @Override
    public void reset() {
        ticketRepository.reset();
        eventRepository.resetToSampleData();
    }
}
