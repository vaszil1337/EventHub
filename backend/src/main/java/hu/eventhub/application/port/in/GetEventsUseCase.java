package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.Event;

import java.util.List;

@FunctionalInterface
public interface GetEventsUseCase {
    List<Event> getEvents();
}
