package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventSnapshot;

public final class EventResponseMapper {

    private EventResponseMapper() {}

    public static EventResponse toResponse(Event event) {
        EventSnapshot snapshot = event.toSnapshot();
        return new EventResponse(
                snapshot.id().value(),
                snapshot.title(),
                snapshot.description(),
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
                snapshot.imageUrl()
        );
    }
}
