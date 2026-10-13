package hu.eventhub.domain.model;

import java.util.List;
import java.util.Optional;

public interface EventRepository {
    List<Event> findAll();
    Optional<Event> findById(EventId id);
    Event save(Event event);
    void resetToSampleData();
}
