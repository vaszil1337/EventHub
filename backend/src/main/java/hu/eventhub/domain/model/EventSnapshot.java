package hu.eventhub.domain.model;

import java.time.Instant;

public record EventSnapshot(
        EventId id,
        String title,
        String description,
        Instant date,
        Venue venue,
        int soldTicketsCount,
        Money price,
        String category,
        String imageUrl
) {}
