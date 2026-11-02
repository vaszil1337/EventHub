# EventHub - Fő Rendszerarchitektúra és Tervezési Dokumentáció

Ez a dokumentum az **EventHub** (Esemény- és Jegykezelő Rendszer) teljes architekturális felépítését, komponensstruktúráját, domain modelljeit, üzleti szabályait és a megvalósított fejlesztési ütemtervet tartalmazza.

---

## 1. Rendszer Áttekintés

Az EventHub egy modern, skálázható, kétnyelvű (HU / EN) eseményszervező és online jegyfoglalási platform, amely szigorú üzleti szabályokkal (kapacitáskorlát, dinamikus árazás, múltbeli események zárolása, szerepkör-alapú jogosultságkezelés és reziliens e-mail visszaigazolás) működik.

### Főbb Architekturális Alapelvek:
- **Tiszta rétegződés (Clean / Hexagonal Architecture)**: A backend üzleti logikája (`domain` és `application` réteg) keretrendszer-független tiszta Java 21 kódban helyezkedik el, amelyet külső adapterek (`infrastructure`: JPA/PostgreSQL, Spring Security JWT, SMTP Mailpit, REST Controllerek) szolgálnak ki.
- **Feature-Driven & Moduláris Context Frontend**: A React 19 + TypeScript frontend vertikális üzleti funkciókba (`features/auth`, `features/events`, `features/ticket-booking`) és globális szolgáltató kontextusokba (`EventsContext`, `TicketContext`, `ModalContext`, `NotificationContext`, `I18nContext`) szerveződik.
- **Transzparens Service Absztrakció**: A React komponensek és hookok kizárólag a dedikált service rétegen (`eventService`, `ticketService`, `authService`) és az `apiClient` HTTP kliensen keresztül kommunikálnak a Spring Boot REST API-val.

---

## 2. Technológiai Stack

| Réteg | Technológia | Szerep |
|---|---|---|
| **Frontend UI** | React 19 + TypeScript | Felhasználói felület, típusbiztos komponensek és állapotkezelés |
| **Komponenskönyvtár** | Material UI (MUI v6) | Reszponzív komponensek, natív CSS változó alapú Light & Dark Zinc téma (`colorSchemes`) |
| **Navigáció & Routing** | React Router (v7) | Kliensoldali útvonalkezelés (`/`, `/events/:id`, `/tickets`) |
| **Build & Dev Tool** | Vite 6 | Gyors ESM bundler, HMR fejlesztői szerver és `/api` reverse proxy |
| **Frontend Tesztelés** | Vitest + React Testing Library | Unit és integrációs komponens tesztelés (14 tesztfájl, 71 teszt) |
| **Backend** | Spring Boot 3.4 / 4.x (Java 21 LTS) | Hexagonális Architektúra (Ports & Adapters, DDD) REST API |
| **Biztonság & Auth** | Spring Security + HS256 JWT + BCrypt | Stateless token-alapú autentikáció és szerepkör-ellenőrzés (`ORGANIZER`, `PARTICIPANT`) |
| **Adatbázis (Kizárólag)** | PostgreSQL 16 | Kizárólagos relációs perzisztencia ACID tranzakciós garanciákkal |
| **Migráció** | Flyway | Verziózott SQL adatbázis sémakezelés (`V1` – `V4`) |
| **E-mail Integráció** | Spring Mail (`JavaMailSender`) + Mailpit | Valós SMTP jegyvisszaigazoló e-mailek (HTML + Plain Text) hibatűrő fallbackkel |
| **Nemzetköziesítés (i18n)** | React Context + Typesafe Dicts | Kétnyelvű (HU / EN) felhasználói felület, kétnyelvű eseményadatok és lokalizált e-mailek |

---

## 3. Repozitórium Struktúra

```text
EventHub/
├── .gitignore                     # Gyökér szintű Git kizárások (frontend és backend egyben)
├── docker-compose.yml             # PostgreSQL 16 és Mailpit SMTP konténer definíciók
├── docs/                          # Tervezési és heti sprint dokumentációk
│   ├── architecture.md            # Fő rendszerarchitektúra dokumentáció
│   ├── week-01.md                 # 1. heti sprint (Frontend MVP & Routing)
│   ├── week-02.md                 # 2. heti sprint (Hexagonal Architecture & Domain DDD)
│   ├── week-03.md                 # 3. heti sprint (PostgreSQL JPA, Flyway & REST Integráció)
│   └── week-04.md                 # 4. heti sprint (Dinamikus árazás, JWT Auth, Mailpit, i18n, Dark Mode, Múltbeli események)
│
├── backend/                       # Spring Boot Hexagonális Backend (Java 21)
│   ├── pom.xml                    # Maven projekt konfiguráció
│   ├── build.gradle               # Gradle konfiguráció
│   ├── README.md                  # Backend futtatási és API dokumentáció
│   └── src/
│       ├── main/
│       │   ├── java/hu/eventhub/
│       │   │   ├── EventHubBackendApplication.java
│       │   │   ├── domain/        # Tiszta Java Domain (model, exception, repository portok)
│       │   │   ├── application/   # Use Case bemenő/kimenő portok (port/in, port/out) és POJO service-ek
│       │   │   └── infrastructure/# Adapterek (configuration, notification, persistence/jpa, presentation/web, security)
│       │   └── resources/
│       │       ├── application.properties
│       │       └── db/migration/  # Flyway SQL migrációk (V1, V2, V3, V4)
│       └── test/                  # Domain, UseCase, SMTP és MockMvc integrációs tesztek (51/51 PASS)
│
└── frontend/                      # React 19 + TypeScript + MUI v6 projekt
    ├── package.json               # Függőségek és script-ek
    ├── tsconfig.json              # TypeScript konfiguráció és path aliasok (@/* -> src/*)
    ├── vite.config.ts             # Vite konfiguráció, API proxy és Vitest runner
    ├── index.html                 # HTML belépési pont
    └── src/
        ├── features/              # Feature-Driven üzleti modulok
        │   ├── auth/              # Autentikáció és szerepkör-kezelés
        │   │   ├── components/    # AuthDialog.tsx (+ tesztek)
        │   │   ├── context/       # AuthContext.tsx (JWT perzisztencia, login, register, logout)
        │   │   ├── services/      # authService.ts (+ tesztek)
        │   │   └── types/         # AuthUser, LoginCredentials, RegisterInput
        │   ├── events/            # Eseménykezelés modul
        │   │   ├── components/    # EventCard, EventList, CapacityBadge, OrganizerEventDialog, EditEventDialog
        │   │   ├── context/       # EventsContext.tsx (eseménylista, szűrés, frissítés, reset)
        │   │   ├── hooks/         # useEvents.ts
        │   │   ├── services/      # eventService.ts (REST API kommunikáció)
        │   │   └── types/         # Event, Venue, TicketType, PricingRule, UserRole
        │   └── ticket-booking/    # Jegyfoglalás és jegykezelés modul
        │       ├── components/    # BookingDialog, BookingForm, BookingSuccess (+ tesztek)
        │       ├── context/       # TicketContext.tsx (aktív jegyszámláló szinkronizáció)
        │       ├── hooks/         # useTicketBooking.ts
        │       ├── services/      # ticketService.ts (+ tesztek)
        │       └── types/         # Ticket, BookingRequest, CapacityExceededError, BookingValidationError
        │
        ├── pages/                 # React Router oldal-szintű komponensek
        │   ├── EventsPage.tsx     # Főoldali eseménykatalógus és hero statisztikák
        │   ├── EventDetailPage.tsx# Egyedi esemény részletező nézet
        │   └── TicketsPage.tsx    # Kiadott jegyek és foglalások (Résztvevő & Szervezői KPI dashboard)
        │
        ├── shared/                # Globális megosztott modulok
        │   ├── context/           # I18nContext, ModalContext, NotificationContext
        │   ├── locales/           # Típusbiztos nyelvi szótárak (en.ts, hu.ts, types.ts)
        │   ├── services/          # apiClient.ts (JWT fejléc injektálás, hibakezelés)
        │   ├── types/             # Money értékobjektum
        │   ├── ui/                # MainLayout, Navbar, SettingsDropdown, LanguageSwitcher, NotificationSnackbar, theme.ts
        │   └── utils/             # eventLocalization, errorTranslator, formatters (isEventPast), codeGenerator, seedData
        │
        ├── test/                  # Tesztkörnyezet és in-memory REST API szimulátor (setup.ts)
        ├── App.tsx                # Tiszta Provider-kompozíció és React Router útvonalak
        └── main.tsx               # Belépési pont (InitColorSchemeScript, ThemeProvider, BrowserRouter)
```

---

## 4. Frontend Architektúra: Feature-Driven Design & Moduláris Contextek

A frontend a **Feature-Driven Architecture** mintát követi, ahol a funkcionális szeletek (`auth`, `events`, `ticket-booking`) önálló komponensekkel, hookokkal, típusokkal, API service-ekkel és dedikált React Contextekkel rendelkeznek.

### Állapotkezelés és Elrendezés (`App.tsx` & `MainLayout.tsx`):
- **`App.tsx`**: Mindössze a globális Providereket (`I18nProvider`, `AuthProvider`, `NotificationProvider`, `TicketProvider`, `EventsProvider`, `ModalProvider`) és a deklaratív `<Routes>` definíciókat fogja össze.
- **`MainLayout.tsx`**: Összefogja a `Navbar`-t, az oldal-útvonalakat (`<Outlet />`), a globális modális ablakokat (`BookingDialog`, `OrganizerEventDialog`, `EditEventDialog`, `AuthDialog`) és a `NotificationSnackbar`-t.
- **Service Absztrakció**: A UI komponensek soha nem végeznek közvetlen `fetch` vagy adattárolási műveleteket; minden hívás az `eventService`, `ticketService` és `authService` rétegeken keresztül történik.

---

## 5. Domain Modellek és Kritikus Üzleti Szabályok

### 1. Helyszín (`Venue`) & Kapacitás (`Capacity` Value Object)
```typescript
interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number; // Maximális befogadóképesség (> 0)
}
```
A backend oldalon a `Capacity(maxSeats, soldSeats)` értékobjektum garantálja az invariánsokat (`soldSeats <= maxSeats`), számítja a telítettségi arányt (`occupancyRatio()`), és kezeli a helyek lefoglalását/felszabadítását.

### 2. Esemény (`Event`) & Jegytípus (`TicketType`)
```typescript
type PricingRule = 'EARLY_BIRD' | 'STANDARD' | 'DYNAMIC_SURGE' | 'VIP' | 'FIXED';

interface TicketType {
  id: string;
  name: string;
  description: string;
  basePrice: Money;
  effectivePrice: Money; // Telítettség alapján dinamikusan számított ár
  quota: number;
  soldCount: number;
  remainingTickets: number;
  pricingRule: PricingRule;
}

interface Event {
  id: string;
  title: string;
  titleHu?: string;       // Magyar cím
  description: string;
  descriptionHu?: string; // Magyar leírás
  date: string;           // ISO 8601 UTC időpont
  venue: Venue;
  soldTicketsCount: number;
  price: Money;
  category?: string;
  categoryHu?: string;
  imageUrl?: string;
  ticketTypes?: TicketType[];
}
```

### 3. Jegy (`Ticket`)
```typescript
interface Ticket {
  id: string;
  eventId: string;
  ticketTypeId?: string;
  ticketTypeName?: string;
  participantName: string;
  participantEmail: string;
  ticketCode: string; // Szabványos formátum: EVT-YYYY-XXXX
  price: Money;
  purchaseDate: string; // ISO 8601
  status?: 'VALID' | 'CANCELLED';
  emailStatus?: 'SENT' | 'FAILED_PENDING_RETRY';
}
```

### 4. Kritikus Üzleti Szabályok

1. **Kapacitáskorlát és Jegytípus-kvóta (`Capacity Constraint`)**:
   - Jegykiadás előtt a rendszer ellenőrzi mind a helyszín teljes kapacitását ($\text{soldTicketsCount} < \text{venue.capacity}$), mind a választott jegykategória kvótáját ($\text{tier.soldCount} < \text{tier.quota}$).
   - Teltház esetén a backend `CapacityExceededException`-t (HTTP `409 Conflict`), a frontend `CapacityExceededError`-t dob, és piros MUI Alert figyelmeztetést jelenít meg.
   - Esemény szerkesztésekor (`UpdateEventService`) a helyszín kapacitása nem csökkenthető a már eladott jegyek száma alá.

2. **Dinamikus Árazási Stratégiák (`PricingRule`)**:
   - `EARLY_BIRD`: **-20% kedvezmény**, amíg az esemény telítettsége $< 50\%$.
   - `STANDARD` / `DYNAMIC_SURGE`: **+15% felár (surge pricing)** magas kereslet ($\ge 80\%$ telítettség) esetén.
   - `VIP`: **+10% prémium felár** $\ge 90\%$ telítettség felett.
   - `FIXED`: Állandó ár a telítettségtől függetlenül.

3. **Múltbeli (Lezárult) Események Korlátozása (`Past Event Restriction`)**:
   - Ha egy esemény dátuma már elmúlt ($\text{event.date} < \text{now}$):
     - **Jegyfoglalás tiltása**: A `BookTicketService` `InvalidBookingException`-t (HTTP `400 Bad Request`) dob; a kártyákon és a részletező oldalon megjelenik a `Lezárult` / `Past Event` jelvény, a foglalási gomb pedig inaktív (`Esemény véget ért` / `Event Ended`).
     - **Jegylemondás tiltása**: A `CancelTicketService` megakadályozza a már lezajlott eseményekre szóló jegyek utólagos lemondását; a `TicketsPage` felületén a lemondás gomb inaktívvá válik magyarázó tooltippel.

4. **Jegylemondás és Kapacitás-felszabadítás (`CancelTicketUseCase`)**:
   - Jövőbeli eseményre szóló érvényes jegy lemondásakor a jegy státusza `CANCELLED`-re vált, az esemény és a jegytípus eladott darabszáma pedig 1-gyel csökken (felszabadítva a férőhelyet).

5. **Szerepkör-alapú Jogosultságkezelés (`ORGANIZER` vs `PARTICIPANT`)**:
   - Esemény létrehozása (`POST /api/events`), szerkesztése (`PUT /api/events/{id}`) és jegytípus hozzáadása (`POST /api/events/{id}/ticket-types`) kizárólag kriptográfiailag aláírt `ORGANIZER` szerepkörű HS256 JWT tokennel engedélyezett (ellenkező esetben `403 Forbidden`).

---
