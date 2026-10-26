package hu.eventhub.infrastructure.presentation.web;

import java.math.BigDecimal;

public record AddTicketTypeRequest(
        String name,
        String description,
        BigDecimal basePriceAmount,
        String currency,
        int quota,
        String pricingRule
) {}
