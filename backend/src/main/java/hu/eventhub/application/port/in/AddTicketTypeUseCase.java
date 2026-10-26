package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.Event;

public interface AddTicketTypeUseCase {
    Event addTicketType(AddTicketTypeCommand command);
}
