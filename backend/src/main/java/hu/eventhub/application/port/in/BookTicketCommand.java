package hu.eventhub.application.port.in;

import java.util.Objects;

public record BookTicketCommand(
        String eventId,
        String participantName,
        String participantEmail,
        String ticketTypeId
) {
    public BookTicketCommand(String eventId, String participantName, String participantEmail) {
        this(eventId, participantName, participantEmail, null);
    }

    public BookTicketCommand {
        Objects.requireNonNull(eventId, "Event ID cannot be null");
        Objects.requireNonNull(participantName, "Participant name cannot be null");
        Objects.requireNonNull(participantEmail, "Participant email cannot be null");
        if (eventId.isBlank()) {
            throw new IllegalArgumentException("Event ID cannot be blank");
        }
        if (participantName.trim().isBlank()) {
            throw new IllegalArgumentException("Participant name is required");
        }
        if (participantEmail.trim().isBlank() || !participantEmail.contains("@")) {
            throw new IllegalArgumentException("A valid participant email is required");
        }
    }
}
