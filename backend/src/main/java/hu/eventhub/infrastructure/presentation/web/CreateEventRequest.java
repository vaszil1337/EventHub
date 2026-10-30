package hu.eventhub.infrastructure.presentation.web;

import java.math.BigDecimal;

public record CreateEventRequest(
        String title,
        String titleHu,
        String description,
        String descriptionHu,
        String date,
        String venueName,
        String venueAddress,
        int venueCapacity,
        BigDecimal basePriceAmount,
        String currency,
        String category,
        String imageUrl
) {
    public CreateEventRequest(
            String title,
            String description,
            String date,
            String venueName,
            String venueAddress,
            int venueCapacity,
            BigDecimal basePriceAmount,
            String currency,
            String category,
            String imageUrl
    ) {
        this(title, title, description, description, date, venueName, venueAddress, venueCapacity, basePriceAmount, currency, category, imageUrl);
    }
}
