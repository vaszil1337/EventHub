package hu.eventhub.domain.model;

import java.util.Objects;

public record TicketTypeId(String value) {
    public TicketTypeId {
        Objects.requireNonNull(value, "TicketTypeId cannot be null");
        if (value.isBlank()) {
            throw new IllegalArgumentException("TicketTypeId cannot be blank");
        }
    }

    public static TicketTypeId of(String value) {
        return new TicketTypeId(value);
    }
}
