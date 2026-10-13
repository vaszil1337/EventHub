package hu.eventhub.application.service;

import hu.eventhub.application.port.in.BookTicketCommand;
import hu.eventhub.domain.exception.CapacityExceededException;
import hu.eventhub.domain.exception.EventNotFoundException;
import hu.eventhub.domain.model.*;
import hu.eventhub.infrastructure.persistence.InMemoryEventRepository;
import hu.eventhub.infrastructure.persistence.InMemoryTicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

class BookTicketServiceTest {

    private InMemoryEventRepository eventRepository;
    private InMemoryTicketRepository ticketRepository;
    private BookTicketService bookTicketService;
    private Clock fixedClock;

    @BeforeEach
    void setUp() {
        eventRepository = new InMemoryEventRepository();
        ticketRepository = new InMemoryTicketRepository();
        fixedClock = Clock.fixed(Instant.parse("2026-10-13T10:00:00Z"), ZoneOffset.UTC);
        TicketCodeGenerator codeGenerator = () -> TicketCode.of("EVT-2026-TEST");

        bookTicketService = new BookTicketService(
                eventRepository,
                ticketRepository,
                codeGenerator,
                fixedClock
        );
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

        // Verify event capacity incremented in repository
        Event event = eventRepository.findById(EventId.of("evt-tech-summit-2026")).orElseThrow();
        assertEquals(46, event.getSoldTicketsCount());
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
