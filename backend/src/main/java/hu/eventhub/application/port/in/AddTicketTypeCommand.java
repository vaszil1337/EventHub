package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.PricingRule;

import java.math.BigDecimal;
import java.util.Objects;

public record AddTicketTypeCommand(
        String eventId,
        String name,
        String description,
        BigDecimal basePriceAmount,
        String priceCurrency,
        int quota,
        PricingRule pricingRule
) {
    public AddTicketTypeCommand {
        Objects.requireNonNull(eventId, "Event ID cannot be null");
        if (eventId.isBlank()) {
            throw new IllegalArgumentException("Event ID is required");
        }
        Objects.requireNonNull(name, "Ticket type name cannot be null");
        if (name.trim().isBlank()) {
            throw new IllegalArgumentException("Ticket type name is required");
        }
        Objects.requireNonNull(basePriceAmount, "Base price cannot be null");
        if (basePriceAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Base price cannot be negative");
        }
        if (quota <= 0) {
            throw new IllegalArgumentException("Ticket type quota must be greater than zero");
        }
    }
}
