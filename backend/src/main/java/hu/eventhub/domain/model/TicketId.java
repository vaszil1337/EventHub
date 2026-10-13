package hu.eventhub.domain.model;

import java.util.Objects;

public record TicketId(String value) {
    public TicketId {
        Objects.requireNonNull(value, "TicketId value cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("TicketId value cannot be blank");
        }
    }

    public static TicketId of(String value) {
        return new TicketId(value);
    }
}
