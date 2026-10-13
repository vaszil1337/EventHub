package hu.eventhub.domain.model;

import hu.eventhub.domain.exception.CapacityExceededException;

import java.time.Instant;
import java.util.Objects;

public class Event {
    private final EventId id;
    private final String title;
    private final String description;
    private final Instant date;
    private final Venue venue;
    private int soldTicketsCount;
    private final Money price;
    private final String category;
    private final String imageUrl;

    public Event(
            EventId id,
            String title,
            String description,
            Instant date,
            Venue venue,
            int soldTicketsCount,
            Money price,
            String category,
            String imageUrl
    ) {
        this.id = Objects.requireNonNull(id, "Event id cannot be null");
        this.title = Objects.requireNonNull(title, "Event title cannot be null");
        this.description = Objects.requireNonNull(description, "Event description cannot be null");
        this.date = Objects.requireNonNull(date, "Event date cannot be null");
        this.venue = Objects.requireNonNull(venue, "Venue cannot be null");
        if (soldTicketsCount < 0) {
            throw new IllegalArgumentException("soldTicketsCount cannot be negative");
        }
        this.soldTicketsCount = soldTicketsCount;
        this.price = Objects.requireNonNull(price, "Price cannot be null");
        this.category = category;
        this.imageUrl = imageUrl;
    }

    public static Event restore(EventSnapshot snapshot) {
        return new Event(
                snapshot.id(),
                snapshot.title(),
                snapshot.description(),
                snapshot.date(),
                snapshot.venue(),
                snapshot.soldTicketsCount(),
                snapshot.price(),
                snapshot.category(),
                snapshot.imageUrl()
        );
    }

    public EventSnapshot toSnapshot() {
        return new EventSnapshot(
                id,
                title,
                description,
                date,
                venue,
                soldTicketsCount,
                price,
                category,
                imageUrl
        );
    }

    public boolean hasAvailableSeats() {
        return soldTicketsCount < venue.capacity();
    }

    public int availableSeats() {
        return Math.max(0, venue.capacity() - soldTicketsCount);
    }

    public void recordBooking() {
        if (!hasAvailableSeats()) {
            throw new CapacityExceededException(
                    String.format("Event \"%s\" is fully booked (%d/%d seats taken). No tickets available.",
                            title, soldTicketsCount, venue.capacity())
            );
        }
        this.soldTicketsCount++;
    }

    public EventId getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Instant getDate() {
        return date;
    }

    public Venue getVenue() {
        return venue;
    }

    public int getSoldTicketsCount() {
        return soldTicketsCount;
    }

    public Money getPrice() {
        return price;
    }

    public String getCategory() {
        return category;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
