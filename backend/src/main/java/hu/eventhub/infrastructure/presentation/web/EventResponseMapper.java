package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.domain.model.Capacity;
import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventSnapshot;
import hu.eventhub.domain.model.Money;

import java.util.List;

public final class EventResponseMapper {

    private EventResponseMapper() {}

    public static EventResponse toResponse(Event event) {
        EventSnapshot snapshot = event.toSnapshot();
        Capacity eventCapacity = event.getCapacity();

        List<TicketTypeResponse> ticketTypeResponses = snapshot.ticketTypes().stream()
                .map(tt -> {
                    Money effective = tt.effectivePrice(eventCapacity);
                    return new TicketTypeResponse(
                            tt.getId().value(),
                            tt.getName(),
                            tt.getDescription(),
                            new PriceResponse(tt.getBasePrice().amount(), tt.getBasePrice().currency()),
                            new PriceResponse(effective.amount(), effective.currency()),
                            tt.getQuota(),
                            tt.getSoldCount(),
                            tt.getPricingRule().name()
                    );
                })
                .toList();

        return new EventResponse(
                snapshot.id().value(),
                snapshot.title(),
                snapshot.titleHu(),
                snapshot.description(),
                snapshot.descriptionHu(),
                snapshot.date().toString(),
                new VenueResponse(
                        snapshot.venue().id().value(),
                        snapshot.venue().name(),
                        snapshot.venue().address(),
                        snapshot.venue().capacity()
                ),
                snapshot.soldTicketsCount(),
                new PriceResponse(snapshot.price().amount(), snapshot.price().currency()),
                snapshot.category(),
                snapshot.imageUrl(),
                ticketTypeResponses
        );
    }
}
