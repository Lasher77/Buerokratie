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
# Passen Sie die Werte in der .env-Datei an Ihre Umgebung an

# Datenbank einrichten
# Führen Sie das SQL-Script aus
mysql -u BENUTZERNAME -p < database/schema.sql

# Server starten
npm run dev
```

2. **Frontend einrichten**

```bash
# In das Frontend-Verzeichnis wechseln
cd frontend

# Abhängigkeiten installieren
npm install

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
DB_HOST=localhost
DB_USER=bvmw_user
DB_PASSWORD=IhrSicheresPasswort
DB_NAME=buerokratieabbau
JWT_SECRET=IhrGeheimesJWTToken
```

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

## Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklungsteam.

## Lizenz

Dieses Projekt ist urheberrechtlich geschützt und Eigentum des BVMW.

