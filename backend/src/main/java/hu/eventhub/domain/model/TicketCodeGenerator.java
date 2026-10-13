package hu.eventhub.domain.model;

@FunctionalInterface
public interface TicketCodeGenerator {
    TicketCode generate();
}
