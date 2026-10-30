package hu.eventhub.application.port.in;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

public record UpdateEventCommand(
        String id,
        String title,
        String titleHu,
        String description,
        String descriptionHu,
        Instant date,
        String venueName,
        String venueAddress,
        int venueCapacity,
        BigDecimal priceAmount,
        String priceCurrency,
        String category,
        String imageUrl
) {
    public UpdateEventCommand(
            String id,
            String title,
            String description,
            Instant date,
            String venueName,
            String venueAddress,
            int venueCapacity,
            BigDecimal priceAmount,
            String priceCurrency,
            String category,
            String imageUrl
    ) {
        this(id, title, title, description, description, date, venueName, venueAddress, venueCapacity, priceAmount, priceCurrency, category, imageUrl);
    }

    public UpdateEventCommand {
        Objects.requireNonNull(id, "Event id cannot be null");
        if (id.trim().isBlank()) {
            throw new IllegalArgumentException("Event id is required");
        }
        Objects.requireNonNull(title, "Event title cannot be null");
        if (title.trim().isBlank()) {
            throw new IllegalArgumentException("Event title is required");
        }
        Objects.requireNonNull(titleHu, "Hungarian event title cannot be null");
        if (titleHu.trim().isBlank()) {
            throw new IllegalArgumentException("Hungarian event title is required");
        }
        Objects.requireNonNull(description, "Event description cannot be null");
        if (description.trim().isBlank()) {
            throw new IllegalArgumentException("Event description is required");
        }
        Objects.requireNonNull(descriptionHu, "Hungarian event description cannot be null");
        if (descriptionHu.trim().isBlank()) {
            throw new IllegalArgumentException("Hungarian event description is required");
        }
        Objects.requireNonNull(venueName, "Venue name cannot be null");
        if (venueName.trim().isBlank()) {
            throw new IllegalArgumentException("Venue name is required");
        }
        Objects.requireNonNull(venueAddress, "Venue address cannot be null");
        if (venueAddress.trim().isBlank()) {
            throw new IllegalArgumentException("Venue address is required");
        }
        if (venueCapacity <= 0) {
            throw new IllegalArgumentException("Venue capacity must be greater than zero");
        }
        Objects.requireNonNull(priceAmount, "Price amount cannot be null");
        if (priceAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price amount cannot be negative");
        }
    }
}
