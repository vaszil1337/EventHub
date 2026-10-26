package hu.eventhub.domain.model;

import java.util.List;
import java.util.Optional;

public interface TicketRepository {
    Ticket save(Ticket ticket);
    Optional<Ticket> findById(TicketId id);
    List<Ticket> findAll();
    List<Ticket> findByEventId(EventId eventId);
    List<Ticket> findByParticipantEmail(String email);
    void reset();
}
