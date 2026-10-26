package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.application.port.in.*;
import hu.eventhub.application.port.out.AuthenticatedPrincipal;
import hu.eventhub.application.port.out.TokenProviderPort;
import hu.eventhub.domain.exception.AccessDeniedException;
import hu.eventhub.domain.exception.EventNotFoundException;
import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.PricingRule;
import hu.eventhub.domain.model.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final GetEventsUseCase getEventsUseCase;
    private final GetEventByIdUseCase getEventByIdUseCase;
    private final ResetEventsUseCase resetEventsUseCase;
    private final CreateEventUseCase createEventUseCase;
    private final AddTicketTypeUseCase addTicketTypeUseCase;
    private final UpdateEventUseCase updateEventUseCase;
    private final TokenProviderPort tokenProvider;

    @Autowired
    public EventController(
            GetEventsUseCase getEventsUseCase,
            GetEventByIdUseCase getEventByIdUseCase,
            ResetEventsUseCase resetEventsUseCase,
            CreateEventUseCase createEventUseCase,
            AddTicketTypeUseCase addTicketTypeUseCase,
            UpdateEventUseCase updateEventUseCase,
            TokenProviderPort tokenProvider
    ) {
        this.getEventsUseCase = Objects.requireNonNull(getEventsUseCase, "getEventsUseCase cannot be null");
        this.getEventByIdUseCase = Objects.requireNonNull(getEventByIdUseCase, "getEventByIdUseCase cannot be null");
        this.resetEventsUseCase = Objects.requireNonNull(resetEventsUseCase, "resetEventsUseCase cannot be null");
        this.createEventUseCase = createEventUseCase;
        this.addTicketTypeUseCase = addTicketTypeUseCase;
        this.updateEventUseCase = updateEventUseCase;
        this.tokenProvider = tokenProvider;
    }

    public EventController(
            GetEventsUseCase getEventsUseCase,
            GetEventByIdUseCase getEventByIdUseCase,
            ResetEventsUseCase resetEventsUseCase,
            CreateEventUseCase createEventUseCase,
            AddTicketTypeUseCase addTicketTypeUseCase,
            TokenProviderPort tokenProvider
    ) {
        this(getEventsUseCase, getEventByIdUseCase, resetEventsUseCase, createEventUseCase, addTicketTypeUseCase, null, tokenProvider);
    }

    public EventController(
            GetEventsUseCase getEventsUseCase,
            GetEventByIdUseCase getEventByIdUseCase,
            ResetEventsUseCase resetEventsUseCase,
            CreateEventUseCase createEventUseCase,
            AddTicketTypeUseCase addTicketTypeUseCase
    ) {
        this(getEventsUseCase, getEventByIdUseCase, resetEventsUseCase, createEventUseCase, addTicketTypeUseCase, null);
    }

    public EventController(
            GetEventsUseCase getEventsUseCase,
            GetEventByIdUseCase getEventByIdUseCase,
            ResetEventsUseCase resetEventsUseCase
    ) {
        this(getEventsUseCase, getEventByIdUseCase, resetEventsUseCase, null, null, null);
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

    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody CreateEventRequest request
    ) {
        requireOrganizerRole(authorizationHeader, "Only authenticated ORGANIZER users are authorized to create events.");
        if (createEventUseCase == null) {
            throw new IllegalStateException("CreateEventUseCase is not configured");
        }
        Instant parsedDate = request.date() != null && !request.date().isBlank()
                ? Instant.parse(request.date())
                : Instant.now();
        CreateEventCommand command = new CreateEventCommand(
                request.title(),
                request.description(),
                parsedDate,
                request.venueName(),
                request.venueAddress(),
                request.venueCapacity(),
                request.basePriceAmount(),
                request.currency(),
                request.category(),
                request.imageUrl()
        );
        Event created = createEventUseCase.createEvent(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(EventResponseMapper.toResponse(created));
    }

    @PostMapping("/{id}/ticket-types")
    public ResponseEntity<EventResponse> addTicketType(
            @PathVariable("id") String id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody AddTicketTypeRequest request
    ) {
        requireOrganizerRole(authorizationHeader, "Only authenticated ORGANIZER users are authorized to add ticket types.");
        if (addTicketTypeUseCase == null) {
            throw new IllegalStateException("AddTicketTypeUseCase is not configured");
        }
        PricingRule rule = parsePricingRule(request.pricingRule());
        AddTicketTypeCommand command = new AddTicketTypeCommand(
                id,
                request.name(),
                request.description(),
                request.basePriceAmount(),
                request.currency(),
                request.quota(),
                rule
        );
        Event updated = addTicketTypeUseCase.addTicketType(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(EventResponseMapper.toResponse(updated));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @PathVariable("id") String id,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody UpdateEventRequest request
    ) {
        requireOrganizerRole(authorizationHeader, "Only authenticated ORGANIZER users are authorized to update events.");
        if (updateEventUseCase == null) {
            throw new IllegalStateException("UpdateEventUseCase is not configured");
        }
        Instant parsedDate = request.date() != null && !request.date().isBlank()
                ? Instant.parse(request.date())
                : null;
        UpdateEventCommand command = new UpdateEventCommand(
                id,
                request.title(),
                request.description(),
                parsedDate,
                request.venueName(),
                request.venueAddress(),
                request.venueCapacity(),
                request.basePriceAmount(),
                request.currency(),
                request.category(),
                request.imageUrl()
        );
        Event updated = updateEventUseCase.updateEvent(command);
        return ResponseEntity.ok(EventResponseMapper.toResponse(updated));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetEvents() {
        resetEventsUseCase.reset();
        return ResponseEntity.ok(Map.of("message", "Events and tickets have been reset to sample seed data."));
    }

    private PricingRule parsePricingRule(String raw) {
        if (raw == null || raw.isBlank()) {
            return PricingRule.STANDARD;
        }
        try {
            return PricingRule.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return PricingRule.STANDARD;
        }
    }

    private void requireOrganizerRole(String authorizationHeader, String message) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedPrincipal principal) {
            if (principal.role() == UserRole.ORGANIZER) {
                return;
            }
            throw new AccessDeniedException(message);
        }

        if (tokenProvider != null && authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7).trim();
            AuthenticatedPrincipal principal = tokenProvider.validateAndExtract(token)
                    .orElseThrow(() -> new AccessDeniedException(message));
            if (principal.role() == UserRole.ORGANIZER) {
                return;
            }
        }

        throw new AccessDeniedException(message);
    }
}
