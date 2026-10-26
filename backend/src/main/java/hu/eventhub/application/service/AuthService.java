package hu.eventhub.application.service;

import hu.eventhub.application.port.in.AuthResult;
import hu.eventhub.application.port.in.AuthUseCase;
import hu.eventhub.application.port.in.LoginUserCommand;
import hu.eventhub.application.port.in.RegisterUserCommand;
import hu.eventhub.application.port.out.PasswordHasherPort;
import hu.eventhub.application.port.out.TokenProviderPort;
import hu.eventhub.domain.exception.AuthenticationException;
import hu.eventhub.domain.exception.UserAlreadyExistsException;
import hu.eventhub.domain.model.User;
import hu.eventhub.domain.model.UserId;
import hu.eventhub.domain.model.UserRepository;

import java.time.Clock;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

public class AuthService implements AuthUseCase {

    private final UserRepository userRepository;
    private final PasswordHasherPort passwordHasher;
    private final TokenProviderPort tokenProvider;
    private final Clock clock;

    public AuthService(
            UserRepository userRepository,
            PasswordHasherPort passwordHasher,
            TokenProviderPort tokenProvider,
            Clock clock
    ) {
        this.userRepository = Objects.requireNonNull(userRepository, "userRepository cannot be null");
        this.passwordHasher = Objects.requireNonNull(passwordHasher, "passwordHasher cannot be null");
        this.tokenProvider = Objects.requireNonNull(tokenProvider, "tokenProvider cannot be null");
        this.clock = Objects.requireNonNull(clock, "clock cannot be null");
    }

    @Override
    public AuthResult register(RegisterUserCommand command) {
        Objects.requireNonNull(command, "command cannot be null");
        String normalizedEmail = command.email().trim().toLowerCase();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new UserAlreadyExistsException("A user with email \"" + normalizedEmail + "\" is already registered.");
        }

        User user = new User(
                UserId.of("usr-" + UUID.randomUUID()),
                command.fullName().trim(),
                normalizedEmail,
                passwordHasher.hash(command.password()),
                command.role(),
                clock.instant()
        );

        User saved = userRepository.save(user);
        String token = tokenProvider.generateToken(saved);
        return new AuthResult(saved, token);
    }

    @Override
    public AuthResult login(LoginUserCommand command) {
        Objects.requireNonNull(command, "command cannot be null");
        String normalizedEmail = command.email().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new AuthenticationException("Invalid email or password."));

        if (!passwordHasher.matches(command.password(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid email or password.");
        }

        String token = tokenProvider.generateToken(user);
        return new AuthResult(user, token);
    }

    @Override
    public Optional<User> getUserById(UserId id) {
        return userRepository.findById(id);
    }
}
