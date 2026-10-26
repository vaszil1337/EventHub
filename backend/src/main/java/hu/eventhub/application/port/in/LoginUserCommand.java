package hu.eventhub.application.port.in;

import java.util.Objects;

public record LoginUserCommand(
        String email,
        String password
) {
    public LoginUserCommand {
        Objects.requireNonNull(email, "Email is required");
        if (email.trim().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        Objects.requireNonNull(password, "Password is required");
        if (password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
    }
}
