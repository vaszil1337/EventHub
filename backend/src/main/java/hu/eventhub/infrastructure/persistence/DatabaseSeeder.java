package hu.eventhub.infrastructure.persistence;

import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.EventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds initial event catalog into the PostgreSQL database upon application startup
 * if no events are present, and ensures all events have their ticket type tiers persisted.
 */
@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);
    private final EventRepository eventRepository;

    public DatabaseSeeder(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
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
    }
}
