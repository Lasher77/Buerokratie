# BVMW Bürokratieabbau-Plattform

Eine Plattform für den Bundesverband Mittelständische Wirtschaft (BVMW), auf der mittelständische Unternehmen Fälle von fehlgeleiteter Bürokratie eintragen und bewerten können.

## Projektstruktur

Das Projekt besteht aus zwei Hauptteilen:

1. **Backend**: Node.js mit Express und MySQL
2. **Frontend**: React.js mit styled-components

## Schnellstart

### Voraussetzungen

- Node.js (v18.x empfohlen)
- MySQL (v8.x empfohlen)
- npm oder yarn

### Installation und Start

1. **Backend einrichten**

```bash
# In das Backend-Verzeichnis wechseln
cd backend

# Abhängigkeiten installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env
# Passen Sie die Werte in der .env-Datei an Ihre Umgebung an

# Datenbank einrichten
# Basisschema importieren
mysql -u BENUTZERNAME -p < database/schema.sql

# Das Basisschema legt auch die Tabelle `comments` an

# Erweiterung für das Bewertungssystem (legt die Tabelle `votes` an)
mysql -u BENUTZERNAME -p buerokratieabbau < ../database_votes_extension.sql

# Haben Sie das Schema vor der Einführung der Kommentarfunktion installiert,
# führen Sie zusaetzlich folgendes Skript aus:
mysql -u BENUTZERNAME -p buerokratieabbau < ../database_comments_extension.sql

# Server starten
npm run dev
```

2. **Frontend einrichten**

```bash
# In das Frontend-Verzeichnis wechseln
cd frontend

# Abhängigkeiten installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env
# Setzen Sie die Adresse des Backends in `REACT_APP_API_BASE_URL`

# Entwicklungsserver starten
npm start
```

Die Anwendung ist nun unter http://localhost:3000 verfügbar.

## Funktionen

- **Meldung bürokratischer Hemmnisse**: Formular zur Erfassung von Bürokratiefällen
- **Kategorisierung**: Manuelle Auswahl der Kategorie (später KI-basiert)
- **Übersicht**: Filterbare Liste aller eingetragenen Fälle
- **Detailansicht**: Detaillierte Informationen zu einzelnen Meldungen

## Kategorien

Die Plattform verwendet folgende vordefinierte Kategorien:

1. **Steuer** - Steuerliche Vorschriften und Meldepflichten
2. **Dokumentationspflicht** - Pflichten zur Dokumentation und Aufbewahrung
3. **Rechnungswesen** - Buchführung, Bilanzierung und Jahresabschlüsse
4. **Statistiken** - Statistische Meldepflichten und Erhebungen
5. **Sozialversicherungen** - Meldeverfahren und Beitragsnachweise
6. **Datenschutz** - DSGVO und andere Datenschutzanforderungen
7. **Arbeitsschutz** - Arbeitsschutzvorschriften und Gefährdungsbeurteilungen
8. **Branchenspezifisches** - Branchenspezifische Vorschriften und Auflagen

## Kommentarfunktion

Die Plattform verfügt über eine Tabelle `comments`, in der Moderatoren oder
Administratoren Ergänzungen zu gemeldeten Fällen hinterlegen können.
Jeder Kommentar enthält optional einen Gesetzesbezug (`law_reference`) und
wird einem Benutzer sowie einer Meldung zugeordnet.

**Spalten der Tabelle**

- `id` – Primärschlüssel
- `report_id` – Referenz auf die betroffene Meldung
- `user_id` – Referenz auf den Autor (nur Moderator/Admin)
- `law_reference` – optionale Angabe des zugrundeliegenden Gesetzes
- `text` – eigentlicher Kommentar
- `created_at` – Zeitstempel der Erstellung

Authentifizierte Moderatoren oder Administratoren erhalten ihr JWT über
`POST /api/auth/login` (oder `POST /api/auth/register` für neue Accounts).
Das Token wird beim Anlegen eines Kommentars an
`POST /api/reports/:id/comments` im Header `Authorization: Bearer <TOKEN>`
gesendet. Moderatoren können bestehende Kommentare zudem über
`PUT /api/reports/:reportId/comments/:commentId` bearbeiten und über
`DELETE /api/reports/:reportId/comments/:commentId` entfernen.
Normale Benutzer dürfen zwar keine Kommentare erstellen, können sie
aber über `GET /api/reports/:id/comments` ansehen. In der Meldungsübersicht
wird anhand eines Sprechblasensymbols ("💬") angezeigt, ob zu einer Meldung
bereits Kommentare vorliegen.

### Moderatoren-Workflow

1. **Moderator anlegen:** Nach dem Login als Administrator die Seite
   `/register-moderator` aufrufen und die Daten des neuen Moderators
   eingeben. Das Admin-Token wird automatisch übertragen.
2. **Moderator-Login:** Moderatoren melden sich über `/login` an. Das
   ausgegebene JWT wird im Browser gespeichert.
3. **Kommentieren:** In der Detailansicht einer Meldung befindet sich
   unterhalb der Beschreibung ein Eingabefeld. Angemeldete Moderatoren
   und Administratoren können hier Kommentare hinterlegen.

Für diese Erweiterung sind keine zusätzlichen Umgebungsvariablen nötig.

## Technologie-Stack

### Backend

- **Node.js**: JavaScript-Laufzeitumgebung
- **Express**: Web-Framework für Node.js
- **MySQL**: Relationale Datenbank
- **mysql2**: MySQL-Client für Node.js
- **dotenv**: Umgebungsvariablen-Management
- **cors**: Cross-Origin Resource Sharing
- **helmet**: Sicherheits-Middleware
- **express-validator**: Validierung von Anfragen

### Frontend

- **React**: JavaScript-Bibliothek für Benutzeroberflächen
- **React Router**: Routing für React-Anwendungen
- **Axios**: HTTP-Client für API-Anfragen
- **Formik**: Formular-Management
- **Yup**: Schema-Validierung
- **styled-components**: CSS-in-JS-Styling

## Entwicklung

### Backend-Entwicklung

- API-Endpunkte befinden sich im Verzeichnis `backend/routes/`
- Datenbankverbindung wird in `backend/config/db.js` konfiguriert
- Datenbankschema ist in `backend/database/schema.sql` definiert

### Frontend-Entwicklung

- Komponenten befinden sich im Verzeichnis `frontend/src/components/`
- Routing wird in `frontend/src/App.js` konfiguriert
- Styling erfolgt mit styled-components direkt in den Komponentendateien

## Konfiguration

### Backend-Konfiguration

Passen Sie die Datei `backend/.env` an Ihre Umgebung an:

```
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
DB_HOST=127.0.0.1
DB_USER=bvmw_user
DB_PASSWORD=changeme
DB_NAME=buerokratieabbau
JWT_SECRET=changeme
JWT_EXPIRES_IN=24h
```

**Wichtig:** Ersetzen Sie die Platzhalter `changeme` in `DB_PASSWORD` und `JWT_SECRET` durch sichere, individuelle Werte. Für `DB_HOST` wird `127.0.0.1` empfohlen, da dies zuverlässig auf die lokale Netzwerkschnittstelle zeigt und DNS- oder IPv6-Auflösungen von `localhost` umgeht.

`JWT_EXPIRES_IN` legt fest, wie lange neu ausgestellte JSON Web Tokens gültig sind (Standard: 24 Stunden).

`ALLOWED_ORIGINS` legt fest, welche Urspruenge beim Aufruf der API zugelassen sind.
Mehrere Eintraege koennen komma-getrennt angegeben werden.

### MySQL-Setup

1. Erstellen Sie eine neue Datenbank:
```sql
CREATE DATABASE buerokratieabbau;
```

2. Erstellen Sie einen Benutzer:
```sql
CREATE USER 'bvmw_user'@'localhost' IDENTIFIED BY 'IhrSicheresPasswort';
GRANT ALL PRIVILEGES ON buerokratieabbau.* TO 'bvmw_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Importieren Sie das Schema:
```bash
mysql -u bvmw_user -p buerokratieabbau < backend/database/schema.sql

# Enthält auch die Tabelle `comments`

# Erweiterung für das Bewertungssystem einspielen
mysql -u bvmw_user -p buerokratieabbau < database_votes_extension.sql
```

## API-Endpunkte

### Kategorien
- `GET /api/categories` - Alle Kategorien abrufen
- `GET /api/categories/:id` - Eine Kategorie nach ID abrufen

### Meldungen
- `GET /api/reports` - Alle Meldungen abrufen
- `POST /api/reports` - Neue Meldung erstellen
- `GET /api/reports/:id` - Eine Meldung nach ID abrufen
- `GET /api/reports/category/:categoryId` - Meldungen nach Kategorie filtern
- `GET /api/reports/search/:query` - Meldungen durchsuchen

### Kommentare
- `GET /api/reports/:id/comments` - Kommentare zu einer Meldung abrufen
- `POST /api/reports/:id/comments` - Kommentar zu einer Meldung erstellen (nur Moderator/Admin)
- `PUT /api/reports/:reportId/comments/:commentId` - Kommentar bearbeiten (nur Moderator/Admin)
- `DELETE /api/reports/:reportId/comments/:commentId` - Kommentar löschen (nur Moderator/Admin)

### Authentifizierung
- `POST /api/auth/register` - Benutzer registrieren und JWT erhalten
- `POST /api/auth/login` - Mit E-Mail und Passwort anmelden

Senden Sie das ausgegebene Token bei geschützten Anfragen im Header:
`Authorization: Bearer <TOKEN>`

## Roadmap

1. **MVP (Aktuelle Version)**
   - Grundlegende Funktionalität mit manueller Kategorisierung
   - Einfache Benutzeroberfläche im BVMW-Design

2. **Version 2.0**
   - KI-basierte automatische Kategorisierung
   - Bewertungssystem für Meldungen
   - Erweiterte Statistiken und Dashboards


3. **Version 3.0**
   - Salesforce-Integration für Leadgenerierung
   - Automatische Dossier-Erstellung für politische Arbeit
   - Community-Features und Diskussionsmöglichkeiten

## Tests

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

## Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklungsteam.


## Lizenz

Dieses Projekt ist proprietaer. Eine Weitergabe oder Aenderung ist ohne ausdrueckliche schriftliche Genehmigung des BVMW nicht gestattet. Siehe die Datei LICENSE fuer Details.
