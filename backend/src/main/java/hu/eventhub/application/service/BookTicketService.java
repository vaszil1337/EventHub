package hu.eventhub.application.service;

import hu.eventhub.application.port.in.BookTicketCommand;
import hu.eventhub.application.port.in.BookTicketUseCase;
import hu.eventhub.domain.exception.EventNotFoundException;
import hu.eventhub.domain.model.*;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class BookTicketService implements BookTicketUseCase {
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final TicketCodeGenerator ticketCodeGenerator;
    private final Clock clock;

    public BookTicketService(
            EventRepository eventRepository,
            TicketRepository ticketRepository,
            TicketCodeGenerator ticketCodeGenerator,
            Clock clock
    ) {
        this.eventRepository = Objects.requireNonNull(eventRepository, "eventRepository cannot be null");
        this.ticketRepository = Objects.requireNonNull(ticketRepository, "ticketRepository cannot be null");
        this.ticketCodeGenerator = Objects.requireNonNull(ticketCodeGenerator, "ticketCodeGenerator cannot be null");
        this.clock = Objects.requireNonNull(clock, "clock cannot be null");
    }

    @Override
    public Ticket bookTicket(BookTicketCommand command) {
        EventId eventId = EventId.of(command.eventId());
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event with ID \"" + command.eventId() + "\" does not exist."));

        // Critical Business Rule: Enforces capacity constraint via domain aggregate root
        event.recordBooking();

        // Persist updated event capacity state
        eventRepository.save(event);

        // Generate unique ticket code and persist ticket
        TicketId ticketId = TicketId.of(UUID.randomUUID().toString());
        TicketCode ticketCode = ticketCodeGenerator.generate();
        Instant purchaseDate = clock.instant();

        Ticket ticket = new Ticket(
                ticketId,
                eventId,
                command.participantName().trim(),
                command.participantEmail().trim(),
                ticketCode,
                event.getPrice(),
                purchaseDate
        );

        return ticketRepository.save(ticket);
    }
}
