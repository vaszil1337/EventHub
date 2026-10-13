package hu.eventhub.infrastructure.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventSpringDataRepository extends JpaRepository<EventJpaEntity, String> {
}
