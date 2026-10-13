package hu.eventhub.infrastructure.presentation.web;

public record BookingRequest(
        String eventId,
        String participantName,
        String participantEmail
) {}
