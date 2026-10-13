package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.domain.model.Ticket;
import hu.eventhub.domain.model.TicketSnapshot;

public final class TicketResponseMapper {

    private TicketResponseMapper() {}

    public static TicketResponse toResponse(Ticket ticket) {
        TicketSnapshot snapshot = ticket.toSnapshot();
        return new TicketResponse(
                snapshot.id().value(),
                snapshot.eventId().value(),
                snapshot.participantName(),
                snapshot.participantEmail(),
                snapshot.ticketCode().value(),
                new PriceResponse(snapshot.price().amount(), snapshot.price().currency()),
                snapshot.purchaseDate().toString()
        );
    }
}
