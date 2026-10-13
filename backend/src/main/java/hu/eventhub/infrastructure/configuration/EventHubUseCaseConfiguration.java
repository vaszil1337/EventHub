package hu.eventhub.infrastructure.configuration;

import hu.eventhub.application.port.in.*;
import hu.eventhub.application.service.*;
import hu.eventhub.domain.model.EventRepository;
import hu.eventhub.domain.model.TicketCodeGenerator;
import hu.eventhub.domain.model.TicketRepository;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Clock;

@Configuration
public class EventHubUseCaseConfiguration {

    @Bean
    Clock utcClock() {
        return Clock.systemUTC();
    }

    @Bean
    TicketCodeGenerator ticketCodeGenerator(Clock clock) {
        return new DefaultTicketCodeGenerator(clock);
    }

    @Bean
    BookTicketUseCase bookTicketUseCase(
            EventRepository eventRepository,
            TicketRepository ticketRepository,
            TicketCodeGenerator ticketCodeGenerator,
            Clock clock,
            ObjectProvider<PlatformTransactionManager> transactionManagerProvider) {
        BookTicketService service = new BookTicketService(eventRepository, ticketRepository, ticketCodeGenerator, clock);
        PlatformTransactionManager transactionManager = transactionManagerProvider.getIfAvailable();
        if (transactionManager == null) {
            return service;
        }
        TransactionTemplate transaction = new TransactionTemplate(transactionManager);
        return command -> transaction.execute(status -> service.bookTicket(command));
    }

    @Bean
    GetEventsUseCase getEventsUseCase(EventRepository eventRepository) {
        return new GetEventsService(eventRepository);
    }

    @Bean
    GetEventByIdUseCase getEventByIdUseCase(EventRepository eventRepository) {
        return new GetEventsService(eventRepository);
    }

    @Bean
    GetTicketsUseCase getTicketsUseCase(TicketRepository ticketRepository) {
        return new GetTicketsService(ticketRepository);
    }

    @Bean
    ResetEventsUseCase resetEventsUseCase(EventRepository eventRepository, TicketRepository ticketRepository) {
        return new ResetEventsService(eventRepository, ticketRepository);
    }
}
