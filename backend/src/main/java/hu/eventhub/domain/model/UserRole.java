package hu.eventhub.domain.model;

public enum UserRole {
    PARTICIPANT,
    ORGANIZER;

    public static UserRole fromHeader(String headerValue) {
        if (headerValue == null || headerValue.isBlank()) {
            return ORGANIZER; // Default when unspecified in legacy requests
        }
        try {
            return UserRole.valueOf(headerValue.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return PARTICIPANT;
        }
    }
}
