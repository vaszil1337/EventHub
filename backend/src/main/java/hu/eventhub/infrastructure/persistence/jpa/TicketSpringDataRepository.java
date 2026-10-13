package hu.eventhub.infrastructure.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketSpringDataRepository extends JpaRepository<TicketJpaEntity, String> {
    List<TicketJpaEntity> findByEventId(String eventId);
}
