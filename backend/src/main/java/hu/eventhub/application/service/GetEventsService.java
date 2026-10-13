package hu.eventhub.application.service;

import hu.eventhub.application.port.in.GetEventByIdUseCase;
import hu.eventhub.application.port.in.GetEventsUseCase;
import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.EventRepository;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

public class GetEventsService implements GetEventsUseCase, GetEventByIdUseCase {
    private final EventRepository eventRepository;

    public GetEventsService(EventRepository eventRepository) {
        this.eventRepository = Objects.requireNonNull(eventRepository, "eventRepository cannot be null");
    }

    @Override
    public List<Event> getEvents() {
        return eventRepository.findAll();
    }

    @Override
    public Optional<Event> getEventById(EventId id) {
        return eventRepository.findById(id);
    }
}
