package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.application.port.in.BookTicketCommand;
import hu.eventhub.application.port.in.BookTicketUseCase;
import hu.eventhub.application.port.in.CancelTicketUseCase;
import hu.eventhub.application.port.in.GetTicketsUseCase;
import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.Ticket;
import hu.eventhub.domain.model.TicketId;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final CancelTicketUseCase cancelTicketUseCase;

    @Autowired
    public TicketController(
            BookTicketUseCase bookTicketUseCase,
            GetTicketsUseCase getTicketsUseCase,
            CancelTicketUseCase cancelTicketUseCase
    ) {
        this.bookTicketUseCase = Objects.requireNonNull(bookTicketUseCase, "bookTicketUseCase cannot be null");
        this.getTicketsUseCase = Objects.requireNonNull(getTicketsUseCase, "getTicketsUseCase cannot be null");
        this.cancelTicketUseCase = cancelTicketUseCase;
    }

    public TicketController(BookTicketUseCase bookTicketUseCase, GetTicketsUseCase getTicketsUseCase) {
        this(bookTicketUseCase, getTicketsUseCase, null);
    }

    @PostMapping("/book")
    public ResponseEntity<TicketResponse> bookTicket(@RequestBody BookingRequest request) {
        BookTicketCommand command = new BookTicketCommand(
                request.eventId(),
                request.participantName(),
                request.participantEmail(),
                request.ticketTypeId()
        );
        Ticket bookedTicket = bookTicketUseCase.bookTicket(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TicketResponseMapper.toResponse(bookedTicket));
    }

    @PostMapping("/{ticketId}/cancel")
    public ResponseEntity<TicketResponse> cancelTicket(@PathVariable("ticketId") String ticketId) {
        if (cancelTicketUseCase == null) {
            throw new IllegalStateException("CancelTicketUseCase is not configured");
        }
        Ticket cancelledTicket = cancelTicketUseCase.cancelTicket(TicketId.of(ticketId));
        return ResponseEntity.ok(TicketResponseMapper.toResponse(cancelledTicket));
    }

    @GetMapping
    public List<TicketResponse> getAllTickets(
            @RequestParam(value = "email", required = false) String email
    ) {
        List<Ticket> tickets = (email != null && !email.isBlank())
                ? getTicketsUseCase.getTicketsByParticipantEmail(email)
                : getTicketsUseCase.getAllTickets();
        return tickets.stream()
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
