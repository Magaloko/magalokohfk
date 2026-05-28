# MAGALOKO von anderem PC öffnen — maximal sicher

**Empfehlung: Tailscale + Magic-Link-Auth.** Null öffentliche Angriffsfläche, doppelte Authentifizierung (Gerät + Login), 15 Min Setup, kostenlos.

---

## Was du brauchst

- 5-15 Min Zeit
- Dein Heim-PC wo MAGALOKO läuft
- Den zweiten PC wo du es öffnen willst
- E-Mail-Adresse (für Tailscale + Magic-Link)

---

## Schritt 1 — Tailscale auf beiden PCs installieren (10 Min)

### Auf dem MAGALOKO-Heim-PC (Windows)

1. Installer von https://tailscale.com/download/windows runterladen
2. Installer ausführen (Standard-Optionen)
3. Tailscale-Tray-Icon → „Login"
4. Mit Mail / Google / GitHub einloggen (welcher Anbieter ist egal — Hauptsache derselbe für beide PCs)
5. Dem Gerät einen Namen geben (z.B. „mago-pc")

### Auf dem zweiten PC

Gleicher Vorgang. Wichtig: **derselbe Tailscale-Account** wie auf dem Heim-PC. Dem zweiten Gerät einen anderen Namen geben (z.B. „mago-laptop").

### Verifizieren

Auf https://login.tailscale.com/admin/machines sind jetzt zwei Geräte gelistet. Jedes hat eine private IP wie `100.x.y.z` — die ist nur **innerhalb** deines Tailnets erreichbar.

---

## Schritt 2 — MAGALOKO-Server auf Tailscale-Interface binden (2 Min)

Bisher lauscht der Server nur auf `127.0.0.1:4177` (nur lokal). Damit dein zweiter Tailscale-PC ihn erreichen kann, muss er auf **alle Interfaces** lauschen — aber das ist im Tailscale-Modell sicher, weil außerhalb des Tailnets eh niemand hinkommt.

### Server starten mit Tailscale-Bindung

PowerShell auf dem Heim-PC:
```powershell
cd F:\JTL_Export\JTL_Export\magaloko
$env:HOST = "0.0.0.0"
node server.mjs
```

Server zeigt jetzt: `MAGALOKO running on http://0.0.0.0:4177`

### Tailscale-IP des Heim-PCs holen

PowerShell:
```powershell
tailscale ip -4
```

Output ist die Tailscale-IP, z.B. `100.83.45.12`.

### Test vom zweiten PC

Im Browser des zweiten PCs öffnen: `http://100.83.45.12:4177` — MAGALOKO erscheint.

**Achtung:** Im LAN ist der Server auch erreichbar (weil 0.0.0.0). Wenn du das nicht willst, gibt es zwei Optionen:

#### Option A — Windows-Firewall: Nur Tailscale erlauben

```powershell
# Block alles außer Tailscale-Interface
New-NetFirewallRule -DisplayName "MAGALOKO Tailscale only" `
  -Direction Inbound -Protocol TCP -LocalPort 4177 `
  -Action Allow -InterfaceAlias "Tailscale"

New-NetFirewallRule -DisplayName "MAGALOKO Block other" `
  -Direction Inbound -Protocol TCP -LocalPort 4177 `
  -Action Block
```

#### Option B — Server auf Tailscale-IP explizit binden

```powershell
$env:HOST = "100.83.45.12"  # deine Tailscale-IP einsetzen
node server.mjs
```

Lauscht dann ausschließlich auf der Tailscale-IP, LAN sieht nichts.

---

## Schritt 3 — Magic-Link-Auth aktivieren (5 Min)

Tailscale schützt dich auf der **Netzwerk-Ebene** (nur deine Geräte). Magic-Link schützt zusätzlich auf der **App-Ebene** (auch wenn jemand auf einem deiner Geräte sitzt — z.B. Familie — muss er sich einloggen).

### `config/auth.json` editieren

```json
{
  "requireAuth": true,
  "allowedEmails": ["deine-mail@beispiel.de"],
  "sessionSecret": "wird-automatisch-erzeugt",
  "smtp": {
    "host": "smtp-relay.brevo.com",
    "port": 587,
    "secure": false,
    "user": "deine-brevo-mail@beispiel.de",
    "pass": "DEIN_BREVO_SMTP_KEY",
    "from": "MAGALOKO <noreply@deinedomain.de>"
  },
  "publicUrl": "http://100.83.45.12:4177"
}
```

### nodemailer installieren (für SMTP)

```powershell
cd F:\JTL_Export\JTL_Export\magaloko
npm init -y
npm install nodemailer
```

### Server neu starten

```powershell
node server.mjs
```

Konsole zeigt: `Auth: AKTIV · zugelassene Mails: 1`

### Login-Flow

Im Browser auf dem zweiten PC: `http://100.83.45.12:4177` → wird umgeleitet zu `/login.html` → Mail eingeben → Magic-Link kommt in deine Inbox → klicken → eingeloggt. Session hält 30 Tage.

**Falls SMTP noch nicht eingerichtet**: Magic-Link wird in `magaloko/data/last-magic-link.txt` geschrieben — du musst den dort kopieren bis SMTP läuft.

---

## Schritt 4 — Server als Windows-Dienst (damit er immer läuft) (5 Min)

Damit MAGALOKO auch nach einem PC-Neustart läuft.

### Variante 1 — NSSM (einfachst)

1. NSSM herunterladen: https://nssm.cc/download → Win64-Version
2. `nssm.exe` nach `C:\Windows` oder PATH-Ordner kopieren
3. PowerShell als Admin:
   ```powershell
   nssm install MAGALOKO
   ```
4. Im Dialog:
   - **Path**: `C:\Program Files\nodejs\node.exe`
   - **Startup directory**: `F:\JTL_Export\JTL_Export\magaloko`
   - **Arguments**: `server.mjs`
   - **Tab „Details"**: Display Name `MAGALOKO`
   - **Tab „Log On"**: dein Windows-User (damit Datei-Zugriff funktioniert)
   - **Tab „Process"**: Priority `Below Normal`
   - **Tab „Environment"**: `HOST=0.0.0.0` (oder Tailscale-IP)
5. Klick „Install service"
6. PowerShell: `Start-Service MAGALOKO`

Status prüfen:
```powershell
Get-Service MAGALOKO
```

### Variante 2 — PM2 (mehr Features, npm-basiert)

```powershell
npm install -g pm2 pm2-windows-startup
cd F:\JTL_Export\JTL_Export\magaloko
$env:HOST = "0.0.0.0"
pm2 start server.mjs --name magaloko
pm2 save
pm2-startup install
```

Beide Varianten: nach PC-Neustart läuft MAGALOKO automatisch.

---

## Schritt 5 — Tailscale-Service auch automatisch starten

Tailscale installiert sich automatisch als Windows-Service. Verifizieren:
```powershell
Get-Service Tailscale
```

Sollte `Running` zeigen. Falls nicht:
```powershell
Set-Service Tailscale -StartupType Automatic
Start-Service Tailscale
```

---

## Optional aber empfohlen — Härtungs-Checkliste

### Server-Seite
- [ ] `config/auth.json` mit `requireAuth: true` aktiv
- [ ] `allowedEmails` enthält NUR deine eigene Adresse
- [ ] `data/audit.jsonl` enthält Logins (sollte automatisch sein)
- [ ] Tägliche Auto-Backups in `data/backups/` aktiv (passiert automatisch im Server-Cronjob)
- [ ] SMTP-Passwort/Brevo-Key sicher in `config/auth.json` (NICHT in `state.json`, NICHT im Backup)

### Tailscale-Seite
- [ ] Auf https://login.tailscale.com/admin/machines: **MFA aktivieren** (Auth-App wie Authy/1Password/Aegis)
- [ ] **Ungenutzte Geräte regelmäßig entfernen** — wenn du einen alten Laptop verkaufst, sofort aus dem Tailnet werfen
- [ ] **Tailscale-Logs prüfen** ab und zu — wer war wann verbunden

### Windows-Seite
- [ ] Windows-User mit **starkem Passwort** + Bitlocker auf der Platte mit MAGALOKO
- [ ] `data/` und `config/`-Ordner nur für deinen User lesbar:
  ```powershell
  icacls "F:\JTL_Export\JTL_Export\magaloko\data" /inheritance:r /grant:r "$env:USERNAME:(OI)(CI)F"
  icacls "F:\JTL_Export\JTL_Export\magaloko\config" /inheritance:r /grant:r "$env:USERNAME:(OI)(CI)F"
  ```

### App-Seite
- [ ] DeepSeek-API-Key NUR in sessionStorage (passiert automatisch in MAGALOKO)
- [ ] Backup-Download regelmäßig (1× pro Woche via ⋯-Menü)

---

## Wenn du später doch öffentlich (mit Domain) willst

Dann zusätzlich Cloudflare Tunnel anlegen (siehe [SETUP_TUNNEL.md](SETUP_TUNNEL.md)). **Aber**: dann Magic-Link-Auth + Rate-Limiting sind Pflicht, und ich würde noch Cloudflare Access vorschalten (kostenlos bis 50 Nutzer) — das ist eine zweite Login-Schicht die VOR dem Tunnel sitzt.

Tailscale ist trotzdem die ruhigste Lösung für „nur ich + 1-2 Geräte". Cloudflare ist eher für „auch Stephan oder Beate sollen mal reinschauen können".

---

## Quick-Reference

**Heim-PC starten**:
```powershell
# entweder als Service (NSSM/PM2) → läuft automatisch
# oder manuell:
$env:HOST = "0.0.0.0"
node F:\JTL_Export\JTL_Export\magaloko\server.mjs
```

**Tailscale-IP holen**:
```powershell
tailscale ip -4
```

**Vom 2. PC öffnen**:
- Browser → `http://<tailscale-ip>:4177`
- Login mit Magic-Link
- Fertig

**Session-Cookie löschen falls Probleme**:
- Browser DevTools → Application → Cookies → `magaloko_session` löschen

---

## Was ist falsch wenn du was siehst

| Symptom | Ursache | Fix |
|---|---|---|
| Browser zeigt „nicht erreichbar" | Server läuft nicht / Firewall | `Get-Service MAGALOKO` checken + Firewall-Regel |
| Login-Link kommt nicht | SMTP-Config fehlt | `data/last-magic-link.txt` öffnen, Link manuell kopieren |
| „Session abgelaufen" sofort beim Login | Cookie kann nicht gesetzt werden (Secure-Flag auf HTTP) | In Server `setSessionCookie`: temporär `Secure;` weglassen für HTTP. Bei HTTPS-Setup nicht nötig. |
| Tailscale IP ändert sich | Sollte nicht passieren — sie ist statisch im Tailnet. Falls doch, in Tailscale-Admin nachschauen. |
