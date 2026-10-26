package hu.eventhub.infrastructure.persistence;

import hu.eventhub.application.port.out.PasswordHasherPort;
import hu.eventhub.domain.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public DatabaseSeeder(
            EventRepository eventRepository,
            UserRepository userRepository,
            PasswordHasherPort passwordHasher,
            @Autowired(required = false) JdbcTemplate jdbcTemplate
    ) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.jdbcTemplate = jdbcTemplate;
    }

    public DatabaseSeeder(
            EventRepository eventRepository,
            UserRepository userRepository,
            PasswordHasherPort passwordHasher
    ) {
        this(eventRepository, userRepository, passwordHasher, null);
    }

    @Override
    public void run(String... args) {
        ensureDatabaseSchemaCompatibility();

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

    private void ensureDatabaseSchemaCompatibility() {
        if (jdbcTemplate == null) {
            return;
        }
        try {
            jdbcTemplate.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_type_id VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_type_name VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'VALID'");
            jdbcTemplate.execute("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS email_status VARCHAR(50) DEFAULT 'SENT'");
            jdbcTemplate.execute("UPDATE tickets SET status = 'VALID' WHERE status IS NULL");
            jdbcTemplate.execute("UPDATE tickets SET email_status = 'SENT' WHERE email_status IS NULL");
            jdbcTemplate.execute("UPDATE users SET full_name = 'Anna Kovács' WHERE email = 'organizer@eventhub.hu' AND full_name LIKE '%(Organizer)%'");
            jdbcTemplate.execute("UPDATE users SET full_name = 'Péter Nagy' WHERE email = 'participant@eventhub.hu' AND full_name LIKE '%(Participant)%'");
            jdbcTemplate.execute("UPDATE tickets SET participant_name = TRIM(REPLACE(REPLACE(participant_name, '(Participant)', ''), '(Organizer)', '')) WHERE participant_name LIKE '%(Participant)%' OR participant_name LIKE '%(Organizer)%'");
            log.info("Verified PostgreSQL tickets table schema (ensured ticket_type_id, ticket_type_name, status, email_status columns).");
        } catch (Exception e) {
            log.warn("Database schema compatibility check failed or table not yet created: {}", e.getMessage());
        }
    }

    private void seedDefaultUsers() {
        if (userRepository.findByEmail("organizer@eventhub.hu").isEmpty()) {
            User organizer = new User(
                    UserId.of("usr-organizer-demo"),
                    "Anna Kovács",
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
                    "Péter Nagy",
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
