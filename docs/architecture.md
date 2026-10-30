# EventHub - Fő Rendszerarchitektúra és Tervezési Dokumentáció

Ez a dokumentum az **EventHub** (Esemény- és Jegykezelő Rendszer) teljes architekturális tervét, komponensfelépítését, adatmodelljeit és több hetes fejlesztési roadmapjét tartalmazza.

---

## 1. Rendszer Áttekintés

Az EventHub célja egy modern, skálázható és felhasználóbarát eseményszervező és online jegyfoglalási platform biztosítása.

### Főbb Célok:
- **Tiszta rétegződés**: Az üzleti logika szigorúan elkülönül a megjelenítéstől és az adattárolástól.
- **Frontend-Backend függetlenség**: A frontend és a leendő backend különálló projektekben (`frontend/` és `backend/`) élnek.
- **Transzparens API absztrakció**: Az 1. héten a frontend egy Service/API absztrakciós rétegen keresztül kezeli az adatokat (LocalStorage-ben), így a későbbi Spring Boot REST API-ra váltás a React UI komponensek érintése nélkül történik.

---

## 2. Technológiai Stack

| Réteg | Technológia | Szerep |
|---|---|---|
| **Frontend UI** | React 19 + TypeScript | Felhasználói felület és interakciók |
| **Komponenskönyvtár** | Material UI (MUI v6) | Reszponzív, akadálymentes design rendszer |
| **Navigáció & Routing** | React Router (v7) | Kliensoldali útvonalkezelés (`/`, `/events/:id`, `/tickets`) |
| **Build & Dev Tool** | Vite | Gyors ESM bundler és HMR fejlesztői szerver |
| **Frontend Tesztelés** | Vitest + React Testing Library | Unit és integrációs komponens tesztelés |
| **Backend** | Spring Boot 3.x / 4.x (Java 21 LTS) | Hexagonális Architektúra (DDD) REST API |
| **Adatbázis (Kizárólag)** | PostgreSQL | Kizárólagos relációs perzisztencia minden esetben ACID garanciákkal |
| **Migráció** | Flyway | Verziózott adatbázis sémakezelés (V1, V2, V3, V4) |
| **Nemzetköziesítés (i18n)** | React Context + Typesafe Dicts | Kétnyelvű (HU / EN) dinamikus fordítási rendszer |

---

## 3. Repozitórium Struktúra

```
EventHub/
├── .gitignore                     # Gyökér szintű Git kizárások (frontend és backend egyben)
├── docker-compose.yml             # PostgreSQL 16 adatbázis konténer definíció
├── docs/                          # Tervezési és heti dokumentációk
│   ├── architecture.md            # Ez a fő rendszerterv
│   ├── week-01.md                 # 1. heti sprint összefoglaló (Frontend MVP)
│   ├── week-02.md                 # 2. heti sprint (Hexagonal Architecture & Domain DDD)
│   ├── week-03.md                 # 3. heti sprint (PostgreSQL JPA & REST Integráció)
│   └── week-04.md                 # 4. heti sprint (Jegytípusok, Árazás, Lemondás, Szerepkörök & Email Port)
│
├── backend/                       # Spring Boot Hexagonális Backend (Java 21)
│   ├── pom.xml                    # Maven projekt konfiguráció
│   ├── build.gradle               # Gradle konfiguráció
│   ├── README.md                  # Backend futtatási és tervezési dokumentáció
│   └── src/
│       ├── main/
│       │   ├── java/hu/eventhub/
│       │   │   ├── EventHubBackendApplication.java
│       │   │   ├── domain/        # Tiszta Java Domain (model, exception, ports)
│       │   │   ├── application/   # Használati esetek (port/in, service)
│       │   │   └── infrastructure/# Adapterek (configuration, persistence/jpa, web)
│       │   └── resources/
│       │       ├── application.properties
│       │       └── db/migration/  # Flyway SQL migrációk (V1, V2, V3, V4)
│       └── test/                  # Domain, UseCase és Web tesztek (100% pass)
│
└── frontend/                      # React + TypeScript + MUI projekt
    ├── package.json               # Függőségek (React, MUI, React Router, Vitest)
    ├── tsconfig.json              # Path aliasok (@/* -> src/*)
    ├── vite.config.ts             # Vite konfiguráció és Vitest runner
    ├── index.html                 # HTML belépési pont
    └── src/
        ├── features/              # Feature-Driven modulok
        │   ├── auth/              # Felhasználói autentikáció & szerepkörök modul
        │   │   ├── components/    # AuthDialog
        │   │   ├── context/       # AuthContext (JWT, Login, Logout)
        │   │   └── services/      # authService.ts
        │   ├── events/            # Eseménykezelés modul
        │   │   ├── components/    # EventCard, EventList, CapacityBadge, OrganizerEventDialog, EditEventDialog
        │   │   ├── hooks/         # useEvents hook
        │   │   ├── services/      # eventService.ts (API absztrakció)
        │   │   └── types/         # Event, Venue, TicketType, PricingRule típusok
        │   └── ticket-booking/    # Jegyfoglalás modul
        │       ├── components/    # BookingDialog, BookingForm, BookingSuccess
        │       ├── hooks/         # useTicketBooking hook
        │       ├── services/      # ticketService.ts (Kapacitásellenőrzés, jegykiadás, lemondás)
        │       └── types/         # Ticket, BookingRequest, CapacityExceededError
        │
        ├── pages/                 # React Router oldal-szintű komponensek
        │   ├── EventsPage.tsx     # Főoldali eseménykatalógus
        │   ├── EventDetailPage.tsx# Egyedi esemény részletező nézet
        │   └── TicketsPage.tsx    # Kiadott jegyek áttekintése (Szervező & Résztvevő nézetek)
        │
        ├── shared/                # Globális megosztott modulok
        │   ├── context/           # I18nContext (Nyelvkezelés & t() segédfüggvény)
        │   ├── locales/           # Típusbiztos nyelvi szótárak (en.ts, hu.ts, types.ts)
        │   ├── types/             # Money értékobjektum
        │   ├── ui/                # Navbar, LanguageSwitcher, NotificationSnackbar, Theme beállítás
        │   └── utils/             # apiClient, eventLocalization, errorTranslator, formatters, seedData
        │
        ├── test/                  # Tesztkörnyezet setup (vitest + RTL)
        ├── App.tsx                # Fő útvonalkezelő és elrendezés (Layout)
        └── main.tsx               # Belépési pont (I18nProvider, AuthProvider, ThemeProvider)
```

---

## 4. Frontend Architektúra: Feature-Driven Design

A frontend a **Feature-Driven Architecture** mintát követi. Ennek lényege, hogy a forráskód nem horizontális technikai mappákba (pl. `components/`, `services/`, `models/`), hanem vertikális üzleti funkcionalitásokba (`features/events`, `features/ticket-booking`) van szervezve.

### Szigorú Tervezési Szabály:
> **A React komponensek SOHA NEM férhetnek hozzá közvetlenül a LocalStorage-hoz.**
> Minden adatolvasás és módosítás kizárólag a feature-specifikus service rétegen (`eventService`, `ticketService`) keresztül történhet.
>
> **Miért létszükséglet ez?**
> Amikor a 2. és 3. héten csatlakoztatjuk a Spring Boot REST végpontokat, kizárólag a `service` fájlok belső implementációját kell átírnunk `fetch()` / `axios()` hívásokra. A felhasználói felület (UI), a formok, a dialógusok és a React hookok egyetlen sora sem fog megváltozni!

---

## 5. Domain Modellek és Üzleti Szabályok

### 1. Helyszín (Venue)
```typescript
interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number; // Maximális befogadóképesség
}
```

### 2. Esemény (Event)
```typescript
interface Event {
  id: string;
  title: string;
  titleHu?: string; // Opcionális magyar cím
  description: string;
  descriptionHu?: string; // Opcionális magyar leírás
  date: string; // ISO 8601 formátum
  venue: Venue;
  soldTicketsCount: number; // Eladott jegyek száma
  price: Money;
  category?: string;
  imageUrl?: string;
  ticketTypes?: TicketType[]; // Kapcsolódó jegykategóriák
}
```

### 3. Jegy (Ticket)
```typescript
interface Ticket {
  id: string;
  eventId: string;
  participantName: string;
  participantEmail: string;
  ticketCode: string; // Formátum: EVT-YYYY-XXXX (pl. EVT-2026-B9F2)
  price: Money;
  purchaseDate: string; // ISO 8601
}
```

### 4. Kritikus Üzleti Szabály: Kapacitáskorlát (Capacity Constraint)
1. Jegykiadás előtt a rendszer ellenőrzi az aktuális állapotot:
   $$\text{soldTicketsCount} \ge \text{venue.capacity}$$
2. Amennyiben a fenti feltétel teljesül:
   - A `ticketService` megszakítja a folyamatot és `CapacityExceededError` kivételt dob.
   - Az esemény számlálója nem növekszik, jegy nem jön létre.
   - A felületen figyelemfelkeltő, piros MUI Alert figyelmeztetés jelenik meg.
3. Amennyiben van még szabad hely:
   - `soldTicketsCount` megnő 1-gyel.
   - Generálódik egy egyedi `ticketCode`.
   - Létrejön a jegyrekord, és a felhasználó megkapja a visszaigazoló kártyát.

---

## 6. Tervezett Több-hetes Ütemterv (Roadmap)

```mermaid
gantt
    title EventHub Fejlesztési Ütemterv
    dateFormat  YYYY-MM-DD
    section Week 1 (Frontend MVP)
    Feature-Driven React Alapok      :done,    des1, 2026-09-01, 2026-09-07
    LocalStorage Service Absztrakció :done,    des2, 2026-09-01, 2026-09-07
    Kapacitáskezelés & MUI Dialógus  :done,    des3, 2026-09-04, 2026-09-07
    React Router & Több Oldal        :done,    des4, 2026-09-05, 2026-09-08
    section Week 2 (Backend DDD & Hexagonal)
    Spring Boot Inicializálás        :done,    des5, 2026-09-08, 2026-09-14
    Domain Réteg (Event, Ticket DDD) :done,    des6, 2026-09-09, 2026-09-14
    REST API & Hexagonal Config      :done,    des7, 2026-09-11, 2026-09-14
    section Week 3 (Perzisztencia & Integráció)
    PostgreSQL & JPA Adapterek       :done,    des8, 2026-09-15, 2026-09-21
    Flyway Migrációk (V1, V2, V3)    :done,    des9, 2026-09-16, 2026-09-21
    Frontend Service -> REST bekötés :done,    des10, 2026-09-18, 2026-09-21
    section Week 4 (Haladó Funkciók)
    Biztonság & Jogosultságok (Auth) :         des11, 2026-09-22, 2026-09-28
    PDF / QR-kód jegygenerálás       :         des12, 2026-09-24, 2026-09-28
```
