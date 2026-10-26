package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.application.port.in.AuthResult;
import hu.eventhub.application.port.in.AuthUseCase;
import hu.eventhub.application.port.in.LoginUserCommand;
import hu.eventhub.application.port.in.RegisterUserCommand;
import hu.eventhub.application.port.out.AuthenticatedPrincipal;
import hu.eventhub.application.port.out.TokenProviderPort;
import hu.eventhub.domain.exception.AuthenticationException;
import hu.eventhub.domain.model.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthUseCase authUseCase;
    private final TokenProviderPort tokenProvider;

    public AuthController(AuthUseCase authUseCase, TokenProviderPort tokenProvider) {
        this.authUseCase = Objects.requireNonNull(authUseCase, "authUseCase cannot be null");
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        UserRole role = UserRole.fromHeader(request.role());
        RegisterUserCommand command = new RegisterUserCommand(
                request.fullName(),
                request.email(),
                request.password(),
                role
        );
        AuthResult result = authUseCase.register(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponse.fromResult(result));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        LoginUserCommand command = new LoginUserCommand(request.email(), request.password());
        AuthResult result = authUseCase.login(command);
        return ResponseEntity.ok(AuthResponse.fromResult(result));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedPrincipal principal) {
            return ResponseEntity.ok(new UserResponse(
                    principal.userId(),
                    principal.fullName(),
                    principal.email(),
                    principal.role().name()
            ));
        }

        if (tokenProvider != null && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            AuthenticatedPrincipal principal = tokenProvider.validateAndExtract(token)
                    .orElseThrow(() -> new AuthenticationException("Invalid or expired JWT token."));
            return ResponseEntity.ok(new UserResponse(
                    principal.userId(),
                    principal.fullName(),
                    principal.email(),
                    principal.role().name()
            ));
        }

        throw new AuthenticationException("Authentication is required to access current user profile.");
    }
}
