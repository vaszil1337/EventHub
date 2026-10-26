package hu.eventhub.infrastructure.presentation.web;

public record TicketTypeResponse(
        String id,
        String name,
        String description,
        PriceResponse basePrice,
        PriceResponse effectivePrice,
        int quota,
        int soldCount,
        String pricingRule
) {}
