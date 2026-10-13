# EventHub - 3. Hét (Week 3): Perzisztencia, Migrációk & Teljes Frontend Integráció

Ez a dokumentum a 3. heti sprint feladatait részletezi: a Spring Data JPA relációs perzisztencia kialakítását, a verziózott adatbázis migrációkat, valamint a React frontend és a Spring Boot REST API teljes end-to-end összekötését.

---

## 🎯 3. Hét Célkitűzései

- [x] **Spring Data JPA & Relációs Perzisztencia (Hexagonal Persistence Adapter)**:
  - `EventJpaEntity` és `TicketJpaEntity` JPA entitások.
  - `EventSpringDataRepository` és `TicketSpringDataRepository` interfészek.
  - `EventPersistenceMapper` és `TicketPersistenceMapper` osztályok a Domain modellek és a JPA entitások közötti kétirányú átalakításra.
  - `JpaEventRepositoryAdapter` (implementálja az `EventRepository` domain portot).
  - `JpaTicketRepositoryAdapter` (implementálja a `TicketRepository` domain portot).
  - Gyors in-memory fejlesztői és tesztelési fallback: `InMemoryEventRepository`, `InMemoryTicketRepository`, `SampleEventData`.
- [x] **Verziózott Adatbázis Migrációk (`src/main/resources/db/migration/`)**:
  - `V1__create_venues_and_events.sql`: `events` tábla létrehozása indexekkel és megszorításokkal.
  - `V2__create_tickets.sql`: `tickets` tábla létrehozása idegen kulccsal (`ON DELETE CASCADE`) és egyedi jegykód megszorítással.
  - `V3__seed_initial_events.sql`: Kezdeti mintaadatok betöltése (közte a teltházas 50/50 AI Masterclass eseménnyel).
- [x] **Frontend Service -> Spring Boot REST API Integráció**:
  - `frontend/src/shared/services/apiClient.ts`: Univerzális HTTP kliens hibakezeléssel és konfigurálható bázis URL-lel (`VITE_API_BASE_URL`).
  - `eventService.ts`: Átállítva valódi `GET /api/events`, `GET /api/events/{id}` és `POST /api/events/reset` hívásokra, offline/teszt fallbackkel.
  - `ticketService.ts`: Átállítva valódi `POST /api/tickets/book`, `GET /api/tickets` és `GET /api/tickets/event/{id}` hívásokra.
  - **Szigorú hibafordítás**: A backend 409 Conflict válasza a frontend oldalon közvetlenül `CapacityExceededError` kivételként jelentkezik, kiváltva a piros figyelmeztető MUI Alertet.
  - Vite dev server reverse proxy (`vite.config.ts`): `/api` kérések automatikus továbbítása a `http://localhost:8080`-ra.

---

## 📂 Perzisztencia Architektúra (`infrastructure/persistence`)

A perzisztencia a Hexagonális architektúra külső kimenő adaptere:

```
infrastructure/persistence/
├── jpa/
│   ├── EventJpaEntity.java              # JPA @Entity leképezés az events táblára
│   ├── TicketJpaEntity.java             # JPA @Entity leképezés a tickets táblára
│   ├── EventSpringDataRepository.java   # Spring Data JpaRepository<EventJpaEntity, String>
│   ├── TicketSpringDataRepository.java  # Spring Data JpaRepository<TicketJpaEntity, String>
│   ├── EventPersistenceMapper.java      # Event <-> EventJpaEntity átalakítás
│   ├── TicketPersistenceMapper.java     # Ticket <-> TicketJpaEntity átalakítás
│   ├── JpaEventRepositoryAdapter.java   # EventRepository domain port megvalósítása
│   └── JpaTicketRepositoryAdapter.java  # TicketRepository domain port megvalósítása
│
├── InMemoryEventRepository.java         # Gyors in-memory implementáció
├── InMemoryTicketRepository.java        # Gyors in-memory jegykezelés
└── SampleEventData.java                 # 3 hivatalos mintaesemény
```

### Adatbázis sémák és kapcsolatok

```sql
-- events tábla
CREATE TABLE events (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue_id VARCHAR(100) NOT NULL,
    venue_name VARCHAR(255) NOT NULL,
    venue_address VARCHAR(255) NOT NULL,
    venue_capacity INT NOT NULL,
    sold_tickets_count INT NOT NULL DEFAULT 0,
    price_amount DECIMAL(12, 2) NOT NULL,
    price_currency VARCHAR(10) NOT NULL,
    category VARCHAR(100),
    image_url VARCHAR(1000)
);

-- tickets tábla
CREATE TABLE tickets (
    id VARCHAR(100) PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,
    price_amount DECIMAL(12, 2) NOT NULL,
    price_currency VARCHAR(10) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_tickets_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
```

---

## 🔄 Frontend - Backend Integráció Működése

A frontend komponensek (`BookingDialog`, `EventCard`, `EventsPage`) változatlanok maradtak, mert a Week 1-ben bevezetett szerviz-absztrakció tökéletesen leválasztotta a megjelenítést.

A vásárlási folyamat end-to-end életciklusa:
1. Felhasználó kitölti a `BookingDialog` űrlapját a React felületen.
2. A `ticketService.bookTicket(request)` elküldi a `POST /api/tickets/book` kérést a Spring Boot backendnek.
3. A backend `TicketController` meghívja a `BookTicketUseCase`-t, ami tranzakcióban (`TransactionTemplate`):
   - Lekéri az `Event` aggregátumot az adatbázisból.
   - Meghívja az `event.recordBooking()` üzleti metódust.
   - Ha van szabad hely: növeli `soldTicketsCount`-ot, legenerálja az `EVT-2026-XXXX` kódot, lementi a jegyet és 201 Created válasszal visszatér.
   - Ha teltház van: `CapacityExceededException`-t dob, amit az `EventHubExceptionHandler` 409 Conflict státuszú JSON hibává formáz.
4. A frontend fogadja a 409-es választ, példányosítja a `CapacityExceededError`-t, és azonnal megjeleníti a piros MUI Alert figyelmeztetést a felhasználónak.

---

## 🧪 Ellenőrzés és Teszteredmények

### 1. Backend Tesztcsomag (`backend/` -> `mvn test -o`)
- **15 / 15 PASS (100%)**
  - `BookTicketServiceTest` (3 teszt)
  - `EventControllerIntegrationTest` (6 teszt MockMvc-vel)
  - `EventCapacityTest` (3 teszt)
  - `TicketCodeTest` (3 teszt)

### 2. Frontend Tesztcsomag (`frontend/` -> `npm run test:run`)
- **14 / 14 PASS (100%)**
  - `ticketService.test.ts` (6 teszt)
  - `BookingDialog.test.tsx` (4 teszt)
  - `App.test.tsx` (4 integrációs teszt)

### 3. Frontend Produkciós Build (`frontend/` -> `npm run build`)
- **Sikeres build**: TypeScript fordítás és Vite optimalizált bundle elkészült (`dist/`).
