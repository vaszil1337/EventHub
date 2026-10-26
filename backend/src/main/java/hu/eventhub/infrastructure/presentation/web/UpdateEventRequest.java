package hu.eventhub.infrastructure.presentation.web;

import java.math.BigDecimal;

public record UpdateEventRequest(
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
) {}
