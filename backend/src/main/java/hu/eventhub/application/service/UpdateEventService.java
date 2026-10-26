package hu.eventhub.application.service;

import hu.eventhub.application.port.in.UpdateEventCommand;
import hu.eventhub.application.port.in.UpdateEventUseCase;
import hu.eventhub.domain.exception.EventNotFoundException;
import hu.eventhub.domain.model.*;

import java.time.Instant;
import java.util.Objects;

public class UpdateEventService implements UpdateEventUseCase {
    private final EventRepository eventRepository;

    public UpdateEventService(EventRepository eventRepository) {
        this.eventRepository = Objects.requireNonNull(eventRepository, "eventRepository cannot be null");
    }

    @Override
    public Event updateEvent(UpdateEventCommand command) {
        Objects.requireNonNull(command, "command cannot be null");

        Event existing = eventRepository.findById(EventId.of(command.id()))
                .orElseThrow(() -> new EventNotFoundException("Event with ID \"" + command.id() + "\" does not exist."));

        if (command.venueCapacity() < existing.getSoldTicketsCount()) {
            throw new IllegalArgumentException(
                    "Venue capacity (" + command.venueCapacity() + ") cannot be less than already reserved seats (" + existing.getSoldTicketsCount() + ")."
            );
        }

        Venue updatedVenue = Venue.of(
                existing.getVenue().id().value(),
                command.venueName().trim(),
                command.venueAddress().trim(),
                command.venueCapacity()
        );

        String currency = (command.priceCurrency() == null || command.priceCurrency().isBlank())
                ? existing.getPrice().currency()
                : command.priceCurrency().trim().toUpperCase();
        Money updatedPrice = new Money(command.priceAmount(), currency);

        Instant eventDate = command.date() != null ? command.date() : existing.getDate();
        String category = (command.category() == null || command.category().isBlank()) ? existing.getCategory() : command.category().trim();
        String imageUrl = (command.imageUrl() == null || command.imageUrl().isBlank()) ? existing.getImageUrl() : command.imageUrl().trim();

        Event updated = new Event(
                existing.getId(),
                command.title().trim(),
                command.description() != null ? command.description().trim() : "",
                eventDate,
                updatedVenue,
                existing.getSoldTicketsCount(),
                updatedPrice,
                category,
                imageUrl,
                existing.getTicketTypes()
        );

        return eventRepository.save(updated);
    }
}
