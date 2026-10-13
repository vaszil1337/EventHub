package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.Ticket;

import java.util.List;

public interface GetTicketsUseCase {
    List<Ticket> getAllTickets();
    List<Ticket> getTicketsByEventId(EventId eventId);
}
