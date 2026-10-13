package hu.eventhub.infrastructure.presentation.web;

import hu.eventhub.application.service.BookTicketService;
import hu.eventhub.application.service.GetEventsService;
import hu.eventhub.application.service.GetTicketsService;
import hu.eventhub.application.service.ResetEventsService;
import hu.eventhub.domain.model.TicketCodeGenerator;
import hu.eventhub.infrastructure.configuration.DefaultTicketCodeGenerator;
import hu.eventhub.infrastructure.persistence.InMemoryEventRepository;
import hu.eventhub.infrastructure.persistence.InMemoryTicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class EventControllerIntegrationTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        InMemoryEventRepository eventRepository = new InMemoryEventRepository();
        InMemoryTicketRepository ticketRepository = new InMemoryTicketRepository();
        Clock fixedClock = Clock.fixed(Instant.parse("2026-10-13T10:00:00Z"), ZoneOffset.UTC);
        TicketCodeGenerator codeGenerator = new DefaultTicketCodeGenerator(fixedClock);

        BookTicketService bookTicketService = new BookTicketService(eventRepository, ticketRepository, codeGenerator, fixedClock);
        GetEventsService getEventsService = new GetEventsService(eventRepository);
        GetTicketsService getTicketsService = new GetTicketsService(ticketRepository);
        ResetEventsService resetEventsService = new ResetEventsService(eventRepository, ticketRepository);

        EventController eventController = new EventController(getEventsService, getEventsService, resetEventsService);
        TicketController ticketController = new TicketController(bookTicketService, getTicketsService);

        mockMvc = MockMvcBuilders.standaloneSetup(eventController, ticketController)
                .setControllerAdvice(new EventHubExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/events should return 3 seed events")
    void shouldReturnAllEvents() throws Exception {
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].id", notNullValue()))
                .andExpect(jsonPath("$[0].venue.name", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/events/{id} should return specific event")
    void shouldReturnEventById() throws Exception {
        mockMvc.perform(get("/api/events/evt-tech-summit-2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is("evt-tech-summit-2026")))
                .andExpect(jsonPath("$.title", is("Tech Horizons Summit 2026")))
                .andExpect(jsonPath("$.venue.capacity", is(100)));
    }

    @Test
    @DisplayName("GET /api/events/{id} with unknown ID should return 404")
    void shouldReturn404ForUnknownEvent() throws Exception {
        mockMvc.perform(get("/api/events/unknown-event-id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", containsString("does not exist")));
    }

    @Test
    @DisplayName("POST /api/tickets/book for available event should return 201 Created")
    void shouldBookTicketSuccessfully() throws Exception {
        String bookingJson = """
                {
                    "eventId": "evt-jazz-night-2026",
                    "participantName": "Miles Davis",
                    "participantEmail": "miles@jazz.com"
                }
                """;

        mockMvc.perform(post("/api/tickets/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ticketCode", matchesPattern("^EVT-\\d{4}-[A-Z0-9]{4}$")))
                .andExpect(jsonPath("$.participantName", is("Miles Davis")))
                .andExpect(jsonPath("$.participantEmail", is("miles@jazz.com")));
    }

    @Test
    @DisplayName("POST /api/tickets/book for fully booked event should return 409 Conflict")
    void shouldReturn409ForFullyBookedEvent() throws Exception {
        String bookingJson = """
                {
                    "eventId": "evt-ai-masterclass-2026",
                    "participantName": "Desperate Student",
                    "participantEmail": "student@university.edu"
                }
                """;

        mockMvc.perform(post("/api/tickets/book")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.message", containsString("fully booked")));
    }

    @Test
    @DisplayName("GET /api/tickets should return list of purchased tickets")
    void shouldReturnTickets() throws Exception {
        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
