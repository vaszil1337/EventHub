package hu.eventhub.domain.model;

import hu.eventhub.infrastructure.configuration.DefaultTicketCodeGenerator;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

class TicketCodeTest {

    @Test
    @DisplayName("Should accept valid ticket code format EVT-YYYY-XXXX")
    void shouldAcceptValidFormat() {
        assertDoesNotThrow(() -> TicketCode.of("EVT-2026-ABCD"));
        assertDoesNotThrow(() -> TicketCode.of("EVT-2026-9XYZ"));
    }

    @Test
    @DisplayName("Should reject invalid ticket code format")
    void shouldRejectInvalidFormat() {
        assertThrows(IllegalArgumentException.class, () -> TicketCode.of("INVALID-CODE"));
        assertThrows(IllegalArgumentException.class, () -> TicketCode.of("EVT-26-ABCD"));
        assertThrows(IllegalArgumentException.class, () -> TicketCode.of("EVT-2026-abc"));
    }

    @Test
    @DisplayName("TicketCodeGenerator should generate valid ticket code for current year")
    void shouldGenerateValidCode() {
        Clock fixedClock = Clock.fixed(Instant.parse("2026-06-15T12:00:00Z"), ZoneOffset.UTC);
        TicketCodeGenerator generator = new DefaultTicketCodeGenerator(fixedClock);

        TicketCode code = generator.generate();

        assertNotNull(code);
        assertTrue(code.value().startsWith("EVT-2026-"));
        assertEquals(13, code.value().length());
    }
}
