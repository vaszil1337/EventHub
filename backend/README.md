# EventHub Backend (Spring Boot - Hexagonal Architecture)

Ez a modul az **EventHub** backend szolgáltatása, amely a **Hexagonális Architektúra (Ports & Adapters)** és a **Domain-Driven Design (DDD)** irányelveit követi.

---

## 🎯 Alkalmazott Technológiai Stack
- **Framework**: Spring Boot 3.4 / 4.x
- **Language**: Java 21 LTS
- **Build Tool**: Maven (`pom.xml`) & Gradle (`build.gradle`)
- **Security**: Spring Security + HS256 JWT (`HmacJwtTokenProviderAdapter`) + BCrypt (`BCryptPasswordHasherAdapter`)
- **Database**: **KIZÁRÓLAG PostgreSQL** (minden környezetben és minden esetben kizárólag a PostgreSQL 16 az adatbázis)
- **Database Migrations**: Flyway SQL migrációk (`src/main/resources/db/migration/`, `V1` – `V4`)
- **Email Gateway**: Spring Mail (`JavaMailSender`) + Mailpit SMTP (`EmailNotificationPort`)
- **Architectural Paradigm**: Hexagonal Architecture (Ports & Adapters) & DDD

---

## 🏛️ Megvalósított Hexagonális Csomagszerkezet

```text
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
    │   │   │   │   ├── AccessDeniedException.java       # Jogosultság hiánya (403 Forbidden)
    │   │   │   │   ├── AuthenticationException.java     # Sikertelen autentikáció (401 Unauthorized)
    │   │   │   │   ├── CapacityExceededException.java   # Kapacitáskorlát átlépése (409 Conflict)
    │   │   │   │   ├── EmailDeliveryException.java      # Külső e-mail szolgáltató hiba
    │   │   │   │   ├── EventNotFoundException.java      # Esemény nem található (404 Not Found)
    │   │   │   │   ├── InvalidBookingException.java     # Érvénytelen foglalás / lezárult esemény (400 Bad Request)
    │   │   │   │   ├── TicketNotFoundException.java     # Jegy nem található (404 Not Found)
    │   │   │   │   └── UserAlreadyExistsException.java  # Már regisztrált e-mail cím (409 Conflict)
    │   │   │   │
    │   │   │   └── model/
    │   │   │       ├── Capacity.java                    # Value Object: maxSeats, soldSeats, foglaltsági arány
    │   │   │       ├── EmailDeliveryStatus.java         # Enum: SENT, FAILED_PENDING_RETRY
    │   │   │       ├── Event.java                       # Aggregate Root: kétnyelvű adatok, kapacitás- és jegytípus-kezelés
    │   │   │       ├── EventId.java                     # Value Object: esemény azonosító
    │   │   │       ├── EventRepository.java             # Kimenő port interfész eseményekhez
    │   │   │       ├── EventSnapshot.java               # Immutábilis állapot pillanatkép
    │   │   │       ├── Money.java                       # Value Object: BigDecimal amount, String currency
    │   │   │       ├── PricingRule.java                 # Enum & árazási stratégia (EARLY_BIRD, STANDARD, DYNAMIC_SURGE, VIP, FIXED)
    │   │   │       ├── Ticket.java                      # Domain entitás (jegy állapota, lemondás, e-mail státusz)
    │   │   │       ├── TicketCode.java                  # Value Object: EVT-YYYY-XXXX formátum
    │   │   │       ├── TicketCodeGenerator.java         # Kimenő port interfész kódgeneráláshoz
    │   │   │       ├── TicketId.java                    # Value Object: jegy azonosító
    │   │   │       ├── TicketRepository.java            # Kimenő port interfész jegyekhez
    │   │   │       ├── TicketSnapshot.java              # Immutábilis jegy pillanatkép
    │   │   │       ├── TicketStatus.java                # Enum: VALID, CANCELLED
    │   │   │       ├── TicketType.java                  # Domain entitás: jegykategória kvóta és dinamikus ár
    │   │   │       ├── TicketTypeId.java                # Value Object: jegytípus azonosító
    │   │   │       ├── User.java                        # Domain entitás: felhasználó és szerepkör
    │   │   │       ├── UserId.java                      # Value Object: felhasználó azonosító
    │   │   │       ├── UserRepository.java              # Kimenő port interfész felhasználókhoz
    │   │   │       ├── UserRole.java                    # Enum: ORGANIZER, PARTICIPANT
    │   │   │       ├── Venue.java                       # Domain modell: helyszín név, cím, kapacitás
    │   │   │       └── VenueId.java                     # Value Object: helyszín azonosító
    │   │   │
    │   │   ├── application/                             # 2. HASZNÁLATI ESETEK (Use Cases & Application Services)
    │   │   │   ├── port/
    │   │   │   │   ├── in/
    │   │   │   │   │   ├── AddTicketTypeCommand.java
    │   │   │   │   │   ├── AddTicketTypeUseCase.java
    │   │   │   │   │   ├── AuthResult.java
    │   │   │   │   │   ├── AuthUseCase.java
    │   │   │   │   │   ├── BookTicketCommand.java
    │   │   │   │   │   ├── BookTicketUseCase.java
    │   │   │   │   │   ├── CancelTicketUseCase.java
    │   │   │   │   │   ├── CreateEventCommand.java
    │   │   │   │   │   ├── CreateEventUseCase.java
    │   │   │   │   │   ├── GetEventByIdUseCase.java
    │   │   │   │   │   ├── GetEventsUseCase.java
    │   │   │   │   │   ├── GetTicketsUseCase.java
    │   │   │   │   │   ├── LoginUserCommand.java
    │   │   │   │   │   ├── RegisterUserCommand.java
    │   │   │   │   │   ├── ResetEventsUseCase.java
    │   │   │   │   │   ├── UpdateEventCommand.java
    │   │   │   │   │   └── UpdateEventUseCase.java
    │   │   │   │   └── out/
    │   │   │   │       ├── AuthenticatedPrincipal.java
    │   │   │   │       ├── EmailNotificationPort.java
    │   │   │   │       ├── PasswordHasherPort.java
    │   │   │   │       └── TokenProviderPort.java
    │   │   │   │
    │   │   │   └── service/                             # Pure POJO implementációk
    │   │   │       ├── AddTicketTypeService.java
    │   │   │       ├── AuthService.java
    │   │   │       ├── BookTicketService.java           # Foglalás, múltbeli esemény ellenőrzés, dinamikus ár & e-mail
    │   │   │       ├── CancelTicketService.java         # Lemondás, múltbeli esemény tiltás & kapacitás felszabadítás
    │   │   │       ├── CreateEventService.java          # Esemény létrehozása starter jegytípusokkal
    │   │   │       ├── GetEventsService.java
    │   │   │       ├── GetTicketsService.java
    │   │   │       ├── ResetEventsService.java
    │   │   │       └── UpdateEventService.java          # Esemény módosítása kapacitás-invariáns védelemmel
    │   │   │
    │   │   └── infrastructure/                          # 3. KÜLSŐ ADAPTEREK (Framework, Web, Persistence, Security, Mail)
    │   │       ├── configuration/
    │   │       │   ├── DefaultTicketCodeGenerator.java  # Kódgenerátor megvalósítás
    │   │       │   ├── EventHubUseCaseConfiguration.java# TransactionTemplate & UseCase Bean konfiguráció
    │   │       │   └── WebCorsConfiguration.java        # CORS beállítás (localhost:5173 engedélyezése)
    │   │       │
    │   │       ├── notification/
    │   │       │   └── SmtpEmailNotificationAdapter.java# Kétnyelvű (HU/EN) HTML + Plain Text SMTP e-mail küldő
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
    │   │       ├── presentation/web/                    # Bemenő REST Adapter
    │   │       │   ├── AddTicketTypeRequest.java
    │   │       │   ├── ApiErrorResponse.java
    │   │       │   ├── AuthController.java
    │   │       │   ├── AuthResponse.java
    │   │       │   ├── BookingRequest.java
    │   │       │   ├── CreateEventRequest.java
    │   │       │   ├── EventController.java
    │   │       │   ├── EventHubExceptionHandler.java
    │   │       │   ├── EventResponse.java
    │   │       │   ├── EventResponseMapper.java
    │   │       │   ├── LoginRequest.java
    │   │       │   ├── PriceResponse.java
    │   │       │   ├── RegisterRequest.java
    │   │       │   ├── TicketController.java
    │   │       │   ├── TicketResponse.java
    │   │       │   ├── TicketResponseMapper.java
    │   │       │   ├── TicketTypeResponse.java
    │   │       │   ├── UpdateEventRequest.java
    │   │       │   ├── UserResponse.java
    │   │       │   └── VenueResponse.java
    │   │       │
    │   │       └── security/                            # Spring Security & JWT Adapter
    │   │           ├── BCryptPasswordHasherAdapter.java
    │   │           ├── HmacJwtTokenProviderAdapter.java
    │   │           ├── JwtAuthenticationFilter.java
    │   │           └── SecurityConfiguration.java
    │   │
    │   └── resources/
    │       ├── application.properties
    │       └── db/migration/                            # Verziózott Flyway SQL migrációk
    │           ├── V1__create_venues_and_events.sql
    │           ├── V2__create_tickets.sql
    │           ├── V3__seed_initial_events.sql
    │           └── V4__add_bilingual_event_fields.sql
    │
    └── test/java/hu/eventhub/                           # 51 / 51 PASS (11 tesztosztály)
        ├── domain/model/
        │   ├── CapacityValueObjectTest.java
        │   ├── EventCapacityTest.java
        │   ├── PricingRuleTest.java
        │   └── TicketCodeTest.java
        ├── application/service/
        │   ├── AddTicketTypeServiceTest.java
        │   ├── AuthServiceTest.java
        │   ├── BookTicketServiceTest.java
        │   ├── CreateEventServiceTest.java
        │   └── UpdateEventServiceTest.java
        └── infrastructure/
            ├── notification/SmtpEmailNotificationAdapterTest.java
            └── presentation/web/EventControllerIntegrationTest.java
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
Amikor egy látogató vagy felhasználó jegyet foglal a felületen (`POST /api/tickets/book`), az alkalmazás a **Hexagonális Architektúra** elveit követve az `EmailNotificationPort` kimenő porton és az `SmtpEmailNotificationAdapter`-en keresztül valós SMTP levelet küld a helyi Mailpit szerverre a választott nyelven (`hu` vagy `en`).

1. Nyisd meg a böngésződben: **`http://localhost:8025`**
2. Vásárolj egy jegyet a weboldalon (vendégként vagy bejelentkezve)
3. A Mailpit webes postaládájában azonnal megjelenik a beérkezett visszaigazolás:
   - Reszponzív HTML dizájn EventHub arculattal (magyar vagy angol nyelven)
   - Esemény címe, időpontja, helyszíne
   - Kiválasztott jegytípus és dinamikusan kalkulált ár
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
| `GET` | `/api/events` | Összes esemény listázása (kétnyelvű adatokkal, jegytípusokkal és dinamikus árakkal) | `200 OK` | - |
| `GET` | `/api/events/{id}` | Egyedi esemény lekérése | `200 OK` | `404 Not Found` |
| `PUT` | `/api/events/{id}` | Esemény adatainak szerkesztése (`ORGANIZER` JWT token kötelező) | `200 OK` | `403 Forbidden`, `404 Not Found`, `400 Bad Request` |
| `POST` | `/api/events` | Új esemény létrehozása (`ORGANIZER` JWT token kötelező) | `201 Created` | `403 Forbidden`, `400 Bad Request` |
| `POST` | `/api/events/{id}/ticket-types` | Új jegytípus hozzáadása eseményhez (`ORGANIZER` JWT token) | `201 Created` | `403 Forbidden`, `404 Not Found` |
| `POST` | `/api/events/reset` | Események és jegyek alaphelyzetbe állítása | `200 OK` | - |
| `POST` | `/api/tickets/book` | Jegy foglalása (kapacitás-, kvóta- és múltbeli dátum ellenőrzés, dinamikus ár & e-mail) | `201 Created` | `409 Conflict` (teltház), `400 Bad Request` (lezárult esemény / hibás adat) |
| `POST` | `/api/tickets/{ticketId}/cancel` | Jegyrendelés lemondása és kapacitás felszabadítása (múltbeli eseményre tiltott) | `200 OK` | `404 Not Found`, `400 Bad Request` (már lezárult esemény / már lemondott jegy) |
| `GET` | `/api/tickets` | Megvásárolt jegyek listája (opcionális `?email=` szűréssel) | `200 OK` | - |
| `GET` | `/api/tickets/event/{eventId}` | Adott eseményhez tartozó jegyek | `200 OK` | - |
