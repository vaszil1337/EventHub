# EventHub Backend (Spring Boot - Hexagonal Architecture)

Ez a modul az **EventHub** backend szolgáltatása, amely a **Hexagonális Architektúra (Ports & Adapters)** és a **Domain-Driven Design (DDD)** irányelveit követi.

---

## 🎯 Alkalmazott Technológiai Stack
- **Framework**: Spring Boot 3.x / 4.x
- **Language**: Java 21 LTS
- **Build Tool**: Maven (`pom.xml`) & Gradle (`build.gradle`)
- **Database**: **KIZÁRÓLAG PostgreSQL** (minden környezetben és minden esetben kizárólag a PostgreSQL az adatbázis)
- **Database Migrations**: Flyway SQL migrációk (`src/main/resources/db/migration/`)
- **Architectural Paradigm**: Hexagonal Architecture (Ports & Adapters)

---

## 🏛️ Megvalósított Hexagonális Csomagszerkezet

```
backend/
├── pom.xml
├── build.gradle
└── src/
    ├── main/
    │   ├── java/hu/eventhub/
    │   │   ├── EventHubBackendApplication.java
    │   │   │
    │   │   ├── domain/                                  # 1. BELSŐ DOMAIN MAG (Pure Java, 0 keretrendszer függőség)
    │   │   │   ├── exception/
    │   │   │   │   ├── CapacityExceededException.java   # Kapacitáskorlát átlépése
    │   │   │   │   ├── EventNotFoundException.java      # Esemény nem található
    │   │   │   │   └── InvalidBookingException.java     # Érvénytelen foglalási adatok
    │   │   │   │
    │   │   │   └── model/
    │   │   │       ├── Money.java                       # Value Object: amount, currency
    │   │   │       ├── VenueId.java                     # Value Object: helyszín azonosító
    │   │   │       ├── Venue.java                       # Domain modell: név, cím, kapacitás
    │   │   │       ├── EventId.java                     # Value Object: esemény azonosító
    │   │   │       ├── Event.java                       # Aggregate Root: kapacitás- és jegykezelés
    │   │   │       ├── EventSnapshot.java               # Immutábilis állapot pillanatkép
    │   │   │       ├── TicketId.java                    # Value Object: jegy azonosító
    │   │   │       ├── TicketCode.java                  # Value Object: EVT-YYYY-XXXX formátum
    │   │   │       ├── Ticket.java                      # Domain entitás
    │   │   │       ├── TicketSnapshot.java              # Jegy állapot pillanatkép
    │   │   │       ├── EventRepository.java             # Kimenő port interfész
    │   │   │       ├── TicketRepository.java            # Kimenő port interfész
    │   │   │       └── TicketCodeGenerator.java         # Kimenő port interfész
    │   │   │
    │   │   ├── application/                             # 2. HASZNÁLATI ESETEK (Use Cases & Application Services)
    │   │   │   ├── port/
    │   │   │   │   └── in/
    │   │   │   │       ├── BookTicketUseCase.java       # Jegyfoglalás bemenő port
    │   │   │   │       ├── BookTicketCommand.java       # Jegyfoglalás parancs
    │   │   │   │       ├── GetEventsUseCase.java        # Események lekérése
    │   │   │   │       ├── GetEventByIdUseCase.java     # Egyedi esemény lekérése
    │   │   │   │       ├── GetTicketsUseCase.java       # Jegyek lekérése
    │   │   │   │       └── ResetEventsUseCase.java      # Mintaadatok visszaállítása
    │   │   │   │
    │   │   │   └── service/                             # Pure POJO implementációk
    │   │   │       ├── BookTicketService.java
    │   │   │       ├── GetEventsService.java
    │   │   │       ├── GetTicketsService.java
    │   │   │       └── ResetEventsService.java
    │   │   │
    │   │   └── infrastructure/                          # 3. KÜLSŐ ADAPTEREK (Framework, Web, Persistence)
    │   │       ├── configuration/
    │   │       │   ├── EventHubUseCaseConfiguration.java # TransactionTemplate & Bean konfiguráció
    │   │       │   ├── DefaultTicketCodeGenerator.java   # Kódgenerátor megvalósítás
    │   │       │   └── WebCorsConfiguration.java        # CORS beállítás (localhost:5173 engedélyezése)
    │   │       │
    │   │       ├── persistence/                         # Kimenő perzisztencia adapterek
    │   │       │   ├── jpa/
    │   │       │   │   ├── EventJpaEntity.java
    │   │       │   │   ├── TicketJpaEntity.java
    │   │       │   │   ├── EventSpringDataRepository.java
    │   │       │   │   ├── TicketSpringDataRepository.java
    │   │       │   │   ├── EventPersistenceMapper.java
    │   │       │   │   ├── TicketPersistenceMapper.java
    │   │       │   │   ├── JpaEventRepositoryAdapter.java
    │   │       │   │   └── JpaTicketRepositoryAdapter.java
    │   │       │   │
    │   │       │   ├── InMemoryEventRepository.java
    │   │       │   │── InMemoryTicketRepository.java
    │   │       │   └── SampleEventData.java
    │   │       │
    │   │       └── presentation/web/                    # Bemenő REST Adapter
    │   │           ├── ApiErrorResponse.java
    │   │           ├── BookingRequest.java
    │   │           ├── EventResponse.java
    │   │           ├── VenueResponse.java
    │   │           ├── PriceResponse.java
    │   │           ├── TicketResponse.java
    │   │           ├── EventController.java
    │   │           ├── TicketController.java
    │   │           ├── EventHubExceptionHandler.java
    │   │           ├── EventResponseMapper.java
    │   │           └── TicketResponseMapper.java
    │   │
    │   └── resources/
    │       ├── application.properties
    │       └── db/migration/                            # Verziózott SQL migrációk
    │           ├── V1__create_venues_and_events.sql
    │           ├── V2__create_tickets.sql
    │           └── V3__seed_initial_events.sql
    │
    └── test/java/hu/eventhub/
        ├── domain/model/EventCapacityTest.java
        ├── domain/model/TicketCodeTest.java
        ├── application/service/BookTicketServiceTest.java
        └── infrastructure/presentation/web/EventControllerIntegrationTest.java
```

---

## 🚀 Indítás és Futtatás

### 1. PostgreSQL Adatbázis Indítása Dockerrel
A projekt gyökerében található `docker-compose.yml` indítja a dedikált PostgreSQL konténert az elvárt konfigurációval (`eventhub` adatbázis, `postgres`/`postgres` felhasználó, `5432`-es port):
```bash
docker compose up -d
```

A konténer leállítása:
```bash
docker compose down
```

### 2. Backend Tesztek Futtatása
```bash
cd backend
mvn test
```

### 3. Backend Szerver Indítása (Port: 8080)
```bash
cd backend
mvn spring-boot:run
```

A backend kizárólag PostgreSQL adatbázissal működik (alapértelmezett: `localhost:5432/eventhub`, `postgres`/`postgres`). Eltérő környezet esetén a paraméterek környezeti változókkal felülbírálhatók:
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/eventhub
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
mvn spring-boot:run
```

---

## 📡 REST Végpontok

| Metódus | Útvonal | Leírás | Siker Kód | Hiba Kód |
|---|---|---|---|---|
| `GET` | `/api/events` | Összes esemény listázása (jegytípusokkal és dinamikus árakkal) | `200 OK` | - |
| `GET` | `/api/events/{id}` | Egyedi esemény lekérése | `200 OK` | `404 Not Found` |
| `POST` | `/api/events` | Új esemény létrehozása (`X-User-Role: ORGANIZER` kötelező) | `201 Created` | `403 Forbidden`, `400 Bad Request` |
| `POST` | `/api/events/{id}/ticket-types` | Új jegytípus hozzáadása eseményhez (`X-User-Role: ORGANIZER`) | `201 Created` | `403 Forbidden`, `404 Not Found` |
| `POST` | `/api/events/reset` | Események és jegyek alaphelyzetbe állítása | `200 OK` | - |
| `POST` | `/api/tickets/book` | Jegy foglalása (jegytípus, dinamikus ár & e-mail értesítés) | `201 Created` | `409 Conflict` (teltház), `400 Bad Request` |
| `POST` | `/api/tickets/{ticketId}/cancel` | Jegyrendelés lemondása és kapacitás felszabadítása | `200 OK` | `404 Not Found`, `400 Bad Request` |
| `GET` | `/api/tickets` | Megvásárolt jegyek listája (opcionális `?email=` szűréssel) | `200 OK` | - |
| `GET` | `/api/tickets/event/{eventId}` | Adott eseményhez tartozó jegyek | `200 OK` | - |
