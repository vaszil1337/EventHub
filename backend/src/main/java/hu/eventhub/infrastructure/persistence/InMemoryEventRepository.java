package hu.eventhub.infrastructure.persistence;

import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.EventRepository;
import hu.eventhub.domain.model.EventSnapshot;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryEventRepository implements EventRepository {

    private final Map<String, EventSnapshot> storage = new ConcurrentHashMap<>();

    public InMemoryEventRepository() {
        resetToSampleData();
    }

    @Override
    public List<Event> findAll() {
        return storage.values().stream()
                .map(Event::restore)
                .toList();
    }

    @Override
    public Optional<Event> findById(EventId id) {
        EventSnapshot snapshot = storage.get(id.value());
        return Optional.ofNullable(snapshot).map(Event::restore);
    }

    @Override
    public Event save(Event event) {
        storage.put(event.getId().value(), event.toSnapshot());
        return event;
    }

    @Override
    public void resetToSampleData() {
        storage.clear();
        for (Event event : SampleEventData.initialEvents()) {
            storage.put(event.getId().value(), event.toSnapshot());
        }
    }
}
