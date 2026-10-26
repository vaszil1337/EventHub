package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.application.port.in.AuthResult;

public record AuthResponse(
        String token,
        UserResponse user
) {
    public static AuthResponse fromResult(AuthResult result) {
        return new AuthResponse(
                result.token(),
                UserResponse.fromDomain(result.user())
        );
    }
}
