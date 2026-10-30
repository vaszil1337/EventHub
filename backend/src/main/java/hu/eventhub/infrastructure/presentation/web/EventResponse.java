package hu.eventhub.infrastructure.presentation.web;

import java.util.List;

public record EventResponse(
        String id,
        String title,
        String titleHu,
        String description,
        String descriptionHu,
        String date,
        VenueResponse venue,
        int soldTicketsCount,
        PriceResponse price,
        String category,
        String imageUrl,
        List<TicketTypeResponse> ticketTypes
) {
    public EventResponse(
            String id,
            String title,
            String description,
            String date,
            VenueResponse venue,
            int soldTicketsCount,
            PriceResponse price,
            String category,
            String imageUrl,
            List<TicketTypeResponse> ticketTypes
    ) {
        this(id, title, title, description, description, date, venue, soldTicketsCount, price, category, imageUrl, ticketTypes);
    }
}
