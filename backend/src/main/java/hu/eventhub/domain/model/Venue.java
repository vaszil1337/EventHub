package hu.eventhub.domain.model;

import java.util.Objects;

public record Venue(VenueId id, String name, String address, int capacity) {
    public Venue {
        Objects.requireNonNull(id, "Venue id cannot be null");
        Objects.requireNonNull(name, "Venue name cannot be null");
        Objects.requireNonNull(address, "Venue address cannot be null");
        if (capacity < 0) {
            throw new IllegalArgumentException("Capacity cannot be negative");
        }
    }

    public static Venue of(String id, String name, String address, int capacity) {
        return new Venue(VenueId.of(id), name, address, capacity);
    }
}
