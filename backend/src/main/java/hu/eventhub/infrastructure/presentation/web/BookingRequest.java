package hu.eventhub.infrastructure.presentation.web;

public record BookingRequest(
        String eventId,
        String participantName,
        String participantEmail,
        String ticketTypeId
) {
    public BookingRequest(String eventId, String participantName, String participantEmail) {
        this(eventId, participantName, participantEmail, null);
    }
}
