package hu.eventhub.infrastructure.persistence.jpa;

import hu.eventhub.domain.model.*;

public final class TicketPersistenceMapper {

    private TicketPersistenceMapper() {}

    public static TicketJpaEntity toJpaEntity(Ticket domain) {
        TicketSnapshot snapshot = domain.toSnapshot();
        return new TicketJpaEntity(
                snapshot.id().value(),
                snapshot.eventId().value(),
                snapshot.ticketTypeId(),
                snapshot.ticketTypeName(),
                snapshot.participantName(),
                snapshot.participantEmail(),
                snapshot.ticketCode().value(),
                snapshot.price().amount(),
                snapshot.price().currency(),
                snapshot.purchaseDate(),
                snapshot.status().name(),
                snapshot.emailStatus().name()
        );
    }

    public static Ticket toDomain(TicketJpaEntity entity) {
        TicketStatus status = TicketStatus.VALID;
        if (entity.getStatus() != null) {
            try {
                status = TicketStatus.valueOf(entity.getStatus());
            } catch (IllegalArgumentException ignored) {}
        }

        EmailDeliveryStatus emailStatus = EmailDeliveryStatus.SENT;
        if (entity.getEmailStatus() != null) {
            try {
                emailStatus = EmailDeliveryStatus.valueOf(entity.getEmailStatus());
            } catch (IllegalArgumentException ignored) {}
        }

        TicketSnapshot snapshot = new TicketSnapshot(
                TicketId.of(entity.getId()),
                EventId.of(entity.getEventId()),
                entity.getTicketTypeId() != null ? entity.getTicketTypeId() : entity.getEventId() + "-standard",
                entity.getTicketTypeName() != null ? entity.getTicketTypeName() : "Standard",
                entity.getParticipantName(),
                entity.getParticipantEmail(),
                TicketCode.of(entity.getTicketCode()),
                new Money(entity.getPriceAmount(), entity.getPriceCurrency()),
                entity.getPurchaseDate(),
                status,
                emailStatus
        );
        return Ticket.restore(snapshot);
    }
}
