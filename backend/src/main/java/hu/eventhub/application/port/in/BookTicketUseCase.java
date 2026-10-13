package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.Ticket;

@FunctionalInterface
public interface BookTicketUseCase {
    Ticket bookTicket(BookTicketCommand command);
}
