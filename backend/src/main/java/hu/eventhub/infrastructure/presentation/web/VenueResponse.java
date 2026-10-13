package hu.eventhub.infrastructure.presentation.web;

public record VenueResponse(
        String id,
        String name,
        String address,
        int capacity
) {}
