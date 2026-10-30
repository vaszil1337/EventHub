package hu.eventhub.application.port.out;

import hu.eventhub.domain.model.Event;
import hu.eventhub.domain.model.Ticket;

/**
 * Outbound port for sending ticket confirmation notifications via an external email service.
 */
public interface EmailNotificationPort {

    default void sendTicketConfirmation(Ticket ticket, Event event) {
        sendTicketConfirmation(ticket, event, "en");
    }

    void sendTicketConfirmation(Ticket ticket, Event event, String locale);
}
