package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.Ticket;
import hu.eventhub.domain.model.TicketId;

public interface CancelTicketUseCase {
    Ticket cancelTicket(TicketId ticketId);
}
