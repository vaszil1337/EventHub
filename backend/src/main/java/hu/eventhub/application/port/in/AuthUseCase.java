package hu.eventhub.application.port.in;

import hu.eventhub.domain.model.User;
import hu.eventhub.domain.model.UserId;

import java.util.Optional;

public interface AuthUseCase {
    AuthResult register(RegisterUserCommand command);

    AuthResult login(LoginUserCommand command);

    Optional<User> getUserById(UserId id);
}
