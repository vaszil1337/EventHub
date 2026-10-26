package hu.eventhub.infrastructure.presentation.web;

public record TicketResponse(
        String id,
        String eventId,
        String participantName,
        String participantEmail,
        String ticketCode,
        PriceResponse price,
        String purchaseDate,
        String ticketTypeId,
        String ticketTypeName,
        String status,
        String emailStatus
) {}
