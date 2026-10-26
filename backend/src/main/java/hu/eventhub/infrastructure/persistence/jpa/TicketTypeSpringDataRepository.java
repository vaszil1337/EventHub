package hu.eventhub.infrastructure.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketTypeSpringDataRepository extends JpaRepository<TicketTypeJpaEntity, String> {
    List<TicketTypeJpaEntity> findByEventId(String eventId);
    void deleteByEventId(String eventId);
}
