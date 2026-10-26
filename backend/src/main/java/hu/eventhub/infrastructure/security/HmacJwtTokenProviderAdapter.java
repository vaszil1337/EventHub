package hu.eventhub.infrastructure.security;

import hu.eventhub.application.port.out.AuthenticatedPrincipal;
import hu.eventhub.application.port.out.TokenProviderPort;
import hu.eventhub.domain.model.User;
import hu.eventhub.domain.model.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Duration;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * RFC 7519 compliant HMAC-SHA256 (HS256) JWT Token Provider.
 * Cryptographically signs and validates tokens on the server side so roles and identities
 * cannot be forged by clients.
 */
@Component
public class HmacJwtTokenProviderAdapter implements TokenProviderPort {

    private static final String HMAC_ALG = "HmacSHA256";
    private static final String HEADER_JSON = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    private static final Duration TOKEN_VALIDITY = Duration.ofHours(24);

    private final byte[] secretBytes;
    private final Clock clock;

    public HmacJwtTokenProviderAdapter(
            @Value("${eventhub.security.jwt-secret:eventhub-super-secret-hmac-sha256-signing-key-2026-production}") String secret,
            Clock clock
    ) {
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.clock = clock != null ? clock : Clock.systemUTC();
    }

    public HmacJwtTokenProviderAdapter() {
        this("eventhub-super-secret-hmac-sha256-signing-key-2026-production", Clock.systemUTC());
    }

    @Override
    public String generateToken(User user) {
        long iat = clock.instant().getEpochSecond();
        long exp = clock.instant().plus(TOKEN_VALIDITY).getEpochSecond();

        String payloadJson = String.format(
                "{\"sub\":\"%s\",\"email\":\"%s\",\"name\":\"%s\",\"role\":\"%s\",\"iat\":%d,\"exp\":%d}",
                escapeJson(user.getId().value()),
                escapeJson(user.getEmail()),
                escapeJson(user.getFullName()),
                escapeJson(user.getRole().name()),
                iat,
                exp
        );

        String encodedHeader = base64UrlEncode(HEADER_JSON.getBytes(StandardCharsets.UTF_8));
        String encodedPayload = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));
        String signingInput = encodedHeader + "." + encodedPayload;
        String signature = sign(signingInput);

        return signingInput + "." + signature;
    }

    @Override
    public Optional<AuthenticatedPrincipal> validateAndExtract(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        String[] parts = token.trim().split("\\.");
        if (parts.length != 3) {
            return Optional.empty();
        }

        String signingInput = parts[0] + "." + parts[1];
        String expectedSig = sign(signingInput);

        if (!MessageDigest.isEqual(
                expectedSig.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8)
        )) {
            return Optional.empty();
        }

        try {
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            long exp = extractLongClaim(payloadJson, "exp");
            long now = clock.instant().getEpochSecond();
            if (exp <= now) {
                return Optional.empty();
            }

            String sub = extractStringClaim(payloadJson, "sub");
            String email = extractStringClaim(payloadJson, "email");
            String name = extractStringClaim(payloadJson, "name");
            String roleStr = extractStringClaim(payloadJson, "role");

            if (sub == null || email == null || roleStr == null) {
                return Optional.empty();
            }

            UserRole role = UserRole.fromHeader(roleStr);
            return Optional.of(new AuthenticatedPrincipal(sub, email, name != null ? name : email, role));
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretBytes, "HmacSHA256"));
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(rawHmac);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to sign JWT token", ex);
        }
    }

    private static String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String escapeJson(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String extractStringClaim(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"((?:\\\\\"|[^\"])*)\"");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1).replace("\\\"", "\"").replace("\\\\", "\\");
        }
        return null;
    }

    private static long extractLongClaim(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*(\\d+)");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return Long.parseLong(matcher.group(1));
        }
        return 0L;
    }
}
