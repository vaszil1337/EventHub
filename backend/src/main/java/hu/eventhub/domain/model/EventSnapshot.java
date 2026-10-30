package hu.eventhub.domain.model;

import java.time.Instant;
import java.util.List;

public record EventSnapshot(
        EventId id,
        String title,
        String titleHu,
        String description,
        String descriptionHu,
        Instant date,
        Venue venue,
        int soldTicketsCount,
        Money price,
        String category,
        String imageUrl,
        List<TicketType> ticketTypes
) {
    public EventSnapshot(
            EventId id,
            String title,
            String description,
            Instant date,
            Venue venue,
            int soldTicketsCount,
            Money price,
            String category,
            String imageUrl,
            List<TicketType> ticketTypes
    ) {
        this(id, title, title, description, description, date, venue, soldTicketsCount, price, category, imageUrl, ticketTypes);
    }

    public EventSnapshot(
            EventId id,
            String title,
            String description,
            Instant date,
            Venue venue,
            int soldTicketsCount,
            Money price,
            String category,
            String imageUrl
    ) {
        this(id, title, title, description, description, date, venue, soldTicketsCount, price, category, imageUrl, List.of());
    }
}
