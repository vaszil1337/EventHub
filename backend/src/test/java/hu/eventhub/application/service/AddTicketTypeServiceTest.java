package hu.eventhub.application.service;

import hu.eventhub.application.port.in.AddTicketTypeCommand;
import hu.eventhub.domain.exception.EventNotFoundException;
import hu.eventhub.domain.model.*;
import hu.eventhub.infrastructure.persistence.SampleEventData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AddTicketTypeServiceTest {

    @Test
    @DisplayName("Should add ticket tier to existing event and save to repository")
    void shouldAddTicketTierToEvent() {
        EventRepository eventRepository = mock(EventRepository.class);
        Map<String, Event> storage = new HashMap<>();
        for (Event seed : SampleEventData.initialEvents()) {
            storage.put(seed.getId().value(), seed);
        }

        when(eventRepository.findById(any(EventId.class))).thenAnswer(inv -> {
            EventId id = inv.getArgument(0, EventId.class);
            return Optional.ofNullable(storage.get(id.value()));
        });
        when(eventRepository.save(any(Event.class))).thenAnswer(inv -> {
            Event e = inv.getArgument(0, Event.class);
            storage.put(e.getId().value(), e);
            return e;
        });

        AddTicketTypeService service = new AddTicketTypeService(eventRepository);
        AddTicketTypeCommand command = new AddTicketTypeCommand(
                "evt-tech-summit-2026",
                "Student Pass",
                "Special university discount",
                new BigDecimal("40.00"),
                "USD",
                25,
                PricingRule.EARLY_BIRD
        );

        Event updated = service.addTicketType(command);

        assertEquals(4, updated.getTicketTypes().size());
        assertTrue(updated.getTicketTypes().stream().anyMatch(tt -> tt.getName().equals("Student Pass")));
    }

    @Test
    @DisplayName("Should throw EventNotFoundException when adding tier to non-existent event")
    void shouldThrowWhenEventNotFound() {
        EventRepository eventRepository = mock(EventRepository.class);
        when(eventRepository.findById(any(EventId.class))).thenReturn(Optional.empty());

        AddTicketTypeService service = new AddTicketTypeService(eventRepository);
        AddTicketTypeCommand command = new AddTicketTypeCommand(
                "unknown-id",
                "Student Pass",
                "Desc",
                new BigDecimal("40.00"),
                "USD",
                25,
                PricingRule.STANDARD
        );

        assertThrows(EventNotFoundException.class, () -> service.addTicketType(command));
    }
}
