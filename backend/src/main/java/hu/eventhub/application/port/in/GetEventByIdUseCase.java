package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventId;

import java.util.Optional;

@FunctionalInterface
public interface GetEventByIdUseCase {
    Optional<Event> getEventById(EventId id);
}
