package hu.eventhub.infrastructure.persistence.jpa;

import hu.eventhub.domain.model.*;

public final class TicketPersistenceMapper {

    private TicketPersistenceMapper() {}

    public static TicketJpaEntity toJpaEntity(Ticket domain) {
        TicketSnapshot snapshot = domain.toSnapshot();
        return new TicketJpaEntity(
                snapshot.id().value(),
                snapshot.eventId().value(),
                snapshot.participantName(),
                snapshot.participantEmail(),
                snapshot.ticketCode().value(),
                snapshot.price().amount(),
                snapshot.price().currency(),
                snapshot.purchaseDate()
        );
    }

    public static Ticket toDomain(TicketJpaEntity entity) {
        TicketSnapshot snapshot = new TicketSnapshot(
                TicketId.of(entity.getId()),
                EventId.of(entity.getEventId()),
                entity.getParticipantName(),
                entity.getParticipantEmail(),
                TicketCode.of(entity.getTicketCode()),
                new Money(entity.getPriceAmount(), entity.getPriceCurrency()),
                entity.getPurchaseDate()
        );
        return Ticket.restore(snapshot);
    }
}
