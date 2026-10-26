package hu.eventhub.infrastructure.persistence;

import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.Ticket;
import hu.eventhub.domain.model.TicketId;
import hu.eventhub.domain.model.TicketRepository;
import hu.eventhub.domain.model.TicketSnapshot;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

public class InMemoryTicketRepository implements TicketRepository {

    private final List<TicketSnapshot> storage = new CopyOnWriteArrayList<>();

    @Override
    public Ticket save(Ticket ticket) {
        storage.removeIf(t -> t.id().equals(ticket.getId()));
        storage.add(ticket.toSnapshot());
        return ticket;
    }

    @Override
    public Optional<Ticket> findById(TicketId id) {
        return storage.stream()
                .filter(t -> t.id().equals(id))
                .findFirst()
                .map(Ticket::restore);
    }

    @Override
    public List<Ticket> findAll() {
        return storage.stream()
                .map(Ticket::restore)
                .toList();
    }

    @Override
    public List<Ticket> findByEventId(EventId eventId) {
        return storage.stream()
                .filter(t -> t.eventId().equals(eventId))
                .map(Ticket::restore)
                .toList();
    }

    @Override
    public List<Ticket> findByParticipantEmail(String email) {
        if (email == null) {
            return List.of();
        }
        String normalized = email.trim().toLowerCase();
        return storage.stream()
                .filter(t -> t.participantEmail().trim().toLowerCase().equals(normalized))
                .map(Ticket::restore)
                .toList();
    }

    @Override
    public void reset() {
        storage.clear();
    }
}
