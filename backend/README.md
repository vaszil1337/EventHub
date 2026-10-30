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
    │   │       ├── persistence/                         # Kimenő PostgreSQL perzisztencia adapterek
    │   │       │   ├── jpa/
    │   │       │   │   ├── EventJpaEntity.java
    │   │       │   │   ├── TicketTypeJpaEntity.java
    │   │       │   │   ├── TicketJpaEntity.java
    │   │       │   │   ├── UserJpaEntity.java
    │   │       │   │   ├── EventSpringDataRepository.java
    │   │       │   │   ├── TicketTypeSpringDataRepository.java
    │   │       │   │   ├── TicketSpringDataRepository.java
    │   │       │   │   ├── UserSpringDataRepository.java
    │   │       │   │   ├── EventPersistenceMapper.java
    │   │       │   │   ├── TicketPersistenceMapper.java
    │   │       │   │   ├── UserPersistenceMapper.java
    │   │       │   │   ├── JpaEventRepositoryAdapter.java
    │   │       │   │   ├── JpaTicketRepositoryAdapter.java
    │   │       │   │   └── JpaUserRepositoryAdapter.java
    │   │       │   │
    │   │       │   ├── DatabaseSeeder.java
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

### 1. PostgreSQL Adatbázis és Mailpit SMTP Szerver Indítása Dockerrel
A projekt gyökerében található `docker-compose.yml` elindítja a PostgreSQL adatbázist és a helyi Mailpit teszt email környezetet:
- **PostgreSQL**: `localhost:5432` (`eventhub` adatbázis, `postgres`/`postgres`)
- **Mailpit SMTP**: `localhost:1025` (ezen a porton keresztül küldi a Spring Boot az e-maileket)
- **Mailpit Web UI**: `http://localhost:8025` (böngészőben azonnal megtekinthetők a kiküldött jegy-visszaigazoló levelek)

```bash
docker compose up -d
```

A konténerek leállítása:
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

## 📬 E-mail Értesítések Megtekintése (Mailpit)
Amikor egy látogató vagy felhasználó jegyet foglal a felületen (`POST /api/tickets/book`), az alkalmazás a **Hexagonális Architektúra** elveit követve az `EmailNotificationPort` kimenő porton és az `SmtpEmailNotificationAdapter`-en keresztül valós SMTP levelet küld a helyi Mailpit szerverre.

1. Nyisd meg a böngésződben: **`http://localhost:8025`**
2. Vásárolj egy jegyet a weboldalon (vendégként vagy bejelentkezve)
3. A Mailpit webes postaládájában azonnal megjelenik a beérkezett visszaigazolás:
   - Reszponzív HTML dizájn EventHub arculattal
   - Esemény címe, időpontja, helyszíne
   - Kiválasztott jegytípus és ár
   - Kiemelt, másolható **egyedi jegykód (`EVT-YYYY-XXXX`)**
   - Plain Text alternatíva egyszerű levelezőkliensekhez
   - Reziliens hibatűrés: ha az e-mail szolgáltatás elérhetetlen, a jegy `FAILED_PENDING_RETRY` státusszal mentődik el a tranzakció elvesztése nélkül

---

## 📡 REST Végpontok

| Metódus | Útvonal | Leírás | Siker Kód | Hiba Kód |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Felhasználó regisztráció + HS256 JWT token kiadás | `201 Created` | `409 Conflict`, `400 Bad Request` |
| `POST` | `/api/auth/login` | Bejelentkezés + HS256 JWT token kiadás | `200 OK` | `401 Unauthorized` |
| `GET` | `/api/auth/me` | Aktuális bejelentkezett profil (`Authorization: Bearer <jwt>`) | `200 OK` | `401 Unauthorized` |
| `GET` | `/api/events` | Összes esemény listázása (jegytípusokkal és dinamikus árakkal) | `200 OK` | - |
| `GET` | `/api/events/{id}` | Egyedi esemény lekérése | `200 OK` | `404 Not Found` |
| `PUT` | `/api/events/{id}` | Esemény adatainak szerkesztése (`ORGANIZER` JWT token kötelező) | `200 OK` | `403 Forbidden`, `404 Not Found`, `400 Bad Request` |
| `POST` | `/api/events` | Új esemény létrehozása (`ORGANIZER` JWT token kötelező) | `201 Created` | `403 Forbidden`, `400 Bad Request` |
| `POST` | `/api/events/{id}/ticket-types` | Új jegytípus hozzáadása eseményhez (`ORGANIZER` JWT token) | `201 Created` | `403 Forbidden`, `404 Not Found` |
| `POST` | `/api/events/reset` | Események és jegyek alaphelyzetbe állítása | `200 OK` | - |
| `POST` | `/api/tickets/book` | Jegy foglalása (jegytípus, dinamikus ár & e-mail értesítés) | `201 Created` | `409 Conflict` (teltház), `400 Bad Request` |
| `POST` | `/api/tickets/{ticketId}/cancel` | Jegyrendelés lemondása és kapacitás felszabadítása | `200 OK` | `404 Not Found`, `400 Bad Request` |
| `GET` | `/api/tickets` | Megvásárolt jegyek listája (opcionális `?email=` szűréssel) | `200 OK` | - |
| `GET` | `/api/tickets/event/{eventId}` | Adott eseményhez tartozó jegyek | `200 OK` | - |
