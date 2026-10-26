package hu.eventhub.domain.model;

import hu.eventhub.domain.exception.InvalidBookingException;

import java.time.Instant;
import java.util.Objects;

public class Ticket {
    private final TicketId id;
    private final EventId eventId;
    private final String ticketTypeId;
    private final String ticketTypeName;
    private final String participantName;
    private final String participantEmail;
    private final TicketCode ticketCode;
    private final Money price;
    private final Instant purchaseDate;
    private TicketStatus status;
    private EmailDeliveryStatus emailStatus;

    public Ticket(
            TicketId id,
            EventId eventId,
            String participantName,
            String participantEmail,
            TicketCode ticketCode,
            Money price,
            Instant purchaseDate
    ) {
        this(
                id,
                eventId,
                eventId.value() + "-standard",
                "Standard",
                participantName,
                participantEmail,
                ticketCode,
                price,
                purchaseDate,
                TicketStatus.VALID,
                EmailDeliveryStatus.SENT
        );
    }

    public Ticket(
            TicketId id,
            EventId eventId,
            String ticketTypeId,
            String ticketTypeName,
            String participantName,
            String participantEmail,
            TicketCode ticketCode,
            Money price,
            Instant purchaseDate,
            TicketStatus status,
            EmailDeliveryStatus emailStatus
    ) {
        this.id = Objects.requireNonNull(id, "Ticket id cannot be null");
        this.eventId = Objects.requireNonNull(eventId, "Event id cannot be null");
        this.ticketTypeId = ticketTypeId != null && !ticketTypeId.isBlank() ? ticketTypeId : eventId.value() + "-standard";
        this.ticketTypeName = ticketTypeName != null && !ticketTypeName.isBlank() ? ticketTypeName : "Standard";
        this.participantName = Objects.requireNonNull(participantName, "Participant name cannot be null");
        this.participantEmail = Objects.requireNonNull(participantEmail, "Participant email cannot be null");
        this.ticketCode = Objects.requireNonNull(ticketCode, "Ticket code cannot be null");
        this.price = Objects.requireNonNull(price, "Price cannot be null");
        this.purchaseDate = Objects.requireNonNull(purchaseDate, "Purchase date cannot be null");
        this.status = status != null ? status : TicketStatus.VALID;
        this.emailStatus = emailStatus != null ? emailStatus : EmailDeliveryStatus.SENT;
    }

    public static Ticket restore(TicketSnapshot snapshot) {
        return new Ticket(
                snapshot.id(),
                snapshot.eventId(),
                snapshot.ticketTypeId(),
                snapshot.ticketTypeName(),
                snapshot.participantName(),
                snapshot.participantEmail(),
                snapshot.ticketCode(),
                snapshot.price(),
                snapshot.purchaseDate(),
                snapshot.status(),
                snapshot.emailStatus()
        );
    }

    public TicketSnapshot toSnapshot() {
        return new TicketSnapshot(
                id,
                eventId,
                ticketTypeId,
                ticketTypeName,
                participantName,
                participantEmail,
                ticketCode,
                price,
                purchaseDate,
                status,
                emailStatus
        );
    }

    public void cancel() {
        if (this.status == TicketStatus.CANCELLED) {
            throw new InvalidBookingException("Ticket \"" + ticketCode.value() + "\" is already cancelled.");
        }
        this.status = TicketStatus.CANCELLED;
    }

    public void markEmailStatus(EmailDeliveryStatus emailStatus) {
        this.emailStatus = Objects.requireNonNull(emailStatus, "emailStatus cannot be null");
    }

    public TicketId getId() {
        return id;
    }

    public EventId getEventId() {
        return eventId;
    }

    public String getTicketTypeId() {
        return ticketTypeId;
    }

    public String getTicketTypeName() {
        return ticketTypeName;
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

    public TicketStatus getStatus() {
        return status;
    }

    public EmailDeliveryStatus getEmailStatus() {
        return emailStatus;
    }
}
