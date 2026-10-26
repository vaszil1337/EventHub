package hu.eventhub.application.service;

import hu.eventhub.application.port.in.BookTicketCommand;
import hu.eventhub.domain.exception.CapacityExceededException;
import hu.eventhub.domain.exception.EventNotFoundException;
import hu.eventhub.domain.model.*;
import hu.eventhub.infrastructure.notification.SmtpEmailNotificationAdapter;
import hu.eventhub.infrastructure.persistence.InMemoryEventRepository;
import hu.eventhub.infrastructure.persistence.InMemoryTicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

class BookTicketServiceTest {

    private InMemoryEventRepository eventRepository;
    private InMemoryTicketRepository ticketRepository;
    private SmtpEmailNotificationAdapter emailNotificationAdapter;
    private BookTicketService bookTicketService;
    private CancelTicketService cancelTicketService;
    private Clock fixedClock;

    @BeforeEach
    void setUp() {
        eventRepository = new InMemoryEventRepository();
        ticketRepository = new InMemoryTicketRepository();
        emailNotificationAdapter = new SmtpEmailNotificationAdapter();
        fixedClock = Clock.fixed(Instant.parse("2026-10-13T10:00:00Z"), ZoneOffset.UTC);
        TicketCodeGenerator codeGenerator = () -> TicketCode.of("EVT-2026-TEST");

        bookTicketService = new BookTicketService(
                eventRepository,
                ticketRepository,
                codeGenerator,
                fixedClock,
                emailNotificationAdapter
        );
        cancelTicketService = new CancelTicketService(eventRepository, ticketRepository);
    }

    @Test
    @DisplayName("Should successfully book a ticket for an available event")
    void shouldBookTicketSuccessfully() {
        BookTicketCommand command = new BookTicketCommand(
                "evt-tech-summit-2026",
                "Alice Engineer",
                "alice@example.com"
        );

        Ticket ticket = bookTicketService.bookTicket(command);

        assertNotNull(ticket);
        assertEquals("evt-tech-summit-2026", ticket.getEventId().value());
        assertEquals("Alice Engineer", ticket.getParticipantName());
        assertEquals("alice@example.com", ticket.getParticipantEmail());
        assertEquals("EVT-2026-TEST", ticket.getTicketCode().value());
        assertEquals(fixedClock.instant(), ticket.getPurchaseDate());
        assertEquals(TicketStatus.VALID, ticket.getStatus());
        assertEquals(EmailDeliveryStatus.SENT, ticket.getEmailStatus());

        // Verify event capacity incremented in repository
        Event event = eventRepository.findById(EventId.of("evt-tech-summit-2026")).orElseThrow();
        assertEquals(46, event.getSoldTicketsCount());
    }

    @Test
    @DisplayName("Should apply dynamic surge pricing when booking STANDARD tier on high-demand event (>=80% occupancy)")
    void shouldApplyDynamicSurgePricingForHighDemandEvent() {
        // evt-jazz-night-2026 has 28/30 sold (93.3% occupancy >= 80% threshold)
        // Standard tier base price is $35.00 -> +15% surge = $40.25
        BookTicketCommand command = new BookTicketCommand(
                "evt-jazz-night-2026",
                "Miles Davis",
                "miles@jazz.com",
                "evt-jazz-night-2026-standard"
        );

        Ticket ticket = bookTicketService.bookTicket(command);

        assertEquals(new BigDecimal("40.25"), ticket.getPrice().amount());
        assertEquals("Standard", ticket.getTicketTypeName());
    }

    @Test
    @DisplayName("Should cancel a booked ticket and release capacity on both Event and TicketType")
    void shouldCancelTicketAndReleaseCapacity() {
        BookTicketCommand command = new BookTicketCommand(
                "evt-tech-summit-2026",
                "Alice Engineer",
                "alice@example.com",
                "evt-tech-summit-2026-standard"
        );
        Ticket booked = bookTicketService.bookTicket(command);
        assertEquals(46, eventRepository.findById(EventId.of("evt-tech-summit-2026")).orElseThrow().getSoldTicketsCount());

        Ticket cancelled = cancelTicketService.cancelTicket(booked.getId());

        assertEquals(TicketStatus.CANCELLED, cancelled.getStatus());
        Event updatedEvent = eventRepository.findById(EventId.of("evt-tech-summit-2026")).orElseThrow();
        assertEquals(45, updatedEvent.getSoldTicketsCount());
    }

    @Test
    @DisplayName("Should gracefully handle external email provider outage without failing the ticket booking")
    void shouldHandleExternalEmailFailureGracefully() {
        emailNotificationAdapter.setSimulateProviderOutage(true);

        BookTicketCommand command = new BookTicketCommand(
                "evt-tech-summit-2026",
                "Resilient Buyer",
                "buyer@example.com"
        );

        Ticket ticket = bookTicketService.bookTicket(command);

        assertNotNull(ticket);
        assertEquals(TicketStatus.VALID, ticket.getStatus());
        assertEquals(EmailDeliveryStatus.FAILED_PENDING_RETRY, ticket.getEmailStatus());
        assertEquals(46, eventRepository.findById(EventId.of("evt-tech-summit-2026")).orElseThrow().getSoldTicketsCount());
    }

    @Test
    @DisplayName("Should throw CapacityExceededException when attempting to book sold-out event")
    void shouldThrowWhenBookingSoldOutEvent() {
        // evt-ai-masterclass-2026 has soldTicketsCount = 50 and capacity = 50
        BookTicketCommand command = new BookTicketCommand(
                "evt-ai-masterclass-2026",
                "Bob Developer",
                "bob@example.com"
        );

        CapacityExceededException ex = assertThrows(
                CapacityExceededException.class,
                () -> bookTicketService.bookTicket(command)
        );

        assertTrue(ex.getMessage().contains("fully booked"));
        assertTrue(ex.getMessage().contains("50/50"));

        // Verify tickets repository remains empty
        assertTrue(ticketRepository.findAll().isEmpty());
    }

    @Test
    @DisplayName("Should throw EventNotFoundException when event ID does not exist")
    void shouldThrowWhenEventNotFound() {
        BookTicketCommand command = new BookTicketCommand(
                "non-existent-id",
                "Charlie",
                "charlie@example.com"
        );

        assertThrows(
                EventNotFoundException.class,
                () -> bookTicketService.bookTicket(command)
        );
    }
}
