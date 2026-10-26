package hu.eventhub.infrastructure.presentation.web;

public record LoginRequest(
        String email,
        String password
) {}
