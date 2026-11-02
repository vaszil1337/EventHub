# 4. Heti Fejlesztési Dokumentáció (Week 4) – Komplex Domain, Árazási Stratégiák, Jogosultságok & Külső Integráció

## 1. Heti Célkitűzések (Tantárgyi Követelménytáblázat 7. Sor – EventHub)
A 4. hét célja a tantárgyi követelménytáblázatban rögzített összes **EventHub** specifikáció teljes körű megvalósítása a Hexagonális Architektúrában és a React Frontend felületen:

1. **4 Domain Entitás & 2 Value Object**:
   - **Entitások**: `Event` (Esemény), `Venue` (Helyszín), `TicketType` (Jegytípus), `Ticket` (Jegyrendelés).
   - **Értékobjektumok (Value Objects)**: `Money` (Pénzösszeg), `Capacity` (Kapacitás: `maxSeats`, `soldSeats`, foglaltsági arány és invariánsok).
2. **Komplex Funkció – Több Jegytípus és Dinamikus Árazási Stratégiák (`PricingRule`)**:
   - Egy eseményhez több jegykategória (`Early Bird`, `Standard`, `VIP Pass`, illetve egyedi kategóriák) tartozik külön kvótával (`quota`) és eladott darabszámmal (`soldCount`).
   - Szabályalapú árazás az esemény aktuális telítettsége (`Capacity`) alapján:
     - `EARLY_BIRD`: **-20% kedvezmény**, amíg az esemény telítettsége `< 50%`.
     - `STANDARD` / `DYNAMIC_SURGE`: **+15% felár (surge pricing)** magas kereslet esetén ($\ge 80\%$ telítettség).
     - `VIP`: **+10% prémium felár** $\ge 90\%$ telítettség felett.
     - `FIXED`: Fix ár telítettségtől függetlenül.
3. **Mind a 4 Use Case Megvalósítása**:
   - `CreateEventUseCase`: Új esemény létrehozása alapértelmezett jegytípusokkal.
   - `AddTicketTypeUseCase`: Új jegytípus hozzáadása meglévő eseményhez.
   - `BookTicketUseCase`: Jegy rendelése jegytípus-kvóta és helyszín-kapacitás ellenőrzéssel, dinamikus árkalkulációval és e-mail értesítéssel.
   - `CancelTicketUseCase`: Jegyrendelés lemondása (`status = CANCELLED`), amely felszabadítja a lefoglalt helyet mind az `Event`, mind a `TicketType` szintjén.
4. **Szerepkörök, Spring Security + JWT & React `AuthContext` (`UserRole`)**:
   - **Domain & Perzisztencia**: `User` entitás (`UserId`, `fullName`, `email`, `passwordHash`, `UserRole`) és PostgreSQL `users` tábla (`UserJpaEntity`). Induláskor a `DatabaseSeeder` létrehozza a két demó fiókot (`organizer@eventhub.hu` / `organizer123` és `participant@eventhub.hu` / `participant123`).
   - **Szerveroldali JWT validáció (`Spring Security`)**:
     - `BCryptPasswordHasherAdapter`: BCrypt jelszó-hashelés.
     - `HmacJwtTokenProviderAdapter`: RFC 7519 szabványú HMAC-SHA256 (`HS256`) kriptográfiailag aláírt JWT token generálás és időállandó (`MessageDigest.isEqual`) aláírás-ellenőrzés.
     - `JwtAuthenticationFilter` + `SecurityConfiguration`: Stateless Spring Security filter lánc, amely az `Authorization: Bearer <token>` fejlécből kinyeri és ellenőrzi a tokent, majd beállítja a `SecurityContextHolder`-be. A kliens által küldött fejlécek nem hamisíthatók (`403 Forbidden`, ha `PARTICIPANT` tokennel próbálnak szervezői végpontot hívni).
   - **Frontend (`AuthContext` + `AuthDialog`)**:
     - Globális `AuthProvider` és `useAuth()` hook, amely kezeli a bejelentkezett felhasználót és a JWT tokent.
     - Az `apiClient.ts` automatikusan csatolja az `Authorization: Bearer <token>` fejlécet minden kéréshez.
     - Bejelentkezett felhasználónál a jegyfoglalási űrlap automatikusan kitölti a nevet és e-mail címet.
5. **Külső Integráció & E-mail Rendszer (`EmailNotificationPort`, Mailpit)**:
   - Kimenő port (`EmailNotificationPort`) és kibővített infrastruktúra adapter (`SmtpEmailNotificationAdapter`) a jegyvásárlási visszaigazoló e-mailek valós kiküldésére.
   - **Mailpit Fejlesztői SMTP Környezet**: A `docker-compose.yml`-ben futó `axllent/mailpit` konténer fogadja a leveleket (SMTP port: `1025`), és azonnali böngészős előnézetet biztosít a `http://localhost:8025` webes felületen.
   - **Formázott HTML és Szöveges E-mail**: A levél tartalmazza a rendezvény részleteit (cím, időpont, helyszín), a jegytípust, a kifizetett árat, valamint kiemelt kártyán a belépéshez szükséges egyedi belépőkódot (`EVT-YYYY-XXXX`).
   - **Reziliens hibakezelés**: Ha a külső e-mail szolgáltató hibát dob (`EmailDeliveryException` – pl. szolgáltatói kiesés vagy `@fail-email.test` tesztcím esetén), a `BookTicketService` elkapja a kivételt, a jegyet `FAILED_PENDING_RETRY` e-mail státusszal menti el, így a tranzakció és a jegyfoglalás nem vész el.
6. **Teljeskörű Kétnyelvűsítés & i18n Architektúra (Bilingual Event Support & Localization)**:
   - **Kétnyelvű Adatmodell & Flyway V4 Migráció**:
     - Az `Event` entitás és a PostgreSQL `events` tábla kiegészült a `title_hu` és `description_hu` oszlopokkal (`V4__add_bilingual_event_fields.sql`).
     - A `CreateEventCommand`, `UpdateEventCommand`, `CreateEventRequest` és `UpdateEventRequest` DTO-k mindkét nyelvi változatot kötelezően bekérik és validálják a szervezőtől.
   - **Lokalizált E-mail Értesítések (`Accept-Language` / Locale)**:
     - A jegyfoglalási kérés (`BookingRequest`) továbbítja a kliens által választott nyelvet (`locale: 'en' | 'hu'`).
     - Az `EmailNotificationPort` és `SmtpEmailNotificationAdapter` ezen locale alapján állítja elő a megfelelő nyelvű HTML és szöveges levelet (magyar: *"Jegyfoglalás megerősítése"*, angol: *"Ticket Confirmation"*).
   - **Frontend i18n Rendszer (`I18nContext`, szótárak & LanguageSwitcher)**:
     - Típusbiztos fordítási szótárak (`types.ts`, `en.ts`, `hu.ts`) a teljes alkalmazásra kiterjedően (navigáció, események, jegyfoglalás, szervezői felület, hibaüzenetek, snackbar értesítések).
     - A navigációs sávban letisztult MUI `<Select size="small">` dropdown (`🌐 HU ▾` / `🌐 EN ▾`) teszi lehetővé az azonnali nyelvváltást.
   - **Deklaratív Jegytípus-feloldás (`eventLocalization.ts`)**:
     - Az ad-hoc `if-else` láncok helyett deklaratív, szótár- és lookup-tábla alapú megoldás (`TIER_KEY_MAP`, `DESCRIPTION_MATCHERS`, és $O(1)$ `INITIAL_EVENTS_MAP` fallback).
     - A starter jegyek nevei (*Early Bird belépő*, *Standard belépő*, *VIP belépő*) és dinamikus árazási magyarázatai a kiválasztott nyelv szerint jelennek meg.
7. **Sötét Mód (Dark Mode) & Egyesített Beállítások Menü (Unified Preferences Dropdown)**:
   - **MUI v6 Natív CSS Változók & Színsémák (`colorSchemes`)**:
     - A `theme.ts` fájlban bevezetésre került a `cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' }` és a `colorSchemes: { light, dark }` konfiguráció.
     - **Világos Zinc téma**: Tiszta Zinc 50 (`#fafafa`) háttér, fehér (`#ffffff`) kártyák és Zinc 900 (`#18181b`) kiemelt akciógombok.
     - **Sötét Zinc téma**: Mély Zinc 950 (`#09090b`) háttér, emelt szintű Zinc 900 (`#141417`) kártyák és felületek, tiszta fehér/Zinc 50 (`#fafafa`) szövegek és akciógombok, Zinc 800 (`#27272a`) diszkrét elválasztóvonalak.
     - A `main.tsx`-ben az `InitColorSchemeScript` garantálja az azonnali renderelést (FOUC villanás nélkül) és a témapreferencia automatikus `localStorage` perzisztálását.
   - **Egyesített Beállítások Dropdown (`SettingsDropdown.tsx`)**:
     - A Navbarban korábban önállóan álló nyelvválasztó helyét egy elegáns, fogaskerék ikonnal (`SettingsOutlinedIcon`) ellátott beállítások menü vette át.
     - A gomb felületén azonnal látható az aktuális státusz (pl. `EN ☀️` vagy `HU 🌙`).
     - A menüt megnyitva két jól elkülönített szekcióban érhető el:
       1. **Nyelvválasztás**: English (EN) és Magyar (HU) opciók, pipával jelölve az aktív kiválasztást.
       2. **Megjelenés (Téma)**: Világos (Light) és Sötét (Dark) mód választás, ikonokkal és vizuális visszajelzéssel.
   - **Képek Fényerő-csökkentése Sötét Módban (`brightness(0.9)`)**:
     - Az események borítóképein (`EventCard.tsx`, `EventDetailPage.tsx`) `theme.applyStyles('dark', { filter: 'brightness(0.9)' })` szűrő fut le, így éjszaka vagy sötét környezetben a képek fehérebb részei sem vakítják a felhasználót.
   - **Auth Modal Feliratok Javítása**:
     - Az `AuthDialog.tsx` komponensben optimalizálásra került a belső térköz (`pt: 1.5`, `pt: 1`), így a kitöltött input mezők felugró (`shrink`) címkéi (`Email address`, `Password`) többé nem vágódnak le felül a görgethető dialógusban.
8. **Esemény Létrehozás / Szerkesztés UX Finomhangolás & Kártyaszélesség Javítás**:
   - **Natív Dátum- és Időválasztó (`type="datetime-local"`)**:
     - Az `OrganizerEventDialog.tsx` és az `EditEventDialog.tsx` komponensekben a nyers ISO szövegmezőt felhasználóbarát böngésző natív naptár- és időválasztó váltotta fel (`toDatetimeLocalValue` és `fromDatetimeLocalValue` konverterekkel a `formatters.ts`-ben).
   - **Lokalizált Kategóriaválasztó (`Select` Dropdown)**:
     - Szabad szöveges bevitel helyett kétnyelvű legördülő választó (`Technology` / `Technológia`, `Music` / `Zene`, `Workshop`, `Conference` / `Konferencia`, `General` / `Általános`), amely a kiválasztott nyelven jeleníti meg az opciókat, miközben a kanonikus kulcsot tárolja.
   - **Opcionális Borítókép URL & Egységes Kártyaszélesség**:
     - Az esemény létrehozásakor a borítókép URL megadása opcionális (üresen hagyva kurált alapértelmezett konferenciaképet kap).
     - Az `EventCard.tsx` `width: '100%'` szabállyal kitölti a CSS Grid cellákat rövid leírások esetén is.
9. **Frontend Architekturális Refaktorálás (`App.tsx` Modularizáció)**:
   - Az `App.tsx` (korábban 291 soros monolitikus állapotkezelő) 36 soros, tiszta Provider- és Router-kompozícióvá alakult.
   - **Új dedikált Contextek és Layout**:
     - `NotificationContext.tsx`: Globális snackbar értesítések (`notify(message, severity)`).
     - `ModalContext.tsx`: Modális ablakok (`AuthDialog`, `OrganizerEventDialog`, `EditEventDialog`, `BookingDialog`) állapotvezérlése.
     - `TicketContext.tsx`: Navbar jegyszámláló szinkronizálása a szerverrel.
     - `EventsContext.tsx`: Eseménylista, keresés, kategóriaszűrés és demo reset globális kontextusa.
     - `MainLayout.tsx`: A navigációs sávot, az oldal-útvonalakat (`<Outlet />`) és a globális dialógusokat összefogó keretkomponens.
10. **Múltbeli (Lezárult) Események Kezelése & Jegylemondási Korlátozás**:
    - **Backend Üzleti Szabályok (`BookTicketService` & `CancelTicketService`)**:
      - A `BookTicketService` ellenőrzi az esemény időpontját (`event.getDate().isBefore(clock.instant())`), és múltbeli esemény esetén `InvalidBookingException`-t dob (HTTP `400 Bad Request`).
      - A `CancelTicketService` `Clock` alapú ellenőrzéssel megakadályozza a már lezajlott eseményekre szóló jegyek utólagos lemondását (`InvalidBookingException`).
    - **Frontend Megjelenítés & Védelem**:
      - `isEventPast()` segédfüggvény a `formatters.ts`-ben.
      - Az `EventCard.tsx` és `EventDetailPage.tsx` komponensekben a múltbeli események `Lezárult` / `Past Event` jelvényt kapnak, a foglalási gomb pedig inaktívvá válik (`Esemény véget ért` / `Event Ended`).
      - A `TicketsPage.tsx` résztvevői kártyáin és szervezői táblázatában a lezárult eseményekhez tartozó jegyek lemondási gombja letiltásra kerül magyarázó tooltippel (*„Már lezárult eseményre szóló jegy nem mondható le.”*).
      - Az `errorTranslator.ts`, `en.ts` és `hu.ts` teljes körűen lokalizálja a kapcsolódó üzeneteket.

---

## 2. Tesztelési Eredmények
- **Backend (`mvn test`)**: **51/51 teszt sikeres** (11 tesztosztályban: beleértve a dinamikus surge árazást, esemény létrehozást és módosítást, a kétnyelvű cím/leírás mentést és validációt, a jegylemondást és kapacitás-felszabadítást, a múltbeli eseményekre történő foglalás és jegylemondás tiltását, a `403 Forbidden` szerepkör-védelmet, valamint a Mailpit/JavaMailSender HTML levélküldést magyar és angol nyelven hibatűrő fallbackkel).
- **Frontend (`npm run test:run` & `npm run build`)**: **71/71 Vitest teszt sikeres** 14 tesztfájlban (`App.test.tsx`, `ticketService.test.ts`, `BookingDialog.test.tsx`, `OrganizerEventDialog.test.tsx`, `EditEventDialog.test.tsx`, `TicketsPage.test.tsx`, `AuthDialog.test.tsx`, `AuthContext.test.tsx`, `authService.test.ts`, `SettingsDropdown.test.tsx`, `LanguageSwitcher.test.tsx`, `I18nContext.test.tsx`, `eventLocalization.test.ts`, `errorTranslator.test.ts`), a TypeScript és Vite produkciós build 0 hibával lefordul.
