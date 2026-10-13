package hu.eventhub.domain.model;

import java.time.Instant;

public record TicketSnapshot(
        TicketId id,
        EventId eventId,
        String participantName,
        String participantEmail,
        TicketCode ticketCode,
        Money price,
        Instant purchaseDate
) {}
