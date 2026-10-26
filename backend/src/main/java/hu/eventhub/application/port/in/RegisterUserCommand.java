package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.UserRole;

import java.util.Objects;

public record RegisterUserCommand(
        String fullName,
        String email,
        String password,
        UserRole role
) {
    public RegisterUserCommand {
        Objects.requireNonNull(fullName, "Full name is required");
        if (fullName.trim().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        Objects.requireNonNull(email, "Email is required");
        if (email.trim().isBlank() || !email.contains("@")) {
            throw new IllegalArgumentException("A valid email address is required");
        }
        Objects.requireNonNull(password, "Password is required");
        if (password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }
        role = role != null ? role : UserRole.PARTICIPANT;
    }
}
