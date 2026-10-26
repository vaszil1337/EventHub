package hu.eventhub.domain.model;

import java.time.Instant;

public record TicketSnapshot(
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
    public TicketSnapshot(
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
}
