package hu.eventhub.domain.model;

import java.util.Objects;

public record EventId(String value) {
    public EventId {
        Objects.requireNonNull(value, "EventId value cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("EventId value cannot be blank");
        }
    }

    public static EventId of(String value) {
        return new EventId(value);
    }
}
