package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.application.port.in.BookTicketCommand;
import hu.eventhub.application.port.in.BookTicketUseCase;
import hu.eventhub.application.port.in.GetTicketsUseCase;
import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.Ticket;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final BookTicketUseCase bookTicketUseCase;
    private final GetTicketsUseCase getTicketsUseCase;

    public TicketController(BookTicketUseCase bookTicketUseCase, GetTicketsUseCase getTicketsUseCase) {
        this.bookTicketUseCase = Objects.requireNonNull(bookTicketUseCase, "bookTicketUseCase cannot be null");
        this.getTicketsUseCase = Objects.requireNonNull(getTicketsUseCase, "getTicketsUseCase cannot be null");
    }

    @PostMapping("/book")
    public ResponseEntity<TicketResponse> bookTicket(@RequestBody BookingRequest request) {
        BookTicketCommand command = new BookTicketCommand(
                request.eventId(),
                request.participantName(),
                request.participantEmail()
        );
        Ticket bookedTicket = bookTicketUseCase.bookTicket(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TicketResponseMapper.toResponse(bookedTicket));
    }

    @GetMapping
    public List<TicketResponse> getAllTickets() {
        return getTicketsUseCase.getAllTickets().stream()
                .map(TicketResponseMapper::toResponse)
                .toList();
    }

    @GetMapping("/event/{eventId}")
    public List<TicketResponse> getTicketsByEventId(@PathVariable("eventId") String eventId) {
        return getTicketsUseCase.getTicketsByEventId(EventId.of(eventId)).stream()
                .map(TicketResponseMapper::toResponse)
                .toList();
    }
}
