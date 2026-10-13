package hu.eventhub.infrastructure.presentation.web;

import java.math.BigDecimal;

public record PriceResponse(
        BigDecimal amount,
        String currency
) {}
