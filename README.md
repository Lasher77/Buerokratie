# BVMW Bürokratieabbau-Plattform

Eine Plattform für den Bundesverband Mittelständische Wirtschaft (BVMW), auf der mittelständische Unternehmen Fälle von fehlgeleiteter Bürokratie eintragen und bewerten können.

## Inhaltsverzeichnis

- [Schnellstart](#schnellstart)
- [Installation Test-Umgebung](#installation-test-umgebung)
- [Installation Produktion](#installation-produktion)
- [Konfiguration](#konfiguration)
- [Funktionen](#funktionen)
- [API-Dokumentation](#api-dokumentation)
- [Entwicklung](#entwicklung)
- [Tests](#tests)

---

## Schnellstart

### Voraussetzungen

- **Node.js** v18.x oder höher
- **MySQL** v8.x
- **npm** (wird mit Node.js installiert)

### In 5 Minuten starten

```bash
# 1. Repository klonen
git clone <repository-url>
cd Buerokratie

# 2. Datenbank einrichten
mysql -u root -p < backend/database/schema.sql

# 3. Backend starten
cd backend
cp .env.example .env
# .env bearbeiten: DB_PASSWORD und JWT_SECRET setzen
npm install
npm run dev

# 4. Frontend starten (neues Terminal)
cd frontend
cp .env.example .env
npm install
npm start

# 5. Browser öffnen: http://localhost:3000
# Der Setup-Wizard führt durch die Erstellung des ersten Administrators
```

---

## Installation Test-Umgebung

### 1. Datenbank einrichten

```bash
# MySQL-Konsole öffnen
mysql -u root -p

# Datenbank und Benutzer erstellen
CREATE DATABASE buerokratieabbau CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bvmw_user'@'localhost' IDENTIFIED BY 'IhrTestPasswort';
GRANT ALL PRIVILEGES ON buerokratieabbau.* TO 'bvmw_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Schema importieren
mysql -u bvmw_user -p buerokratieabbau < backend/database/schema.sql
```

### 2. Backend konfigurieren

```bash
cd backend
cp .env.example .env
```

Bearbeiten Sie `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Datenbank
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=bvmw_user
DB_PASSWORD=IhrTestPasswort
DB_NAME=buerokratieabbau

# JWT (für Tests beliebiger String)
JWT_SECRET=mein-test-secret-min-32-zeichen-lang
JWT_EXPIRES_IN=24h

# CORS (Frontend-URL)
ALLOWED_ORIGINS=http://localhost:3000

# HTTPS in Test deaktivieren
ENFORCE_HTTPS=false
```

### 3. Backend starten

```bash
cd backend
npm install
npm run dev
```

Das Backend läuft nun auf `http://localhost:5000`.

### 4. Frontend konfigurieren

```bash
cd frontend
cp .env.example .env
```

Bearbeiten Sie `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

### 5. Frontend starten

```bash
cd frontend
npm install
npm start
```

Das Frontend läuft nun auf `http://localhost:3000`.

### 6. Erster Start - Setup-Wizard

Beim ersten Aufruf von `http://localhost:3000` erscheint automatisch der **Setup-Wizard**:

1. Geben Sie die E-Mail-Adresse des Administrators ein
2. Wählen Sie ein sicheres Passwort (min. 8 Zeichen, Großbuchstabe, Zahl)
3. Optional: Name eingeben
4. Klicken Sie auf "Administrator erstellen"

Die Anwendung ist nun einsatzbereit.

---

## Installation Produktion

### Empfohlene Architektur

```
[Browser] → [Cloudflare/Nginx] → [Express Backend :5000]
                                        ↓
                                 [MySQL Datenbank]
```

Das Backend liefert sowohl die API als auch das Frontend aus (Same-Origin).

### Schritt-für-Schritt Anleitung

#### 1. Server vorbereiten

```bash
# Node.js installieren (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL installieren
sudo apt-get install -y mysql-server
sudo mysql_secure_installation
```

#### 2. Datenbank einrichten

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE buerokratieabbau CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bvmw_prod'@'localhost' IDENTIFIED BY 'SICHERES_PASSWORT_HIER';
GRANT ALL PRIVILEGES ON buerokratieabbau.* TO 'bvmw_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
mysql -u bvmw_prod -p buerokratieabbau < backend/database/schema.sql
```

#### 3. Anwendung deployen

```bash
# Repository klonen
cd /var/www
git clone <repository-url> buerokratie
cd buerokratie

# Frontend bauen
cd frontend
npm ci
npm run build
cd ..

# Backend konfigurieren
cd backend
cp .env.example .env
nano .env  # Siehe Konfiguration unten
```

#### 4. Produktions-Konfiguration

Bearbeiten Sie `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=production

# Datenbank
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=bvmw_prod
DB_PASSWORD=SICHERES_PASSWORT_HIER
DB_NAME=buerokratieabbau

# JWT - Sicheren Schlüssel generieren:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=IHR_GENERIERTER_64_BYTE_HEX_STRING
JWT_EXPIRES_IN=24h

# CORS - Ihre Domain
ALLOWED_ORIGINS=https://ihre-domain.de

# HTTPS erzwingen
ENFORCE_HTTPS=true
```

#### 5. Backend als Dienst einrichten (systemd)

Erstellen Sie `/etc/systemd/system/buerokratie.service`:

```ini
[Unit]
Description=BVMW Bürokratieabbau-Plattform
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/buerokratie/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Dienst aktivieren und starten
sudo systemctl daemon-reload
sudo systemctl enable buerokratie
sudo systemctl start buerokratie

# Status prüfen
sudo systemctl status buerokratie
```

#### 6. Nginx als Reverse-Proxy (optional)

Falls Sie Nginx verwenden möchten:

```nginx
server {
    listen 80;
    server_name ihre-domain.de;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ihre-domain.de;

    ssl_certificate /etc/letsencrypt/live/ihre-domain.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ihre-domain.de/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 7. Cloudflare-Setup (Alternative zu Nginx)

1. DNS-Eintrag erstellen (A-Record auf Server-IP, Proxy aktiviert)
2. SSL/TLS auf "Full (strict)" setzen
3. "Always Use HTTPS" aktivieren
4. Im Backend `ENFORCE_HTTPS=true` setzen

#### 8. Erster Produktiv-Start

1. Browser öffnen: `https://ihre-domain.de`
2. Setup-Wizard erscheint automatisch
3. Administrator-Account erstellen
4. Anwendung ist bereit

#### 9. Health-Check

```bash
curl https://ihre-domain.de/health
# Erwartete Antwort: {"ok":true}
```

---

## Konfiguration

### Backend-Umgebungsvariablen

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `PORT` | Server-Port | `5000` |
| `NODE_ENV` | Umgebung | `development` oder `production` |
| `DB_HOST` | Datenbank-Host | `127.0.0.1` |
| `DB_PORT` | Datenbank-Port | `3306` |
| `DB_USER` | Datenbank-Benutzer | `bvmw_user` |
| `DB_PASSWORD` | Datenbank-Passwort | `geheim` |
| `DB_NAME` | Datenbank-Name | `buerokratieabbau` |
| `JWT_SECRET` | Token-Signierung | `min-32-zeichen` |
| `JWT_EXPIRES_IN` | Token-Gültigkeit | `24h` |
| `ALLOWED_ORIGINS` | Erlaubte Origins (komma-getrennt) | `https://domain.de` |
| `ENFORCE_HTTPS` | HTTPS erzwingen | `true` oder `false` |

### Frontend-Umgebungsvariablen

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `REACT_APP_API_BASE_URL` | Backend-URL | `http://localhost:5000` (Dev) oder leer (Prod) |

**Hinweis:** In Produktion mit Same-Origin-Setup kann `REACT_APP_API_BASE_URL` leer bleiben.

---

## Funktionen

### Für Benutzer
- **Meldungen erstellen** - Bürokratische Hemmnisse mit Details erfassen
- **Anonym melden** - Optional ohne Kontaktdaten
- **Abstimmen** - "Das betrifft mich auch" für bestehende Meldungen
- **Suchen & Filtern** - Nach Kategorie, Stichwort oder WZ-Branche

### Für Moderatoren
- **Meldungen prüfen** - Freigeben oder ablehnen
- **Kommentare** - Gesetzesbezüge und Erläuterungen hinzufügen
- **Kontaktdaten einsehen** - Bei nicht-anonymen Meldungen

### Für Administratoren
- **Moderatoren anlegen** - Neue Moderator-Accounts erstellen
- **Alle Moderator-Funktionen**

### Kategorien

1. Steuer
2. Dokumentationspflicht
3. Rechnungswesen
4. Statistiken
5. Sozialversicherungen
6. Datenschutz
7. Arbeitsschutz
8. Branchenspezifisches

---

## API-Dokumentation

### Setup

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| `GET` | `/api/setup/status` | Prüft ob Setup nötig ist |
| `POST` | `/api/setup/admin` | Erstellt ersten Administrator |

### Authentifizierung

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| `POST` | `/api/auth/register` | Benutzer registrieren |
| `POST` | `/api/auth/login` | Anmelden |
| `POST` | `/api/auth/register-moderator` | Moderator anlegen (Admin) |

### Meldungen

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| `GET` | `/api/reports` | Alle freigegebenen Meldungen |
| `GET` | `/api/reports/pending` | Alle Meldungen (Moderator) |
| `GET` | `/api/reports/:id` | Einzelne Meldung |
| `GET` | `/api/reports/:id/confidential` | Mit Kontaktdaten (Moderator) |
| `POST` | `/api/reports` | Neue Meldung erstellen |
| `PATCH` | `/api/reports/:id/status` | Status ändern (Moderator) |
| `GET` | `/api/reports/category/:id` | Nach Kategorie filtern |
| `GET` | `/api/reports/search/:query` | Suchen |

### Abstimmungen

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| `POST` | `/api/votes/:reportId/vote` | Abstimmen |
| `DELETE` | `/api/votes/:reportId/vote` | Stimme entfernen |
| `GET` | `/api/votes/:reportId/vote-status` | Status prüfen |

### Kommentare

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| `GET` | `/api/reports/:id/comments` | Kommentare abrufen |
| `POST` | `/api/reports/:id/comments` | Kommentar erstellen (Moderator) |
| `PUT` | `/api/reports/:reportId/comments/:commentId` | Bearbeiten |
| `DELETE` | `/api/reports/:reportId/comments/:commentId` | Löschen |

### Kategorien

| Methode | Endpunkt | Beschreibung |
|---------|----------|--------------|
| `GET` | `/api/categories` | Alle Kategorien |
| `GET` | `/api/wz-categories` | WZ-Oberkategorien |

### Authentifizierung

Geschützte Endpunkte erfordern den Header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Entwicklung

### Projektstruktur

```
Buerokratie/
├── backend/
│   ├── app.js                 # Express-App
│   ├── server.js              # Server-Start
│   ├── config/db.js           # Datenbank-Verbindung
│   ├── database/schema.sql    # DB-Schema
│   ├── middleware/auth.js     # JWT-Middleware
│   ├── routes/                # API-Endpunkte
│   │   ├── setup.js           # Setup-Wizard
│   │   ├── auth.js            # Authentifizierung
│   │   ├── reports.js         # Meldungen
│   │   ├── votes.js           # Abstimmungen
│   │   ├── comments.js        # Kommentare
│   │   └── categories.js      # Kategorien
│   └── tests/                 # Backend-Tests
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Haupt-App (TypeScript)
│   │   ├── AuthContext.tsx    # Auth-State
│   │   ├── api.ts             # API-Client
│   │   ├── theme.ts           # Farbsystem
│   │   ├── types/             # TypeScript-Typen
│   │   ├── components/        # React-Komponenten
│   │   │   ├── SetupWizard.tsx
│   │   │   ├── ReportForm.js
│   │   │   ├── ReportList.js
│   │   │   └── ...
│   │   └── pages/             # Seiten-Komponenten
│   ├── tsconfig.json          # TypeScript-Config
│   └── package.json
│
├── Claude.md                  # Entwickler-Dokumentation
└── README.md                  # Diese Datei
```

### Tech-Stack

**Backend:**
- Node.js + Express
- MySQL + mysql2
- JWT (jsonwebtoken)
- bcrypt, helmet, cors, express-validator

**Frontend:**
- React 18 + TypeScript
- React Router v6
- styled-components
- Formik + Yup
- Axios

### Farbsystem

Alle Farben sind in `frontend/src/theme.ts` definiert:

```typescript
import { colors } from './theme';

// Verwendung in styled-components:
const Button = styled.button`
  background: ${colors.primary};      // #E30613 (BVMW Rot)
  color: ${colors.background};        // #FFFFFF

  &:hover {
    background: ${colors.primaryDark}; // #b20510
  }
`;
```

---

## Tests

### Backend-Tests

```bash
cd backend
npm test
```

### Frontend-Tests

```bash
cd frontend
npm test
```

### Manueller Test nach Installation

1. Health-Check: `GET /health` → `{"ok":true}`
2. Setup-Status: `GET /api/setup/status`
3. Admin erstellen über Setup-Wizard
4. Login testen
5. Meldung erstellen
6. Abstimmen

---

## Upgrade bestehender Installationen

Falls Sie von einer älteren Version upgraden:

```bash
# Neueste Version holen
git pull

# Backend-Abhängigkeiten aktualisieren
cd backend
npm install

# Frontend neu bauen
cd ../frontend
npm install
npm run build

# Dienst neustarten
sudo systemctl restart buerokratie
```

**Hinweis:** Das Datenbank-Schema verwendet `CREATE TABLE IF NOT EXISTS`, sodass keine manuellen Migrationen nötig sind.

---

## Support

Bei Fragen oder Problemen wenden Sie sich an das Entwicklungsteam.

## Lizenz

Dieses Projekt ist proprietär. Eine Weitergabe oder Änderung ist ohne ausdrückliche schriftliche Genehmigung des BVMW nicht gestattet.
