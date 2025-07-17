# Installation und Setup - BVMW Bürokratieabbau-Plattform

## Schritt-für-Schritt-Anleitung für Mac

### 1. Voraussetzungen installieren

#### Homebrew installieren (falls noch nicht vorhanden)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Node.js installieren
```bash
brew install node@18
echo 'export PATH="/usr/local/opt/node@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### MySQL installieren
```bash
brew install mysql
brew services start mysql
```

#### MySQL sichern
```bash
mysql_secure_installation
```

### 2. Datenbank einrichten

#### MySQL-Konsole öffnen
```bash
mysql -u root -p
```

#### Datenbank und Benutzer erstellen
```sql
CREATE DATABASE buerokratieabbau;
CREATE USER 'bvmw_user'@'localhost' IDENTIFIED BY 'BvmwSecurePassword123';
GRANT ALL PRIVILEGES ON buerokratieabbau.* TO 'bvmw_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Schema importieren
```bash
mysql -u bvmw_user -p buerokratieabbau < backend/database/schema.sql
```

### 3. Backend starten

```bash
cd backend
npm install
npm run dev
```

Der Backend-Server läuft nun auf http://localhost:5000

### 4. Frontend starten

Öffnen Sie ein neues Terminal-Fenster:

```bash
cd frontend
npm install
npm start
```

Das Frontend läuft nun auf http://localhost:3000

### 5. Testen

Öffnen Sie http://localhost:3000 in Ihrem Browser und testen Sie:

1. Navigation zwischen "Übersicht" und "Hemmnis melden"
2. Erstellen einer neuen Meldung
3. Anzeige der Meldungen in der Übersicht
4. Filter- und Suchfunktionen

### Fehlerbehebung

#### MySQL-Verbindungsprobleme
```bash
# MySQL-Status prüfen
brew services list | grep mysql

# MySQL neu starten
brew services restart mysql
```

#### Port bereits in Verwendung
```bash
# Prozess finden, der Port 5000 verwendet
lsof -i :5000

# Prozess beenden (PID durch tatsächliche Prozess-ID ersetzen)
kill -9 <PID>
```

#### Node.js-Versionsprobleme
```bash
# Node.js-Version prüfen
node -v

# Falls falsche Version, Node.js neu verlinken
brew unlink node
brew link --overwrite node@18
```

