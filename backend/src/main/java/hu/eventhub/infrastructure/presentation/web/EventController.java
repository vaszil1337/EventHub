package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.application.port.in.GetEventByIdUseCase;
import hu.eventhub.application.port.in.GetEventsUseCase;
import hu.eventhub.application.port.in.ResetEventsUseCase;
import hu.eventhub.domain.exception.EventNotFoundException;
import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventId;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final GetEventsUseCase getEventsUseCase;
    private final GetEventByIdUseCase getEventByIdUseCase;
    private final ResetEventsUseCase resetEventsUseCase;

    public EventController(
            GetEventsUseCase getEventsUseCase,
            GetEventByIdUseCase getEventByIdUseCase,
            ResetEventsUseCase resetEventsUseCase
    ) {
        this.getEventsUseCase = Objects.requireNonNull(getEventsUseCase, "getEventsUseCase cannot be null");
        this.getEventByIdUseCase = Objects.requireNonNull(getEventByIdUseCase, "getEventByIdUseCase cannot be null");
        this.resetEventsUseCase = Objects.requireNonNull(resetEventsUseCase, "resetEventsUseCase cannot be null");
    }

    @GetMapping
    public List<EventResponse> getEvents() {
        return getEventsUseCase.getEvents().stream()
                .map(EventResponseMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public EventResponse getEventById(@PathVariable("id") String id) {
        Event event = getEventByIdUseCase.getEventById(EventId.of(id))
                .orElseThrow(() -> new EventNotFoundException("Event with ID \"" + id + "\" does not exist."));
        return EventResponseMapper.toResponse(event);
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetEvents() {
        resetEventsUseCase.reset();
        return ResponseEntity.ok(Map.of("message", "Events and tickets have been reset to sample seed data."));
    }
}
