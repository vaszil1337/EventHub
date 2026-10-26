package hu.eventhub.infrastructure.persistence.jpa;

import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.EventRepository;
import hu.eventhub.infrastructure.persistence.SampleEventData;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Component
@Primary
public class JpaEventRepositoryAdapter implements EventRepository {

    private final EventSpringDataRepository springDataRepository;
    private final TicketTypeSpringDataRepository ticketTypeRepository;

    public JpaEventRepositoryAdapter(
            EventSpringDataRepository springDataRepository,
            TicketTypeSpringDataRepository ticketTypeRepository
    ) {
        this.springDataRepository = Objects.requireNonNull(springDataRepository, "springDataRepository cannot be null");
        this.ticketTypeRepository = Objects.requireNonNull(ticketTypeRepository, "ticketTypeRepository cannot be null");
    }

    @Override
    public List<Event> findAll() {
        return springDataRepository.findAll().stream()
                .map(entity -> {
                    List<TicketTypeJpaEntity> tiers = ticketTypeRepository.findByEventId(entity.getId());
                    return EventPersistenceMapper.toDomain(entity, tiers);
                })
                .toList();
    }

    @Override
    public Optional<Event> findById(EventId id) {
        return springDataRepository.findById(id.value())
                .map(entity -> {
                    List<TicketTypeJpaEntity> tiers = ticketTypeRepository.findByEventId(entity.getId());
                    return EventPersistenceMapper.toDomain(entity, tiers);
                });
    }

    @Override
    public Event save(Event event) {
        EventJpaEntity entity = EventPersistenceMapper.toJpaEntity(event);
        EventJpaEntity saved = springDataRepository.save(entity);
        List<TicketTypeJpaEntity> tiers = EventPersistenceMapper.toTicketTypeJpaEntities(event);
        List<TicketTypeJpaEntity> savedTiers = ticketTypeRepository.saveAll(tiers);
        return EventPersistenceMapper.toDomain(saved, savedTiers);
    }

    @Override
    public void resetToSampleData() {
        ticketTypeRepository.deleteAll();
        springDataRepository.deleteAll();
        List<Event> seedEvents = SampleEventData.initialEvents();
        for (Event seedEvent : seedEvents) {
            save(seedEvent);
        }
    }
}
