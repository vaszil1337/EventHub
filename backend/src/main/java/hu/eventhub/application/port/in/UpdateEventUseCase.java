package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.Event;

public interface UpdateEventUseCase {
    Event updateEvent(UpdateEventCommand command);
}
