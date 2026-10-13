package hu.eventhub.domain.model;

import java.util.Objects;

public record VenueId(String value) {
    public VenueId {
        Objects.requireNonNull(value, "VenueId value cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("VenueId value cannot be blank");
        }
    }

    public static VenueId of(String value) {
        return new VenueId(value);
    }
}
