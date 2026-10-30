package hu.eventhub.application.service;

import hu.eventhub.application.port.in.CreateEventCommand;
import hu.eventhub.application.port.in.CreateEventUseCase;
import hu.eventhub.domain.model.*;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class CreateEventService implements CreateEventUseCase {
    private final EventRepository eventRepository;

    public CreateEventService(EventRepository eventRepository) {
        this.eventRepository = Objects.requireNonNull(eventRepository, "eventRepository cannot be null");
    }

    @Override
    public Event createEvent(CreateEventCommand command) {
        Objects.requireNonNull(command, "command cannot be null");

        String slug = command.title().trim().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 6);
        EventId eventId = EventId.of("evt-" + (slug.isEmpty() ? "custom" : slug) + "-" + uniqueSuffix);
        String venueId = "venue-" + uniqueSuffix;

        Venue venue = Venue.of(
                venueId,
                command.venueName().trim(),
                command.venueAddress().trim(),
                command.venueCapacity()
        );

        String currency = (command.priceCurrency() == null || command.priceCurrency().isBlank())
                ? "USD"
                : command.priceCurrency().trim().toUpperCase();
        Money basePrice = new Money(command.priceAmount(), currency);

        Instant eventDate = command.date() != null ? command.date() : Instant.now().plusSeconds(86400 * 14);
        String category = (command.category() == null || command.category().isBlank()) ? "Conference" : command.category().trim();
        String imageUrl = (command.imageUrl() == null || command.imageUrl().isBlank())
                ? "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80"
                : command.imageUrl().trim();

        Event event = new Event(
                eventId,
                command.title().trim(),
                command.titleHu() != null ? command.titleHu().trim() : command.title().trim(),
                command.description() != null ? command.description().trim() : "",
                command.descriptionHu() != null ? command.descriptionHu().trim() : (command.description() != null ? command.description().trim() : ""),
                eventDate,
                venue,
                0,
                basePrice,
                category,
                imageUrl,
                null
        );

        return eventRepository.save(event);
    }
}
