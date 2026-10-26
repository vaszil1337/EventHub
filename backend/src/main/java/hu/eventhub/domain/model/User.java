package hu.eventhub.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Domain Entity representing a registered EventHub user (Participant or Organizer).
 */
public class User {
    private final UserId id;
    private final String fullName;
    private final String email;
    private final String passwordHash;
    private final UserRole role;
    private final Instant createdAt;

    public User(
            UserId id,
            String fullName,
            String email,
            String passwordHash,
            UserRole role,
            Instant createdAt
    ) {
        this.id = Objects.requireNonNull(id, "User id cannot be null");
        this.fullName = Objects.requireNonNull(fullName, "User fullName cannot be null").trim();
        if (this.fullName.isBlank()) {
            throw new IllegalArgumentException("User full name cannot be blank");
        }
        this.email = Objects.requireNonNull(email, "User email cannot be null").trim().toLowerCase();
        if (this.email.isBlank() || !this.email.contains("@")) {
            throw new IllegalArgumentException("Valid user email is required");
        }
        this.passwordHash = Objects.requireNonNull(passwordHash, "User passwordHash cannot be null");
        this.role = role != null ? role : UserRole.PARTICIPANT;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public UserId getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public UserRole getRole() {
        return role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
