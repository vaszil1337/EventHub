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

    public JpaEventRepositoryAdapter(EventSpringDataRepository springDataRepository) {
        this.springDataRepository = Objects.requireNonNull(springDataRepository, "springDataRepository cannot be null");
    }

    @Override
    public List<Event> findAll() {
        return springDataRepository.findAll().stream()
                .map(EventPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Event> findById(EventId id) {
        return springDataRepository.findById(id.value())
                .map(EventPersistenceMapper::toDomain);
    }

    @Override
    public Event save(Event event) {
        EventJpaEntity entity = EventPersistenceMapper.toJpaEntity(event);
        EventJpaEntity saved = springDataRepository.save(entity);
        return EventPersistenceMapper.toDomain(saved);
    }

    @Override
    public void resetToSampleData() {
        springDataRepository.deleteAll();
        List<Event> seedEvents = SampleEventData.initialEvents();
        List<EventJpaEntity> entities = seedEvents.stream()
                .map(EventPersistenceMapper::toJpaEntity)
                .toList();
        springDataRepository.saveAll(entities);
    }
}
