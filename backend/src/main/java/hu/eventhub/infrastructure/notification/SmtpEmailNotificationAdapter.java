package hu.eventhub.infrastructure.notification;

import hu.eventhub.application.port.out.EmailNotificationPort;
import hu.eventhub.domain.exception.EmailDeliveryException;
import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.Ticket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Outbound infrastructure adapter for external e-mail confirmation delivery.
 * Supports simulated provider outages and failing recipient domains for resilience testing.
 */
@Component
public class SmtpEmailNotificationAdapter implements EmailNotificationPort {
    private static final Logger log = LoggerFactory.getLogger(SmtpEmailNotificationAdapter.class);

    public record SentEmailRecord(
            String recipientEmail,
            String recipientName,
            String ticketCode,
            String eventTitle,
            String tierName,
            Instant sentAt
    ) {}

    private final List<SentEmailRecord> sentEmails = new CopyOnWriteArrayList<>();
    private volatile boolean simulateProviderOutage = false;

    @Override
    public void sendTicketConfirmation(Ticket ticket, Event event) {
        String email = ticket.getParticipantEmail().toLowerCase();

        if (simulateProviderOutage
                || email.endsWith("@fail-email.test")
                || email.endsWith("@error.test")
                || email.endsWith("@smtp-down.io")) {
            throw new EmailDeliveryException(
                    "External Email Gateway Error (503 Service Unavailable): Failed to deliver ticket confirmation to "
                            + ticket.getParticipantEmail()
            );
        }

        SentEmailRecord record = new SentEmailRecord(
                ticket.getParticipantEmail(),
                ticket.getParticipantName(),
                ticket.getTicketCode().value(),
                event.getTitle(),
                ticket.getTicketTypeName(),
                Instant.now()
        );
        sentEmails.add(record);

        log.info("[EXTERNAL-EMAIL-GATEWAY] Delivered ticket confirmation to {} | Code: {} | Event: {} ({})",
                ticket.getParticipantEmail(),
                ticket.getTicketCode().value(),
                event.getTitle(),
                ticket.getTicketTypeName());
    }

    public void setSimulateProviderOutage(boolean simulateProviderOutage) {
        this.simulateProviderOutage = simulateProviderOutage;
    }

    public List<SentEmailRecord> getSentEmails() {
        return Collections.unmodifiableList(sentEmails);
    }

    public void clearSentEmails() {
        sentEmails.clear();
    }
}
