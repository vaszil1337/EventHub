package hu.eventhub.application.service;

import hu.eventhub.application.port.in.AddTicketTypeCommand;
import hu.eventhub.application.port.in.AddTicketTypeUseCase;
import hu.eventhub.domain.exception.EventNotFoundException;
import hu.eventhub.domain.model.*;

import java.util.Objects;
import java.util.UUID;

public class AddTicketTypeService implements AddTicketTypeUseCase {
    private final EventRepository eventRepository;

    public AddTicketTypeService(EventRepository eventRepository) {
        this.eventRepository = Objects.requireNonNull(eventRepository, "eventRepository cannot be null");
    }

    @Override
    public Event addTicketType(AddTicketTypeCommand command) {
        Objects.requireNonNull(command, "command cannot be null");
        EventId eventId = EventId.of(command.eventId());
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event with ID \"" + command.eventId() + "\" does not exist."));

        String slug = command.name().trim().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        String tierId = eventId.value() + "-" + (slug.isEmpty() ? UUID.randomUUID().toString().substring(0, 4) : slug);

        String currency = (command.priceCurrency() == null || command.priceCurrency().isBlank())
                ? event.getPrice().currency()
                : command.priceCurrency().trim().toUpperCase();

        Money basePrice = new Money(command.basePriceAmount(), currency);
        PricingRule rule = command.pricingRule() != null ? command.pricingRule() : PricingRule.STANDARD;

        TicketType newTier = new TicketType(
                TicketTypeId.of(tierId),
                command.name().trim(),
                command.description() != null ? command.description().trim() : "",
                basePrice,
                command.quota(),
                0,
                rule
        );

        event.addTicketType(newTier);
        return eventRepository.save(event);
    }
}
