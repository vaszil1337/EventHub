# EventHub - 1. Hét (Week 1): Frontend MVP & Routing

Ez a dokumentum az 1. heti sprint feladatait, technikai megvalósítását és tesztelési eredményeit részletezi.

---

## 🎯 1. Hét Célkitűzései

- [x] Kliensoldali projekt inicializálása Vite + React 19 + TypeScript + Material UI (MUI) alapon.
- [x] **Feature-Driven Architecture** mappa- és modulszerkezet kialakítása (`features/events`, `features/ticket-booking`, `shared`).
- [x] **LocalStorage Service Absztrakció**: UI komponensek szigorú elválasztása az adattárolási mechanizmustól.
- [x] Kezdeti mintaadatok (Seed data) automatikus betöltése 3 eseménnyel (ebből 1 teljesen teltházas 50/50 esemény a határesetek tesztelésére).
- [x] **Kapacitási üzleti szabály**: `soldTicketsCount >= capacity` esetén a jegyvásárlás blokkolása, `CapacityExceededError` dobása és MUI Alert hibaüzenet megjelenítése.
- [x] Egyedi jegykód generátor (`EVT-YYYY-XXXX`).
- [x] **React Router integráció**: Oldal-alapú navigáció az események (`/`), esemény részletek (`/events/:id`) és a megvásárolt jegyek (`/tickets`) között.
- [x] Átfogó tesztelési készlet (Vitest + React Testing Library).

---

## 📂 Megvalósított Modulok és Fájlok

### 1. Feature: `events` (`frontend/src/features/events/`)
- **`types/index.ts`**: `Venue` és `Event` TypeScript interfészek.
- **`services/eventService.ts`**: Események lekérése, szűrése, azonosító szerinti keresése, kapacitás frissítése és demo adatok visszaállítása.
- **`hooks/useEvents.ts`**: Keresést, kategóriaszűrést és frissítést koordináló állapotkezelő hook.
- **`components/CapacityBadge.tsx`**: Dinamikus telítettségjelző sáv (`LinearProgress`) és állapotjelző (`Chip`): *Available*, *Few seats left*, *Sold Out*.
- **`components/EventCard.tsx`**: Reszponzív eseménykártya képpel, helyszínnel, árral és interaktív foglalási gombbal.
- **`components/EventList.tsx`**: Eseményrács keresővel és kategóriaszűrővel.

### 2. Feature: `ticket-booking` (`frontend/src/features/ticket-booking/`)
- **`types/index.ts`**: `Ticket`, `BookingRequest` típusok, valamint a `CapacityExceededError` és `BookingValidationError` egyedi hibakivételi osztályok.
- **`services/ticketService.ts`**: Szigorú kapacitásvalidáció, egyedi jegykód generálás, eseményszámláló növelése és jegymentés.
- **`hooks/useTicketBooking.ts`**: Dialógus állapotát, űrlapadatokat, töltési állapotot és hibakezelést vezérlő hook.
- **`components/BookingForm.tsx`**: Résztvevő neve és email mezők, beépített telítettség-figyelmeztetéssel.
- **`components/BookingSuccess.tsx`**: Sikeres vásárlás utáni jegyvisszaigazoló kártya másolható jegykóddal (`EVT-2026-XXXX`).
- **`components/BookingDialog.tsx`**: MUI Modal ablak, ami a foglalási folyamatot fogja össze.

### 3. Oldalak & Routing (`frontend/src/pages/` és `react-router-dom`)
- **`/` (EventsPage)**: Fő eseménykatalógus élő keresővel és szűrőkkel.
- **`/events/:id` (EventDetailPage)**: Adott esemény részletes nézete helyszínleírással és közvetlen jegyfoglalással.
- **`/tickets` (TicketsPage)**: Az összes kiállított jegy áttekintése, jegykód másolási lehetőséggel és részletekkel.

---

## 🔒 Üzleti Szabály: Kapacitáskorlát Megvalósítása

A jegyvásárlási logika a `ticketService.ts` fájlban:

```typescript
const event = await eventService.getEventById(request.eventId);

// Kapacitáskorlát ellenőrzése
if (event.soldTicketsCount >= event.venue.capacity) {
  throw new CapacityExceededError(
    `Event "${event.title}" is fully booked (${event.soldTicketsCount}/${event.venue.capacity} seats taken). No tickets available.`
  );
}
```

A felhasználói felületen ezt a hibát a `BookingForm` egy kiemelt, piros `Alert` komponensben jeleníti meg, miközben a foglalási tranzakció azonnal meghiúsul.

---

## 🧪 Tesztelés és Eredmények

A tesztcsomag futtatása:
```bash
cd frontend
npm run test:run
```

**Eredmény (100% PASS)**:
1. `ticketService.test.ts`:
   - Kapacitáskorlát tesztelése a teltházas (50/50) eseményen.
   - Sikeres jegyvásárlás elérhető eseménynél és `soldTicketsCount` növekedés.
   - Határhelyzet: utolsó jegyek megvásárlása és a limit elérése.
   - Validációs hibák (üres név, érvénytelen email cím, nem létező esemény azonosító).
2. `BookingDialog.test.tsx`:
   - Eseményadatok és beviteli mezők megjelenítése.
   - Sikeres vásárlási folyamat és jegykód megjelenítés.
   - Teltházas eseménynél megjelenő hiba-alert ellenőrzése.
   - Mezővalidációk tesztelése.
3. `App.test.tsx`:
   - Eseménykeresés és szűrés.
   - Teljes integrált vásárlási folyamat és kártyaszámláló frissülés (45 -> 46).
   - Oldalak közötti navigáció és teltház alert megjelenítés.

---

## 🚀 Indítási Útmutató

```bash
# Lépj be a frontend könyvtárba
cd frontend

# Függőségek telepítése (ha szükséges)
npm install

# Fejlesztői szerver indítása
npm run dev

# Tesztek futtatása
npm run test:run

# Produkciós build készítése
npm run build
```
