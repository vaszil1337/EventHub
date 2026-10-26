package hu.eventhub.application.port.out;

import hu.eventhub.domain.model.UserRole;

public record AuthenticatedPrincipal(
        String userId,
        String email,
        String fullName,
        UserRole role
) {}
