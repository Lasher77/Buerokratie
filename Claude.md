# Claude.md - Projekt-Analyse: BVMW Bürokratieabbau-Plattform

## 1. Anwendungsübersicht

### Was macht diese Anwendung?
Die **BVMW Bürokratieabbau-Plattform** ermöglicht es mittelständischen Unternehmen:
- Bürokratische Hemmnisse zu melden (mit Titel, Beschreibung, Kategorie, WZ-Branche)
- Zeitaufwand, Kosten und betroffene Mitarbeiter anzugeben
- Anonym oder mit Kontaktdaten zu melden
- Bestehende Meldungen einzusehen und zu durchsuchen
- Abstimmungen ("Das betrifft mich auch") abzugeben
- Als Moderator/Admin Meldungen zu prüfen und zu kommentieren

### Tech-Stack
| Schicht | Technologie |
|---------|-------------|
| Frontend | React 18.2 + **TypeScript**, React Router v6, styled-components, Formik + Yup, Axios |
| Backend | Node.js, Express 4.18, mysql2, JWT, bcrypt, express-validator, Helmet |
| Datenbank | MySQL 8.x |
| Tests | Jest, Supertest (Backend), React Testing Library (Frontend) |

---

## 2. Durchgeführte Änderungen (2026-01-25)

### A) Farbsystem zentralisiert
**Datei:** `frontend/src/theme.ts`

```typescript
// Zentrale Farbdefinitionen basierend auf BVMW Corporate Design
export const colors = {
  primary: '#E30613',        // BVMW Rot
  primaryDark: '#b20510',    // Dunkles Rot für Hover/Footer
  primaryLight: '#f9d8dc',   // Helles Rot für Focus
  gray: '#58585A',           // BVMW Grau für Tags
  grayLight: '#E5E5E5',      // Trennlinien
  textPrimary: '#1A1A1A',    // Überschriften
  textSecondary: '#2d2d2d',  // Fließtext
  background: '#FFFFFF',
  backgroundAlt: '#f9f9f9',
  success: '#2E7D32',
  warning: '#FFB400',
};
```

**Vorteile:**
- Alle Farben an einem Ort definiert
- TypeScript-Typsicherheit
- Konsistente Verwendung in allen Komponenten

### B) CORS/API-Kommunikation verbessert
**Backend:** `backend/app.js`
- Verbesserte CORS-Konfiguration mit Fehlerlogging
- Unterstützt `credentials: true`
- Erlaubt `x-session-id` Header

**Frontend:** `frontend/src/api.ts`
- Axios-Instanz mit Request/Response-Interceptors
- Automatisches Token-Handling
- Automatischer Logout bei Token-Ablauf
- Session-ID für Abstimmungen

**.env Dateien** (beide mit ausführlicher Dokumentation):
- `backend/.env.example` - CORS, HTTPS, DB, JWT Konfiguration
- `frontend/.env.example` - API-URL Konfiguration

### C) Admin-Setup-Wizard erstellt
**Neue Dateien:**
- `backend/routes/setup.js` - Setup-API-Endpunkte
- `frontend/src/components/SetupWizard.tsx` - Browser-Wizard

**Funktionsweise:**
1. Beim Start prüft die App: `GET /api/setup/status`
2. Wenn `needsSetup: true` → Setup-Wizard wird angezeigt
3. Benutzer gibt Admin-Daten ein (E-Mail, Passwort, Name)
4. `POST /api/setup/admin` erstellt ersten Admin
5. App startet normal mit eingeloggtem Admin

**Sicherheit:**
- Setup nur möglich wenn keine Admins existieren
- Passwort-Anforderungen: min. 8 Zeichen, Großbuchstabe, Zahl
- Blockiert nach erstem Setup

### D) TypeScript für Frontend eingeführt
**Neue Dateien:**
- `frontend/tsconfig.json` - TypeScript-Konfiguration
- `frontend/src/types/index.ts` - Typdefinitionen
- `frontend/src/theme.ts` - Theme mit Typen
- `frontend/src/api.ts` - Typisierte API
- `frontend/src/AuthContext.tsx` - Typisierter Context
- `frontend/src/App.tsx` - Typisierte Haupt-App
- `frontend/src/index.tsx` - Entry Point

**Hinweis:** Bestehende `.js` Komponenten funktionieren weiterhin (allowJs: true).
Migration zu `.tsx` kann schrittweise erfolgen.

### E) Tests hinzugefügt
**Backend:** `backend/tests/setup.test.js`
- Tests für Setup-Status-Abfrage
- Tests für Admin-Erstellung
- Tests für Validierung (Passwort, E-Mail)

**Frontend:** `frontend/src/components/SetupWizard.test.tsx`
- Rendering-Tests
- Validierungs-Tests
- API-Interaktions-Tests

### F) Datenbank-Schema aktualisiert
**Datei:** `backend/database/schema.sql`
- Standard-Admin entfernt (Setup-Wizard übernimmt)
- Votes-Tabelle integriert
- `CREATE TABLE IF NOT EXISTS` für Idempotenz
- Bessere Dokumentation

---

## 3. API-Endpunkte

### Setup (NEU)
| Methode | Endpunkt | Zweck |
|---------|----------|-------|
| GET | /api/setup/status | Prüft ob Setup nötig ist |
| POST | /api/setup/admin | Erstellt ersten Admin |

### Authentifizierung
| Methode | Endpunkt | Zweck |
|---------|----------|-------|
| POST | /api/auth/register | Benutzer registrieren |
| POST | /api/auth/login | Login |
| POST | /api/auth/register-moderator | Moderator erstellen (Admin) |

### Meldungen
| Methode | Endpunkt | Zweck |
|---------|----------|-------|
| GET | /api/reports | Alle genehmigten Meldungen |
| GET | /api/reports/pending | Alle Meldungen (Moderator) |
| GET | /api/reports/:id | Einzelne Meldung |
| GET | /api/reports/:id/confidential | Mit Kontaktdaten (Moderator) |
| POST | /api/reports | Neue Meldung erstellen |
| PATCH | /api/reports/:id/status | Status umschalten (Moderator) |

### Abstimmungen & Kommentare
| Methode | Endpunkt | Zweck |
|---------|----------|-------|
| POST | /api/votes/:id/vote | Abstimmen |
| DELETE | /api/votes/:id/vote | Stimme entfernen |
| GET/POST/PUT/DELETE | /api/reports/:id/comments | Kommentare |

---

## 4. Projektstruktur (aktualisiert)

```
Buerokratie/
├── backend/
│   ├── app.js                    # Express-App (CORS verbessert)
│   ├── server.js
│   ├── config/db.js
│   ├── database/schema.sql       # Aktualisiert, ohne Standard-Admin
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── setup.js              # NEU: Setup-Wizard API
│   │   ├── auth.js
│   │   ├── reports.js
│   │   ├── categories.js
│   │   ├── votes.js
│   │   ├── comments.js
│   │   └── wzCategories.js
│   ├── tests/
│   │   ├── setup.test.js         # NEU
│   │   ├── auth.test.js
│   │   └── ...
│   ├── .env.example              # Verbessert
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # NEU: TypeScript mit Setup-Integration
│   │   ├── AuthContext.tsx       # NEU: TypeScript
│   │   ├── api.ts                # NEU: TypeScript mit Interceptors
│   │   ├── theme.ts              # NEU: Zentrales Farbsystem
│   │   ├── types/index.ts        # NEU: TypeScript-Typen
│   │   ├── index.tsx             # NEU
│   │   ├── index.css             # Vereinfacht
│   │   ├── components/
│   │   │   ├── SetupWizard.tsx   # NEU
│   │   │   ├── SetupWizard.test.tsx # NEU
│   │   │   └── ... (bestehende .js Dateien)
│   │   └── pages/
│   ├── tsconfig.json             # NEU
│   ├── .env.example              # Verbessert
│   └── package.json              # TypeScript-Dependencies
│
├── Claude.md                     # Diese Datei
└── README.md
```

---

## 5. Entwicklung starten

### Backend
```bash
cd backend
cp .env.example .env
# .env anpassen (DB-Credentials, JWT_SECRET)
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
# REACT_APP_API_BASE_URL setzen (für Entwicklung: http://localhost:5000)
npm install
npm start
```

### Datenbank initialisieren
```bash
mysql -u root -p < backend/database/schema.sql
```

### Erster Start
1. Anwendung öffnen: http://localhost:3000
2. Setup-Wizard erscheint automatisch
3. Admin-Account erstellen
4. Anwendung ist bereit

---

## 6. Offene Aufgaben

### Erledigt ✓
- [x] Farbsystem zentralisiert (theme.ts)
- [x] CORS/API-Kommunikation verbessert
- [x] Admin-Setup-Wizard erstellt
- [x] TypeScript für Frontend eingeführt
- [x] Tests für Setup hinzugefügt
- [x] Datenbank-Schema aktualisiert

### Ausstehend (optional)
- [ ] TypeScript für Backend (kann später erfolgen)
- [ ] Bestehende .js Komponenten zu .tsx migrieren
- [ ] Shared Components extrahieren (ReportCard, etc.)
- [ ] E2E-Tests mit Cypress/Playwright
- [ ] Performance-Optimierung (Lazy Loading)
- [ ] Accessibility-Audit

---

## 7. Hinweise für Entwickler

### TypeScript
- Neue Komponenten als `.tsx` erstellen
- Typen in `types/index.ts` definieren
- Theme-Farben aus `theme.ts` importieren

### Farben verwenden
```typescript
import { colors } from '../theme';

const StyledDiv = styled.div`
  color: ${colors.primary};
  background: ${colors.background};
`;
```

### API-Aufrufe
```typescript
import api, { getErrorMessage } from '../api';

try {
  const response = await api.get('/api/reports');
  // Token wird automatisch hinzugefügt
} catch (error) {
  console.error(getErrorMessage(error));
}
```

---

*Erstellt am: 2026-01-25*
*Letzte Aktualisierung: 2026-01-25*
*Status: Änderungen implementiert, bereit für Review*
