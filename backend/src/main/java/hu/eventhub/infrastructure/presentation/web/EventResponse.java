package hu.eventhub.infrastructure.presentation.web;

import java.util.List;

public record EventResponse(
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
) {}
