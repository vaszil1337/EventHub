package hu.eventhub.application.port.out;

import hu.eventhub.domain.model.User;

import java.util.Optional;

public interface TokenProviderPort {
    String generateToken(User user);

    Optional<AuthenticatedPrincipal> validateAndExtract(String token);
}
