package hu.eventhub.infrastructure.persistence.jpa;

import hu.eventhub.domain.model.*;

public final class EventPersistenceMapper {

    private EventPersistenceMapper() {}

    public static EventJpaEntity toJpaEntity(Event domain) {
        EventSnapshot snapshot = domain.toSnapshot();
        return new EventJpaEntity(
                snapshot.id().value(),
                snapshot.title(),
                snapshot.description(),
                snapshot.date(),
                snapshot.venue().id().value(),
                snapshot.venue().name(),
                snapshot.venue().address(),
                snapshot.venue().capacity(),
                snapshot.soldTicketsCount(),
                snapshot.price().amount(),
                snapshot.price().currency(),
                snapshot.category(),
                snapshot.imageUrl()
        );
    }

    public static Event toDomain(EventJpaEntity entity) {
        EventSnapshot snapshot = new EventSnapshot(
                EventId.of(entity.getId()),
                entity.getTitle(),
                entity.getDescription(),
                entity.getDate(),
                Venue.of(entity.getVenueId(), entity.getVenueName(), entity.getVenueAddress(), entity.getVenueCapacity()),
                entity.getSoldTicketsCount(),
                new Money(entity.getPriceAmount(), entity.getPriceCurrency()),
                entity.getCategory(),
                entity.getImageUrl()
        );
        return Event.restore(snapshot);
    }
}
