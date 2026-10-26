package hu.eventhub.application.service;

import hu.eventhub.application.port.in.CreateEventCommand;
import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CreateEventServiceTest {

    @Test
    @DisplayName("Should create event with default Early Bird, Standard, and VIP ticket types")
    void shouldCreateEventWithDefaultTicketTiers() {
        EventRepository eventRepository = mock(EventRepository.class);
        Map<String, Event> storage = new HashMap<>();

        when(eventRepository.save(any(Event.class))).thenAnswer(inv -> {
            Event e = inv.getArgument(0, Event.class);
            storage.put(e.getId().value(), e);
            return e;
        });

        CreateEventService service = new CreateEventService(eventRepository);
        CreateEventCommand command = new CreateEventCommand(
                "Cloud Native Summit",
                "Great tech conference",
                Instant.parse("2026-11-20T09:00:00Z"),
                "Millenáris Hall",
                "Budapest",
                200,
                new BigDecimal("80.00"),
                "USD",
                "Technology",
                null
        );

        Event created = service.createEvent(command);

        assertNotNull(created);
        assertEquals("Cloud Native Summit", created.getTitle());
        assertEquals(200, created.getVenue().capacity());
        assertEquals(3, created.getTicketTypes().size());
        assertEquals(0, created.getSoldTicketsCount());
    }
}
