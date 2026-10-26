package hu.eventhub.application.service;

import hu.eventhub.application.port.in.BookTicketCommand;
import hu.eventhub.application.port.in.BookTicketUseCase;
import hu.eventhub.application.port.out.EmailNotificationPort;
import hu.eventhub.domain.exception.EventNotFoundException;
import hu.eventhub.domain.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class BookTicketService implements BookTicketUseCase {
    private static final Logger log = LoggerFactory.getLogger(BookTicketService.class);

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final TicketCodeGenerator ticketCodeGenerator;
    private final Clock clock;
    private final EmailNotificationPort emailNotificationPort;

    public BookTicketService(
            EventRepository eventRepository,
            TicketRepository ticketRepository,
            TicketCodeGenerator ticketCodeGenerator,
            Clock clock
    ) {
        this(eventRepository, ticketRepository, ticketCodeGenerator, clock, (ticket, event) -> {});
    }

    public BookTicketService(
            EventRepository eventRepository,
            TicketRepository ticketRepository,
            TicketCodeGenerator ticketCodeGenerator,
            Clock clock,
            EmailNotificationPort emailNotificationPort
    ) {
        this.eventRepository = Objects.requireNonNull(eventRepository, "eventRepository cannot be null");
        this.ticketRepository = Objects.requireNonNull(ticketRepository, "ticketRepository cannot be null");
        this.ticketCodeGenerator = Objects.requireNonNull(ticketCodeGenerator, "ticketCodeGenerator cannot be null");
        this.clock = Objects.requireNonNull(clock, "clock cannot be null");
        this.emailNotificationPort = Objects.requireNonNull(emailNotificationPort, "emailNotificationPort cannot be null");
    }

    @Override
    public Ticket bookTicket(BookTicketCommand command) {
        EventId eventId = EventId.of(command.eventId());
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event with ID \"" + command.eventId() + "\" does not exist."));

        Capacity capacityBeforeBooking = event.getCapacity();

        String resolvedTierId;
        String resolvedTierName;
        Money effectivePrice;

        if (command.ticketTypeId() != null && !command.ticketTypeId().isBlank()) {
            TicketType bookedTier = event.recordBookingForTicketType(command.ticketTypeId());
            resolvedTierId = bookedTier.getId().value();
            resolvedTierName = bookedTier.getName();
            effectivePrice = bookedTier.effectivePrice(capacityBeforeBooking);
        } else {
            // Legacy/default booking path
            event.recordBooking();
            resolvedTierId = eventId.value() + "-standard";
            resolvedTierName = "Standard";
            effectivePrice = event.getPrice();
        }

        // Persist updated event capacity and tier sold counts
        eventRepository.save(event);

        // Generate unique ticket code and build ticket
        TicketId ticketId = TicketId.of(UUID.randomUUID().toString());
        TicketCode ticketCode = ticketCodeGenerator.generate();
        Instant purchaseDate = clock.instant();

        Ticket ticket = new Ticket(
                ticketId,
                eventId,
                resolvedTierId,
                resolvedTierName,
                command.participantName().trim(),
                command.participantEmail().trim(),
                ticketCode,
                effectivePrice,
                purchaseDate,
                TicketStatus.VALID,
                EmailDeliveryStatus.SENT
        );

        // External Email Integration with resilient error handling
        try {
            emailNotificationPort.sendTicketConfirmation(ticket, event);
            ticket.markEmailStatus(EmailDeliveryStatus.SENT);
        } catch (Exception ex) {
            log.warn("External email provider failed to send confirmation for ticket {}: {}. Marking for retry.",
                    ticketCode.value(), ex.getMessage());
            ticket.markEmailStatus(EmailDeliveryStatus.FAILED_PENDING_RETRY);
        }

        return ticketRepository.save(ticket);
    }
}
