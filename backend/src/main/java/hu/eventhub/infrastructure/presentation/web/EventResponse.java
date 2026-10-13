package hu.eventhub.infrastructure.presentation.web;

public record EventResponse(
        String id,
        String title,
        String description,
        String date,
        VenueResponse venue,
        int soldTicketsCount,
        PriceResponse price,
        String category,
        String imageUrl
) {}
