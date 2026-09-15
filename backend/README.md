# EventHub Backend (Spring Boot - Domain-Driven Design)

This directory is reserved for the EventHub backend service, scheduled for development in subsequent weeks.

## 🎯 Target Technology Stack
- **Framework**: Spring Boot 3.x
- **Language**: Java 21 LTS
- **Build Tool**: Gradle or Maven
- **Database**: PostgreSQL
- **Database Migrations**: Flyway / Liquibase
- **Architectural Paradigm**: Domain-Driven Design (DDD) & Hexagonal / Clean Architecture

## 🏛️ Planned Domain Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/eventhub/
│   │   │   ├── domain/              # Core business entities & aggregates (Event, Venue, Ticket)
│   │   │   │   ├── model/           # Aggregates, Entities, Value Objects (Money, TicketCode)
│   │   │   │   ├── repository/      # Domain repository interfaces
│   │   │   │   └── exception/       # CapacityExceededException, EventNotFoundException
│   │   │   │
│   │   │   ├── application/         # Use cases & service orchestrations
│   │   │   │   ├── event/           # GetEventsUseCase, GetEventByIdUseCase
│   │   │   │   └── ticket/          # BookTicketUseCase (enforces capacity constraint)
│   │   │   │
│   │   │   └── infrastructure/      # Adapters, persistence, and external interfaces
│   │   │       ├── web/             # REST Controllers (EventController, TicketController)
│   │   │       └── persistence/     # Spring Data JPA repositories & PostgreSQL entity mappings
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/        # Flyway SQL migrations
│   └── test/
```

## 🔄 Transition from Week 1 MVP
During Week 1, the frontend uses an abstracted service layer (`eventService.ts`, `ticketService.ts`) persisting to `localStorage`. Once the Spring Boot backend is developed:
1. REST endpoints matching the frontend contracts (`GET /api/events`, `GET /api/events/{id}`, `POST /api/tickets/book`) will be exposed.
2. The frontend services will simply replace `storage.get/set` with standard `fetch` or `axios` HTTP calls without requiring any modifications to the React UI components or custom hooks.
