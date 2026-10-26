package hu.eventhub.application.service;

import hu.eventhub.application.port.in.UpdateEventCommand;
import hu.eventhub.domain.exception.EventNotFoundException;
import hu.eventhub.domain.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UpdateEventServiceTest {

    @Test
    @DisplayName("Should successfully update existing event details")
    void shouldUpdateEventSuccessfully() {
        EventRepository eventRepository = mock(EventRepository.class);
        Event existing = new Event(
                EventId.of("evt-test-1"),
                "Old Title",
                "Old Description",
                Instant.parse("2026-11-20T09:00:00Z"),
                Venue.of("ven-1", "Old Venue", "Old Address", 100),
                5,
                new Money(new BigDecimal("50.00"), "USD"),
                "Music",
                "https://example.com/old.jpg"
        );

        when(eventRepository.findById(EventId.of("evt-test-1"))).thenReturn(Optional.of(existing));
        when(eventRepository.save(any(Event.class))).thenAnswer(inv -> inv.getArgument(0, Event.class));

        UpdateEventService service = new UpdateEventService(eventRepository);
        UpdateEventCommand command = new UpdateEventCommand(
                "evt-test-1",
                "Updated Title",
                "Updated Description",
                Instant.parse("2026-12-01T10:00:00Z"),
                "New Venue",
                "New Address",
                150,
                new BigDecimal("75.00"),
                "USD",
                "Technology",
                "https://example.com/new.jpg"
        );

        Event updated = service.updateEvent(command);

        assertNotNull(updated);
        assertEquals("Updated Title", updated.getTitle());
        assertEquals("Updated Description", updated.getDescription());
        assertEquals("New Venue", updated.getVenue().name());
        assertEquals(150, updated.getVenue().capacity());
        assertEquals(5, updated.getSoldTicketsCount());
        assertEquals(new BigDecimal("75.00"), updated.getPrice().amount());
        assertEquals("Technology", updated.getCategory());
    }

    @Test
    @DisplayName("Should reject updating when capacity is less than sold tickets")
    void shouldRejectCapacityLessThanSoldTickets() {
        EventRepository eventRepository = mock(EventRepository.class);
        Event existing = new Event(
                EventId.of("evt-test-2"),
                "Popular Event",
                "Desc",
                Instant.parse("2026-11-20T09:00:00Z"),
                Venue.of("ven-2", "Arena", "Budapest", 100),
                50, // 50 sold
                new Money(new BigDecimal("50.00"), "USD"),
                "Music",
                null
        );

        when(eventRepository.findById(EventId.of("evt-test-2"))).thenReturn(Optional.of(existing));

        UpdateEventService service = new UpdateEventService(eventRepository);
        UpdateEventCommand command = new UpdateEventCommand(
                "evt-test-2",
                "Popular Event",
                "Desc",
                Instant.parse("2026-11-20T09:00:00Z"),
                "Arena",
                "Budapest",
                40, // Capacity 40 < 50 sold!
                new BigDecimal("50.00"),
                "USD",
                "Music",
                null
        );

        assertThrows(IllegalArgumentException.class, () -> service.updateEvent(command));
    }

    @Test
    @DisplayName("Should throw EventNotFoundException when event does not exist")
    void shouldThrowWhenEventNotFound() {
        EventRepository eventRepository = mock(EventRepository.class);
        when(eventRepository.findById(EventId.of("evt-non-existent"))).thenReturn(Optional.empty());

        UpdateEventService service = new UpdateEventService(eventRepository);
        UpdateEventCommand command = new UpdateEventCommand(
                "evt-non-existent",
                "Title",
                "Desc",
                Instant.parse("2026-11-20T09:00:00Z"),
                "Venue",
                "Address",
                100,
                new BigDecimal("50.00"),
                "USD",
                "Tech",
                null
        );

        assertThrows(EventNotFoundException.class, () -> service.updateEvent(command));
    }
}
