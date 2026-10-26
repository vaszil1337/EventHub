package hu.eventhub.domain.model;

import java.util.Objects;

public record UserId(String value) {
    public UserId {
        Objects.requireNonNull(value, "UserId cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("UserId cannot be blank");
        }
    }

    public static UserId of(String value) {
        return new UserId(value);
    }
}
