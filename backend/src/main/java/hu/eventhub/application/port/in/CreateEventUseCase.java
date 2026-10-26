package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.Event;

public interface CreateEventUseCase {
    Event createEvent(CreateEventCommand command);
}
