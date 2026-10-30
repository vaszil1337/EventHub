package hu.eventhub.infrastructure.persistence.jpa;

import hu.eventhub.domain.model.*;

import java.util.List;

public final class EventPersistenceMapper {

    private EventPersistenceMapper() {}

    public static EventJpaEntity toJpaEntity(Event domain) {
        EventSnapshot snapshot = domain.toSnapshot();
        return new EventJpaEntity(
                snapshot.id().value(),
                snapshot.title(),
                snapshot.titleHu(),
                snapshot.description(),
                snapshot.descriptionHu(),
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

    public static List<TicketTypeJpaEntity> toTicketTypeJpaEntities(Event domain) {
        EventSnapshot snapshot = domain.toSnapshot();
        String eventId = snapshot.id().value();
        return snapshot.ticketTypes().stream()
                .map(t -> new TicketTypeJpaEntity(
                        t.getId().value(),
                        eventId,
                        t.getName(),
                        t.getDescription(),
                        t.getBasePrice().amount(),
                        t.getBasePrice().currency(),
                        t.getQuota(),
                        t.getSoldCount(),
                        t.getPricingRule().name()
                ))
                .toList();
    }

    public static Event toDomain(EventJpaEntity entity) {
        return toDomain(entity, List.of());
    }

    public static Event toDomain(EventJpaEntity entity, List<TicketTypeJpaEntity> tierEntities) {
        List<TicketType> ticketTypes = tierEntities == null ? List.of() : tierEntities.stream()
                .map(t -> {
                    PricingRule rule;
                    try {
                        rule = PricingRule.valueOf(t.getPricingRule());
                    } catch (Exception e) {
                        rule = PricingRule.STANDARD;
                    }
                    return new TicketType(
                            TicketTypeId.of(t.getId()),
                            t.getName(),
                            t.getDescription(),
                            new Money(t.getPriceAmount(), t.getPriceCurrency()),
                            t.getQuota(),
                            t.getSoldCount(),
                            rule
                    );
                })
                .toList();

        EventSnapshot snapshot = new EventSnapshot(
                EventId.of(entity.getId()),
                entity.getTitle(),
                entity.getTitleHu() != null && !entity.getTitleHu().isBlank() ? entity.getTitleHu() : entity.getTitle(),
                entity.getDescription(),
                entity.getDescriptionHu() != null && !entity.getDescriptionHu().isBlank() ? entity.getDescriptionHu() : entity.getDescription(),
                entity.getDate(),
                Venue.of(entity.getVenueId(), entity.getVenueName(), entity.getVenueAddress(), entity.getVenueCapacity()),
                entity.getSoldTicketsCount(),
                new Money(entity.getPriceAmount(), entity.getPriceCurrency()),
                entity.getCategory(),
                entity.getImageUrl(),
                ticketTypes
        );
        return Event.restore(snapshot);
    }
}
