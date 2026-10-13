package hu.eventhub.domain.model;

import java.util.List;

public interface TicketRepository {
    Ticket save(Ticket ticket);
    List<Ticket> findAll();
    List<Ticket> findByEventId(EventId eventId);
    void reset();
}
