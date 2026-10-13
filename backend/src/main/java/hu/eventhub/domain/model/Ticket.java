package hu.eventhub.domain.model;

import java.time.Instant;
import java.util.Objects;

public class Ticket {
    private final TicketId id;
    private final EventId eventId;
    private final String participantName;
    private final String participantEmail;
    private final TicketCode ticketCode;
    private final Money price;
    private final Instant purchaseDate;

    public Ticket(
            TicketId id,
            EventId eventId,
            String participantName,
            String participantEmail,
            TicketCode ticketCode,
            Money price,
            Instant purchaseDate
    ) {
        this.id = Objects.requireNonNull(id, "Ticket id cannot be null");
        this.eventId = Objects.requireNonNull(eventId, "Event id cannot be null");
        this.participantName = Objects.requireNonNull(participantName, "Participant name cannot be null");
        this.participantEmail = Objects.requireNonNull(participantEmail, "Participant email cannot be null");
        this.ticketCode = Objects.requireNonNull(ticketCode, "Ticket code cannot be null");
        this.price = Objects.requireNonNull(price, "Price cannot be null");
        this.purchaseDate = Objects.requireNonNull(purchaseDate, "Purchase date cannot be null");
    }

    public static Ticket restore(TicketSnapshot snapshot) {
        return new Ticket(
                snapshot.id(),
                snapshot.eventId(),
                snapshot.participantName(),
                snapshot.participantEmail(),
                snapshot.ticketCode(),
                snapshot.price(),
                snapshot.purchaseDate()
        );
    }

    public TicketSnapshot toSnapshot() {
        return new TicketSnapshot(
                id,
                eventId,
                participantName,
                participantEmail,
                ticketCode,
                price,
                purchaseDate
        );
    }

    public TicketId getId() {
        return id;
    }

    public EventId getEventId() {
        return eventId;
    }

    public String getParticipantName() {
        return participantName;
    }

    public String getParticipantEmail() {
        return participantEmail;
    }

    public TicketCode getTicketCode() {
        return ticketCode;
    }

    public Money getPrice() {
        return price;
    }

    public Instant getPurchaseDate() {
        return purchaseDate;
    }
}
