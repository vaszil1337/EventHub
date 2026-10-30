package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.application.port.in.BookTicketCommand;
import hu.eventhub.application.port.in.BookTicketUseCase;
import hu.eventhub.application.port.in.CancelTicketUseCase;
import hu.eventhub.application.port.in.GetTicketsUseCase;
import hu.eventhub.application.port.out.AuthenticatedPrincipal;
import hu.eventhub.application.port.out.TokenProviderPort;
import hu.eventhub.domain.exception.AuthenticationException;
import hu.eventhub.domain.model.EventId;
import hu.eventhub.domain.model.Ticket;
import hu.eventhub.domain.model.TicketId;
import hu.eventhub.domain.model.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final BookTicketUseCase bookTicketUseCase;
    private final GetTicketsUseCase getTicketsUseCase;
    private final CancelTicketUseCase cancelTicketUseCase;
    private final TokenProviderPort tokenProvider;

    @Autowired
    public TicketController(
            BookTicketUseCase bookTicketUseCase,
            GetTicketsUseCase getTicketsUseCase,
            CancelTicketUseCase cancelTicketUseCase,
            @Autowired(required = false) TokenProviderPort tokenProvider
    ) {
        this.bookTicketUseCase = Objects.requireNonNull(bookTicketUseCase, "bookTicketUseCase cannot be null");
        this.getTicketsUseCase = Objects.requireNonNull(getTicketsUseCase, "getTicketsUseCase cannot be null");
        this.cancelTicketUseCase = cancelTicketUseCase;
        this.tokenProvider = tokenProvider;
    }

    public TicketController(
            BookTicketUseCase bookTicketUseCase,
            GetTicketsUseCase getTicketsUseCase,
            CancelTicketUseCase cancelTicketUseCase
    ) {
        this(bookTicketUseCase, getTicketsUseCase, cancelTicketUseCase, null);
    }

    public TicketController(BookTicketUseCase bookTicketUseCase, GetTicketsUseCase getTicketsUseCase) {
        this(bookTicketUseCase, getTicketsUseCase, null, null);
    }

    @PostMapping("/book")
    public ResponseEntity<TicketResponse> bookTicket(
            @RequestBody BookingRequest request,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguageHeader
    ) {
        String locale = resolveLocale(request.locale(), acceptLanguageHeader);
        BookTicketCommand command = new BookTicketCommand(
                request.eventId(),
                request.participantName(),
                request.participantEmail(),
                request.ticketTypeId(),
                locale
        );
        Ticket bookedTicket = bookTicketUseCase.bookTicket(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(TicketResponseMapper.toResponse(bookedTicket));
    }

    private String resolveLocale(String requestLocale, String acceptLanguageHeader) {
        if (requestLocale != null && !requestLocale.isBlank()) {
            return requestLocale.trim().toLowerCase();
        }
        if (acceptLanguageHeader != null && !acceptLanguageHeader.isBlank()) {
            String lower = acceptLanguageHeader.trim().toLowerCase();
            if (lower.startsWith("hu") || lower.contains("hu-")) {
                return "hu";
            }
        }
        return "en";
    }

    @PostMapping("/{ticketId}/cancel")
    public ResponseEntity<TicketResponse> cancelTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        if (cancelTicketUseCase == null) {
            throw new IllegalStateException("CancelTicketUseCase is not configured");
        }
        AuthenticatedPrincipal principal = resolvePrincipal(authorizationHeader);
        if (principal == null) {
            throw new AuthenticationException("Authentication required to cancel a ticket. Please log in.");
        }
        Ticket cancelledTicket = cancelTicketUseCase.cancelTicket(TicketId.of(ticketId));
        return ResponseEntity.ok(TicketResponseMapper.toResponse(cancelledTicket));
    }

    @GetMapping
    public List<TicketResponse> getAllTickets(
            @RequestParam(value = "email", required = false) String email,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        AuthenticatedPrincipal principal = resolvePrincipal(authorizationHeader);
        if (principal == null) {
            throw new AuthenticationException("Authentication required to view tickets. Please log in.");
        }

        List<Ticket> tickets;
        if (principal.role() == UserRole.ORGANIZER) {
            tickets = (email != null && !email.isBlank())
                    ? getTicketsUseCase.getTicketsByParticipantEmail(email.trim())
                    : getTicketsUseCase.getAllTickets();
        } else {
            // PARTICIPANT is strictly restricted to their own tickets regardless of client query param
            tickets = getTicketsUseCase.getTicketsByParticipantEmail(principal.email());
        }

        return tickets.stream()
                .map(TicketResponseMapper::toResponse)
                .toList();
    }

    @GetMapping("/event/{eventId}")
    public List<TicketResponse> getTicketsByEventId(
            @PathVariable("eventId") String eventId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader
    ) {
        AuthenticatedPrincipal principal = resolvePrincipal(authorizationHeader);
        if (principal == null || principal.role() != UserRole.ORGANIZER) {
            throw new AuthenticationException("Only authenticated ORGANIZER users can view tickets for a specific event.");
        }
        return getTicketsUseCase.getTicketsByEventId(EventId.of(eventId)).stream()
                .map(TicketResponseMapper::toResponse)
                .toList();
    }

    private AuthenticatedPrincipal resolvePrincipal(String authorizationHeader) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedPrincipal principal) {
            return principal;
        }
        if (tokenProvider != null && authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7).trim();
            return tokenProvider.validateAndExtract(token).orElse(null);
        }
        return null;
    }
}
