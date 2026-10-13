# EventHub - 2. Hét (Week 2): Hexagonal Architecture & Domain-Driven Design (DDD)

Ez a dokumentum a 2. heti sprint feladatait, technikai megvalósítását és a Hexagonális (Ports & Adapters) architektúra felépítését részletezi a Spring Boot backendben.

---

## 🎯 2. Hét Célkitűzései

- [x] Java 21 LTS alapú Spring Boot backend inicializálása tiszta **Hexagonális Architektúra (Ports & Adapters)** mintával.
- [x] **Tiszta Domain Réteg (Pure Java)** keretrendszer-független üzleti logikával:
  - Üzleti Aggregátum: `Event` (kapacitáskezelés, foglalás validáció, `hasAvailableSeats()`, `recordBooking()`).
  - Entitás: `Ticket` (jegy adatok, eseménykapcsolat, visszaigazolás).
  - Értékobjektumok (Value Objects): `Money`, `EventId`, `VenueId`, `TicketId`, `TicketCode` (szigorú `EVT-YYYY-XXXX` formátumellenőrzéssel).
  - Domain állapotmentés: `EventSnapshot`, `TicketSnapshot`.
  - Domain kivételek: `CapacityExceededException`, `EventNotFoundException`, `InvalidBookingException`.
  - Kimenő portok (Domain Port Interfaces): `EventRepository`, `TicketRepository`, `TicketCodeGenerator`.
- [x] **Alkalmazási Réteg (Application Layer / Use Cases)**:
  - Bemenő portok: `BookTicketUseCase`, `BookTicketCommand`, `GetEventsUseCase`, `GetEventByIdUseCase`, `GetTicketsUseCase`, `ResetEventsUseCase`.
  - Alkalmazási szolgáltatások (Pure POJO): `BookTicketService`, `GetEventsService`, `GetTicketsService`, `ResetEventsService`.
- [x] **Infrastruktúra Konfiguráció (`infrastructure/configuration`)**:
  - `EventHubUseCaseConfiguration`: A Use Case-ek Spring Bean-ként való regisztrálása, `TransactionTemplate` tranzakciós dekorációval (megegyezve a referencia projekt architektúrájával).
  - `DefaultTicketCodeGenerator`: `EVT-YYYY-XXXX` szabványos jegykód generátor.
  - `WebCorsConfiguration`: CORS támogatás a frontend számára (`http://localhost:5173`).
- [x] **Prezentációs Réteg (REST API & DTO-k)**:
  - `EventController`: `GET /api/events`, `GET /api/events/{id}`, `POST /api/events/reset`.
  - `TicketController`: `POST /api/tickets/book`, `GET /api/tickets`, `GET /api/tickets/event/{eventId}`.
  - `EventHubExceptionHandler`: `@RestControllerAdvice` globális hibakezelő (409 Conflict kapacitástúllépéskor, 404 Not Found, 400 Bad Request).
  - DTO-k és válasz-mapperek: `EventResponse`, `VenueResponse`, `TicketResponse`, `BookingRequest`, `ApiErrorResponse`, `EventResponseMapper`, `TicketResponseMapper`.

---

## 🏛️ Hexagonális Csomagszerkezet

```
backend/src/main/java/hu/eventhub/
├── EventHubBackendApplication.java
│
├── domain/                                 # Belső üzleti mag (100% tiszta Java, 0 Spring dependencia)
│   ├── exception/
│   │   ├── CapacityExceededException.java  # Kapacitáskorlát átlépése (409-es HTTP státusznak felel meg)
│   │   ├── EventNotFoundException.java     # Nem létező esemény (404)
│   │   └── InvalidBookingException.java    # Hibás foglalási adatok (400)
│   │
│   └── model/
│       ├── Money.java                      # Értékobjektum: BigDecimal amount, String currency
│       ├── VenueId.java                    # Erősen típusos azonosító
│       ├── Venue.java                      # Helyszín adatok és maximális kapacitás
│       ├── EventId.java                    # Esemény azonosító
│       ├── Event.java                      # Aggregátum Gyökér (üzleti szabályok, foglaláskezelés)
│       ├── EventSnapshot.java              # Immutábilis állapot pillanatkép a mappeléshez
│       ├── TicketId.java                   # Jegy azonosító
│       ├── TicketCode.java                 # Értékobjektum: EVT-YYYY-XXXX regex validációval
│       ├── Ticket.java                     # Jegy entitás
│       ├── TicketSnapshot.java             # Jegy állapot pillanatkép
│       ├── EventRepository.java            # Kimenő port interfész eseményekhez
│       ├── TicketRepository.java           # Kimenő port interfész jegyekhez
│       └── TicketCodeGenerator.java        # Kimenő port interfész kódgeneráláshoz
│
├── application/                            # Használati esetek (Use Cases) és vezérlés
│   ├── port/
│   │   └── in/
│   │       ├── BookTicketUseCase.java      # Jegyfoglalás port
│   │       ├── BookTicketCommand.java      # Parancs DTO (eventId, név, email)
│   │       ├── GetEventsUseCase.java       # Eseménylista lekérés port
│   │       ├── GetEventByIdUseCase.java    # Egyedi esemény lekérés port
│   │       ├── GetTicketsUseCase.java      # Megvásárolt jegyek lekérése
│   │       └── ResetEventsUseCase.java     # Mintaadatok alaphelyzetbe állítása
│   │
│   └── service/
│       ├── BookTicketService.java          # Jegyfoglalás üzleti folyamata
│       ├── GetEventsService.java           # Eseménylekérdező szolgáltatás
│       ├── GetTicketsService.java          # Jegylekérdező szolgáltatás
│       └── ResetEventsService.java         # Reset szolgáltatás
│
└── infrastructure/                         # Külső adapterek és technikai megvalósítások
    ├── configuration/
    │   ├── EventHubUseCaseConfiguration.java # UseCase bean huzalozás & TransactionTemplate
    │   ├── DefaultTicketCodeGenerator.java   # Kódgenerátor megvalósítás
    │   └── WebCorsConfiguration.java        # CORS beállítások
    │
    └── presentation/web/                   # REST Adapter (Web Controller réteg)
        ├── ApiErrorResponse.java           # Egységes hiba válaszstruktúra
        ├── BookingRequest.java             # Kliens kérés DTO
        ├── EventResponse.java              # Esemény válasz DTO
        ├── VenueResponse.java              # Helyszín válasz DTO
        ├── PriceResponse.java              # Ár válasz DTO
        ├── TicketResponse.java             # Kiállított jegy válasz DTO
        ├── EventController.java            # /api/events végpontok
        ├── TicketController.java           # /api/tickets végpontok
        ├── EventHubExceptionHandler.java   # @RestControllerAdvice hibakezelő
        ├── EventResponseMapper.java        # Domain -> DTO átalakító
        └── TicketResponseMapper.java       # Domain -> DTO átalakító
```

---

## 🔒 Kritikus Üzleti Szabály a Domainben: Kapacitáskorlát

A kapacitáskorlát szigorú betartása az `Event` aggregátumban van egységbe zárva:

```java
public void recordBooking() {
    if (!hasAvailableSeats()) {
        throw new CapacityExceededException(
                String.format("Event \"%s\" is fully booked (%d/%d seats taken). No tickets available.",
                        title, soldTicketsCount, venue.capacity())
        );
    }
    this.soldTicketsCount++;
}
```

Az `infrastructure/configuration/EventHubUseCaseConfiguration` osztályban a `BookTicketUseCase` a `TransactionTemplate`-en keresztül fut, így a kapacitás növelése és a jegy mentése garantáltan egyetlen ACID tranzakcióban hajtódik végre:

```java
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
```

---

## 🧪 Tesztelés

A domain és a use case réteg önmagában, adatbázis és Spring konténer nélkül is villámgyorsan tesztelhető:
- `EventCapacityTest`: Igazolja a teltház és szabad helyek ellenőrzését, valamint a `CapacityExceededException` kiváltását.
- `TicketCodeTest`: Igazolja az `EVT-YYYY-XXXX` formátumot és az érvénytelen kódok elutasítását.
- `BookTicketServiceTest`: Teljes foglalási use-case izolált tesztelése in-memory repository-val.
