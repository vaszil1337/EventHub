package hu.eventhub.infrastructure.presentation.web;

public record RegisterRequest(
        String fullName,
        String email,
        String password,
        String role
) {}
