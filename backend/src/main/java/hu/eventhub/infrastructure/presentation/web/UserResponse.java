package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.domain.model.User;

public record UserResponse(
        String id,
        String fullName,
        String email,
        String role
) {
    public static UserResponse fromDomain(User user) {
        return new UserResponse(
                user.getId().value(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
