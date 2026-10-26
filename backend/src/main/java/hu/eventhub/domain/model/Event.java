package hu.eventhub.domain.model;

import hu.eventhub.domain.exception.CapacityExceededException;
import hu.eventhub.domain.exception.InvalidBookingException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

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
    private final List<TicketType> ticketTypes;

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
        this(id, title, description, date, venue, soldTicketsCount, price, category, imageUrl, null);
    }

    public Event(
            EventId id,
            String title,
            String description,
            Instant date,
            Venue venue,
            int soldTicketsCount,
            Money price,
            String category,
            String imageUrl,
            List<TicketType> ticketTypes
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
        if (ticketTypes == null || ticketTypes.isEmpty()) {
            this.ticketTypes = createDefaultTicketTypes(id, venue, soldTicketsCount, price);
        } else {
            this.ticketTypes = new ArrayList<>(ticketTypes.stream().map(TicketType::copy).toList());
        }
    }

    private static List<TicketType> createDefaultTicketTypes(EventId eventId, Venue venue, int soldTicketsCount, Money basePrice) {
        int cap = venue.capacity();
        if (cap < 3) {
            int sold = Math.min(soldTicketsCount, cap);
            return new ArrayList<>(List.of(
                    new TicketType(
                            TicketTypeId.of(eventId.value() + "-standard"),
                            "Standard",
                            "General admission pass",
                            basePrice,
                            cap,
                            sold,
                            PricingRule.STANDARD
                    )
            ));
        }

        int earlyQuota = Math.max(1, cap / 5);
        int vipQuota = Math.max(1, cap / 5);
        int standardQuota = Math.max(1, cap - earlyQuota - vipQuota);

        int remainingSold = Math.min(soldTicketsCount, cap);
        int earlySold = Math.min(remainingSold, earlyQuota);
        remainingSold -= earlySold;
        int vipMaxInitial = soldTicketsCount < cap ? Math.max(0, vipQuota - 1) : vipQuota;
        int vipSold = Math.min(remainingSold, vipMaxInitial);
        remainingSold -= vipSold;
        int standardSold = Math.min(remainingSold, standardQuota);
        remainingSold -= standardSold;
        if (remainingSold > 0) {
            vipSold = Math.min(vipQuota, vipSold + remainingSold);
        }

        BigDecimal vipAmount = basePrice.amount()
                .multiply(BigDecimal.valueOf(1.5))
                .setScale(2, RoundingMode.HALF_UP)
                .stripTrailingZeros();
        if (vipAmount.scale() < 0) {
            vipAmount = vipAmount.setScale(0, RoundingMode.UNNECESSARY);
        }
        Money vipPrice = new Money(vipAmount, basePrice.currency());

        List<TicketType> defaults = new ArrayList<>();
        defaults.add(new TicketType(
                TicketTypeId.of(eventId.value() + "-early-bird"),
                "Early Bird",
                "Discounted early access pass (-20% below 50% venue occupancy)",
                basePrice,
                earlyQuota,
                earlySold,
                PricingRule.EARLY_BIRD
        ));
        defaults.add(new TicketType(
                TicketTypeId.of(eventId.value() + "-standard"),
                "Standard",
                "General admission pass (+15% dynamic surge above 80% occupancy)",
                basePrice,
                standardQuota,
                standardSold,
                PricingRule.STANDARD
        ));
        defaults.add(new TicketType(
                TicketTypeId.of(eventId.value() + "-vip"),
                "VIP Pass",
                "Priority front-row seating & networking lounge",
                vipPrice,
                vipQuota,
                vipSold,
                PricingRule.VIP
        ));
        return defaults;
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
                snapshot.imageUrl(),
                snapshot.ticketTypes()
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
                imageUrl,
                ticketTypes.stream().map(TicketType::copy).toList()
        );
    }

    public Capacity getCapacity() {
        return Capacity.of(venue.capacity(), Math.min(soldTicketsCount, venue.capacity()));
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
        // Also increment the first available tier to keep tier counts synchronized
        for (TicketType tier : ticketTypes) {
            if (tier.hasAvailableQuota()) {
                tier.recordSale();
                break;
            }
        }
    }

    public TicketType recordBookingForTicketType(String ticketTypeId) {
        if (!hasAvailableSeats()) {
            throw new CapacityExceededException(
                    String.format("Event \"%s\" is fully booked (%d/%d seats taken). No tickets available.",
                            title, soldTicketsCount, venue.capacity())
            );
        }

        if (ticketTypeId == null || ticketTypeId.isBlank()) {
            this.soldTicketsCount++;
            for (TicketType tier : ticketTypes) {
                if (tier.hasAvailableQuota()) {
                    tier.recordSale();
                    return tier;
                }
            }
            return new TicketType(
                    TicketTypeId.of(id.value() + "-standard"),
                    "Standard",
                    "General admission",
                    price,
                    venue.capacity(),
                    soldTicketsCount,
                    PricingRule.FIXED
            );
        }

        TicketType selected = findTicketType(ticketTypeId)
                .orElseThrow(() -> new InvalidBookingException("Ticket type \"" + ticketTypeId + "\" does not exist for this event."));

        // Enforces tier-specific quota
        selected.recordSale();
        this.soldTicketsCount++;
        return selected;
    }

    public void cancelBooking(String ticketTypeId) {
        if (this.soldTicketsCount > 0) {
            this.soldTicketsCount--;
        }
        if (ticketTypeId != null && !ticketTypeId.isBlank()) {
            findTicketType(ticketTypeId).ifPresent(TicketType::cancelSale);
        } else {
            for (int i = ticketTypes.size() - 1; i >= 0; i--) {
                if (ticketTypes.get(i).getSoldCount() > 0) {
                    ticketTypes.get(i).cancelSale();
                    break;
                }
            }
        }
    }

    public void addTicketType(TicketType newType) {
        Objects.requireNonNull(newType, "TicketType cannot be null");
        if (newType.getQuota() > venue.capacity()) {
            throw new InvalidBookingException(
                    String.format("Ticket type quota (%d) cannot exceed venue physical capacity (%d).",
                            newType.getQuota(), venue.capacity())
            );
        }
        boolean duplicate = ticketTypes.stream()
                .anyMatch(t -> t.getId().equals(newType.getId()) || t.getName().equalsIgnoreCase(newType.getName()));
        if (duplicate) {
            throw new InvalidBookingException("Ticket type with name \"" + newType.getName() + "\" already exists on this event.");
        }
        this.ticketTypes.add(newType.copy());
    }

    public Optional<TicketType> findTicketType(String ticketTypeId) {
        return ticketTypes.stream()
                .filter(t -> t.getId().value().equals(ticketTypeId) || t.getName().equalsIgnoreCase(ticketTypeId))
                .findFirst();
    }

    public List<TicketType> getTicketTypes() {
        return Collections.unmodifiableList(ticketTypes);
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
