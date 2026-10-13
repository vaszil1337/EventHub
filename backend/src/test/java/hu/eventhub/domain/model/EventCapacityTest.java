package hu.eventhub.domain.model;

import hu.eventhub.domain.exception.CapacityExceededException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class EventCapacityTest {

    @Test
    @DisplayName("Should report available seats correctly")
    void shouldReportAvailableSeatsCorrectly() {
        Venue venue = Venue.of("v-1", "Arena", "Main St 1", 100);
        Event event = new Event(
                EventId.of("e-1"),
                "Concert",
                "Great music",
                Instant.now(),
                venue,
                45,
                Money.of(50, "USD"),
                "Music",
                null
        );

        assertTrue(event.hasAvailableSeats());
        assertEquals(55, event.availableSeats());
    }

    @Test
    @DisplayName("Should successfully record booking and increment sold count")
    void shouldRecordBookingSuccessfully() {
        Venue venue = Venue.of("v-1", "Arena", "Main St 1", 10);
        Event event = new Event(
                EventId.of("e-1"),
                "Workshop",
                "Hands on",
                Instant.now(),
                venue,
                9,
                Money.of(100, "USD"),
                "Tech",
                null
        );

        event.recordBooking();

        assertEquals(10, event.getSoldTicketsCount());
        assertFalse(event.hasAvailableSeats());
        assertEquals(0, event.availableSeats());
    }

    @Test
    @DisplayName("Should throw CapacityExceededException when event is fully booked")
    void shouldThrowExceptionWhenCapacityExceeded() {
        Venue venue = Venue.of("v-1", "Studio", "Main St 1", 50);
        Event event = new Event(
                EventId.of("e-1"),
                "Masterclass",
                "Full class",
                Instant.now(),
                venue,
                50,
                Money.of(200, "USD"),
                "Tech",
                null
        );

        assertFalse(event.hasAvailableSeats());
        CapacityExceededException ex = assertThrows(
                CapacityExceededException.class,
                event::recordBooking
        );

        assertTrue(ex.getMessage().contains("fully booked"));
        assertTrue(ex.getMessage().contains("50/50"));
        assertEquals(50, event.getSoldTicketsCount());
    }
}
