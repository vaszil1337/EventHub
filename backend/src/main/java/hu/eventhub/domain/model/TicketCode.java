package hu.eventhub.domain.model;

import java.util.Objects;
import java.util.regex.Pattern;

public record TicketCode(String value) {
    private static final Pattern CODE_PATTERN = Pattern.compile("^EVT-\\d{4}-[A-Z0-9]{4}$");

    public TicketCode {
        Objects.requireNonNull(value, "TicketCode cannot be null");
        if (!CODE_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("Invalid ticket code format: " + value + ". Expected format is EVT-YYYY-XXXX");
        }
    }

    public static TicketCode of(String value) {
        return new TicketCode(value);
    }
}
