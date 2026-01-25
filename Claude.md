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
| Frontend | React 18.2, React Router v6, styled-components, Formik + Yup, Axios |
| Backend | Node.js, Express 4.18, mysql2, JWT, bcrypt, express-validator, Helmet |
| Datenbank | MySQL 8.x |

---

## 2. Farbdesign-Analyse

### Aktuell verwendete Farben
```css
/* In index.css und Komponenten definiert */
--bvmw-red: #E30613          /* Primärfarbe - BVMW Rot */
--bvmw-primary-dark: #b20510 /* Dunkleres Rot für Hover/Footer */
--bvmw-gray: #58585A         /* BVMW Grau */
--bvmw-red-light: #f9d8dc    /* Helles Rot für Hintergrund/Focus */
```

### Zusätzliche Farben in Komponenten
| Farbe | Hex | Verwendung |
|-------|-----|------------|
| Hellblau | #009FE3 | Kategorie "Statistiken" |
| Grün | #95C11F | Kategorie "Sozialversicherungen" |
| Gelb | #FFED00 | Kategorie "Datenschutz" |
| Orange | #F39200 | Kategorie "Arbeitsschutz" |
| Lila | #A1006B | Kategorie "Branchenspezifisches" |
| Erfolgsgrün | #4CAF50 | Erfolgsmeldungen, Voted-State |

### Vergleich mit bvmw.de
Die BVMW-Website verwendet ebenfalls Rot als Primärfarbe. Das verwendete `#E30613` scheint korrekt zu sein. Die genauen Brand-Guidelines sind nur für Mitglieder im Download-Bereich verfügbar.

**Beobachtungen:**
1. Die Farbdefinitionen sind **nicht zentralisiert** - sie werden in mehreren Dateien wiederholt
2. CSS-Variablen in `index.css` werden teilweise **nicht genutzt** (stattdessen hardcoded)
3. Die Kategorie-Farben sind an **mehreren Stellen dupliziert** (ReportList.js, ReportDetail.js)

---

## 3. Backend-Frontend Kommunikation

### API-Konfiguration
```javascript
// frontend/src/api.js
export const API_BASE = process.env.REACT_APP_API_BASE_URL || '';
```
- Bei Same-Origin-Deployment (Produktion): `API_BASE` ist leer
- Bei lokaler Entwicklung: `http://localhost:5000`

### Authentifizierung
- **JWT-Token** wird bei Login erstellt und in `localStorage` gespeichert
- **AuthContext** verwaltet User-State und automatischen Logout bei Token-Ablauf
- Token wird als `Authorization: Bearer <TOKEN>` Header gesendet

### Voting-System
- **Session-basiert** mit UUID in `x-session-id` Header
- Fallback auf IP/User-Agent wenn keine Session-ID vorhanden
- Session-ID wird in `localStorage` persistiert

### API-Endpunkte
| Methode | Endpunkt | Zweck |
|---------|----------|-------|
| GET | /api/reports | Alle genehmigten Meldungen |
| GET | /api/reports/pending | Alle Meldungen (Moderator) |
| GET | /api/reports/:id | Einzelne Meldung |
| GET | /api/reports/:id/confidential | Mit Kontaktdaten (Moderator) |
| POST | /api/reports | Neue Meldung erstellen |
| PATCH | /api/reports/:id/status | Status umschalten (Moderator) |
| POST | /api/votes/:id/vote | Abstimmen |
| DELETE | /api/votes/:id/vote | Stimme entfernen |
| GET/POST/PUT/DELETE | /api/reports/:id/comments | Kommentare (Moderator) |

---

## 4. Code-Review Erkenntnisse

### Positiv
- Gute Trennung von Concerns (Middleware, Routes, Komponenten)
- Validierung auf beiden Seiten (Yup im Frontend, express-validator im Backend)
- Security-Headers mit Helmet
- HTTPS-Enforcement in Produktion
- Rollenbasierte Zugriffskontrolle

### Verbesserungspotential

#### A) Farbmanagement
- **Problem:** Farben sind hardcoded an ~15+ Stellen
- **Lösung:** Zentrale Theme-Datei mit styled-components ThemeProvider

#### B) Code-Duplizierung
- **Problem:** ReportCard-Styling dupliziert in ReportList.js und ReportDetail.js
- **Problem:** Kategorie-Farb-Mapping dupliziert
- **Lösung:** Shared Components/Utilities

#### C) API-Fehlerbehandlung
- **Problem:** Inkonsistente Fehlerbehandlung im Frontend
- **Lösung:** Zentrale Error-Handler/Interceptors

#### D) TypeScript
- **Problem:** Keine Type-Safety (reines JavaScript)
- **Lösung:** Migration zu TypeScript (mittelfristig)

#### E) State Management
- **Problem:** Prop Drilling, viele lokale States
- **Lösung:** Context oder State-Library für komplexere Fälle

---

## 5. Offene Fragen an den Auftraggeber

### Design & UX
1. Soll das Farbschema exakt dem BVMW Corporate Design entsprechen? Haben Sie Zugang zu den offiziellen Brand-Guidelines?
2. Sollen die Kategorie-Farben beibehalten werden oder angepasst werden?
3. Ist Mobile-First-Optimierung gewünscht?

### Funktionalität
4. Ist eine Suchfunktion über WZ-Kategorien gewünscht?
5. Sollen Benutzer ihre eigenen Meldungen bearbeiten/löschen können?
6. Ist eine E-Mail-Benachrichtigung bei Status-Änderungen gewünscht?

### Technisch
7. Soll TypeScript eingeführt werden?
8. Gibt es Performance-Anforderungen (z.B. erwartete Anzahl gleichzeitiger Nutzer)?
9. Ist eine Internationalisierung (i18n) geplant?

---

## 6. Nächste Schritte (Vorschläge)

1. **Farbsystem zentralisieren** - Theme-Datei erstellen
2. **Shared Components** - ReportCard, StatusBadge, etc. extrahieren
3. **API-Layer verbessern** - Error-Interceptors, Loading-States
4. **Code-Qualität** - ESLint-Konfiguration prüfen, Konsistenz erhöhen
5. **Accessibility** - ARIA-Labels, Kontraste prüfen
6. **Performance** - Bundle-Size analysieren, Lazy Loading

---

*Erstellt am: 2026-01-25*
*Status: Review & Diskussion mit Auftraggeber*
