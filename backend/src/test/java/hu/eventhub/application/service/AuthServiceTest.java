package hu.eventhub.application.service;

import hu.eventhub.application.port.in.AuthResult;
import hu.eventhub.application.port.in.LoginUserCommand;
import hu.eventhub.application.port.in.RegisterUserCommand;
import hu.eventhub.application.port.out.AuthenticatedPrincipal;
import hu.eventhub.domain.exception.AuthenticationException;
import hu.eventhub.domain.exception.UserAlreadyExistsException;
import hu.eventhub.domain.model.User;
import hu.eventhub.domain.model.UserRepository;
import hu.eventhub.domain.model.UserRole;
import hu.eventhub.infrastructure.security.BCryptPasswordHasherAdapter;
import hu.eventhub.infrastructure.security.HmacJwtTokenProviderAdapter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private AuthService authService;
    private HmacJwtTokenProviderAdapter tokenProvider;

    @BeforeEach
    void setUp() {
        UserRepository userRepository = mock(UserRepository.class);
        Map<String, User> persistedByEmail = new HashMap<>();

        when(userRepository.findByEmail(anyString())).thenAnswer(inv -> {
            String email = inv.getArgument(0, String.class).trim().toLowerCase();
            return Optional.ofNullable(persistedByEmail.get(email));
        });
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0, User.class);
            persistedByEmail.put(u.getEmail().toLowerCase(), u);
            return u;
        });

        BCryptPasswordHasherAdapter passwordHasher = new BCryptPasswordHasherAdapter();
        Clock fixedClock = Clock.fixed(Instant.parse("2026-10-26T10:00:00Z"), ZoneOffset.UTC);
        tokenProvider = new HmacJwtTokenProviderAdapter(
                "test-secret-signing-key-2026-eventhub-hmac-sha256",
                fixedClock
        );
        authService = new AuthService(userRepository, passwordHasher, tokenProvider, fixedClock);
    }

    @Test
    @DisplayName("Should register a new user, hash password with BCrypt, and return valid signed JWT")
    void shouldRegisterAndVerifyJwtToken() {
        RegisterUserCommand command = new RegisterUserCommand(
                "Anna Kovács",
                "anna@eventhub.hu",
                "secret123",
                UserRole.ORGANIZER
        );

        AuthResult result = authService.register(command);

        assertNotNull(result.token());
        assertEquals("Anna Kovács", result.user().getFullName());
        assertEquals("anna@eventhub.hu", result.user().getEmail());
        assertEquals(UserRole.ORGANIZER, result.user().getRole());
        assertNotEquals("secret123", result.user().getPasswordHash());

        Optional<AuthenticatedPrincipal> principal = tokenProvider.validateAndExtract(result.token());
        assertTrue(principal.isPresent());
        assertEquals("anna@eventhub.hu", principal.get().email());
        assertEquals(UserRole.ORGANIZER, principal.get().role());
    }

    @Test
    @DisplayName("Should reject tampered JWT token signature")
    void shouldRejectTamperedJwtToken() {
        AuthResult result = authService.register(new RegisterUserCommand(
                "Péter Nagy",
                "peter@eventhub.hu",
                "secret123",
                UserRole.PARTICIPANT
        ));

        String tamperedToken = result.token().substring(0, result.token().length() - 4) + "XXXX";
        assertTrue(tokenProvider.validateAndExtract(tamperedToken).isEmpty());
    }

    @Test
    @DisplayName("Should login existing user with valid credentials and reject wrong password")
    void shouldLoginAndRejectInvalidPassword() {
        authService.register(new RegisterUserCommand(
                "Péter Nagy",
                "peter@eventhub.hu",
                "correctPass",
                UserRole.PARTICIPANT
        ));

        AuthResult loginResult = authService.login(new LoginUserCommand("peter@eventhub.hu", "correctPass"));
        assertNotNull(loginResult.token());
        assertEquals("peter@eventhub.hu", loginResult.user().getEmail());

        assertThrows(
                AuthenticationException.class,
                () -> authService.login(new LoginUserCommand("peter@eventhub.hu", "wrongPass"))
        );
    }

    @Test
    @DisplayName("Should throw UserAlreadyExistsException when registering duplicate email")
    void shouldThrowOnDuplicateEmail() {
        RegisterUserCommand command = new RegisterUserCommand(
                "Péter Nagy",
                "duplicate@eventhub.hu",
                "secret123",
                UserRole.PARTICIPANT
        );
        authService.register(command);

        assertThrows(UserAlreadyExistsException.class, () -> authService.register(command));
    }
}
