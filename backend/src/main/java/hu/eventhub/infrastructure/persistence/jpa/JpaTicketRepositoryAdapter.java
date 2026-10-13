package hu.eventhub.infrastructure.persistence.jpa;

import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.Ticket;
import hu.eventhub.domain.model.TicketRepository;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
@Primary
public class JpaTicketRepositoryAdapter implements TicketRepository {

    private final TicketSpringDataRepository springDataRepository;

    public JpaTicketRepositoryAdapter(TicketSpringDataRepository springDataRepository) {
        this.springDataRepository = Objects.requireNonNull(springDataRepository, "springDataRepository cannot be null");
    }

    @Override
    public Ticket save(Ticket ticket) {
        TicketJpaEntity entity = TicketPersistenceMapper.toJpaEntity(ticket);
        TicketJpaEntity saved = springDataRepository.save(entity);
        return TicketPersistenceMapper.toDomain(saved);
    }

    @Override
    public List<Ticket> findAll() {
        return springDataRepository.findAll().stream()
                .map(TicketPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public List<Ticket> findByEventId(EventId eventId) {
        return springDataRepository.findByEventId(eventId.value()).stream()
                .map(TicketPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public void reset() {
        springDataRepository.deleteAll();
    }
}
