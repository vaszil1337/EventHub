package hu.eventhub.infrastructure.presentation.web;

public record BookingRequest(
        String eventId,
        String participantName,
        String participantEmail,
        String ticketTypeId,
        String locale
) {
    public BookingRequest(String eventId, String participantName, String participantEmail) {
        this(eventId, participantName, participantEmail, null, null);
    }

    public BookingRequest(String eventId, String participantName, String participantEmail, String ticketTypeId) {
        this(eventId, participantName, participantEmail, ticketTypeId, null);
    }
}
