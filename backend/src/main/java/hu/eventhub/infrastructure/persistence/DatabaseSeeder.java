package hu.eventhub.infrastructure.persistence;

import hu.eventhub.application.port.out.PasswordHasherPort;
import hu.eventhub.domain.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * Seeds initial event catalog and demo user accounts into the PostgreSQL database
 * upon application startup if not already present.
 */
@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final PasswordHasherPort passwordHasher;

    public DatabaseSeeder(
            EventRepository eventRepository,
            UserRepository userRepository,
            PasswordHasherPort passwordHasher
    ) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }

    @Override
    public void run(String... args) {
        List<Event> existing = eventRepository.findAll();
        if (existing.isEmpty()) {
            log.info("No events found in PostgreSQL database. Seeding initial event data...");
            eventRepository.resetToSampleData();
            log.info("DatabaseSeeder successfully inserted {} initial events into PostgreSQL.", eventRepository.findAll().size());
        } else {
            for (Event event : existing) {
                eventRepository.save(event);
            }
            log.info("Database already contains {} events (verified ticket type tiers).", existing.size());
        }

        seedDefaultUsers();
    }

    private void seedDefaultUsers() {
        if (userRepository.findByEmail("organizer@eventhub.hu").isEmpty()) {
            User organizer = new User(
                    UserId.of("usr-organizer-demo"),
                    "Anna Kovács (Organizer)",
                    "organizer@eventhub.hu",
                    passwordHasher.hash("organizer123"),
                    UserRole.ORGANIZER,
                    Instant.now()
            );
            userRepository.save(organizer);
            log.info("Seeded default ORGANIZER user: organizer@eventhub.hu");
        }

        if (userRepository.findByEmail("participant@eventhub.hu").isEmpty()) {
            User participant = new User(
                    UserId.of("usr-participant-demo"),
                    "Péter Nagy (Participant)",
                    "participant@eventhub.hu",
                    passwordHasher.hash("participant123"),
                    UserRole.PARTICIPANT,
                    Instant.now()
            );
            userRepository.save(participant);
            log.info("Seeded default PARTICIPANT user: participant@eventhub.hu");
        }
    }
}
