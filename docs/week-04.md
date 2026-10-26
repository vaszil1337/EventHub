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
5. **Külső Integráció Tesztelt Hibakezeléssel (`EmailNotificationPort`)**:
   - Kimenő port (`EmailNotificationPort`) és adapter (`SmtpEmailNotificationAdapter`) a jegyvásárlási visszaigazoló e-mailek küldésére.
   - **Reziliens hibakezelés**: Ha a külső e-mail szolgáltató hibát dob (`EmailDeliveryException` – pl. szolgáltatói kiesés vagy `@fail-email.test` tesztcím esetén), a `BookTicketService` elkapja a kivételt, a jegyet `FAILED_PENDING_RETRY` e-mail státusszal menti el, így a tranzakció és a jegyfoglalás nem vész el.

---

## 2. Tesztelési Eredmények
- **Backend (`mvn test`)**: 21/21 teszt sikeres (beleértve a dinamikus surge árazást, a jegylemondást és kapacitás-felszabadítást, a `403 Forbidden` szerepkör-védelmet, valamint a külső e-mail szolgáltató hibájának reziliens kezelését).
- **Frontend (`npm run test:run` & `npm run build`)**: 14/14 Vitest teszt sikeres, TypeScript/Vite produkciós build hibátlan, és minden komponens kizárólag a központi MUI `theme.ts` tokeneket használja.
