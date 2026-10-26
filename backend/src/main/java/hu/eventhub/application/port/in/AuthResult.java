package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.User;

public record AuthResult(
        User user,
        String token
) {}
