package hu.eventhub.infrastructure.configuration;

import hu.eventhub.domain.model.TicketCode;
import hu.eventhub.domain.model.TicketCodeGenerator;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Year;
import java.util.Objects;

public class DefaultTicketCodeGenerator implements TicketCodeGenerator {
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int RANDOM_LENGTH = 4;
    private final SecureRandom random = new SecureRandom();
    private final Clock clock;

    public DefaultTicketCodeGenerator(Clock clock) {
        this.clock = Objects.requireNonNull(clock, "clock cannot be null");
    }

    @Override
    public TicketCode generate() {
        int year = Year.now(clock).getValue();
        StringBuilder sb = new StringBuilder(RANDOM_LENGTH);
        for (int i = 0; i < RANDOM_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return TicketCode.of(String.format("EVT-%d-%s", year, sb.toString()));
    }
}
