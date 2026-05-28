# MAGALOKO via Cloudflare Tunnel öffentlich machen

Ziel: Du tippst auf dem Handy `https://magaloko.deinedomain.de` und MAGALOKO öffnet sich — mit gültigem SSL und Magic-Link-Login geschützt.

**Voraussetzung**: Du hast eine Domain (egal welcher Anbieter), die du zu Cloudflare migrieren kannst (kostenlos).

**Geschätzter Aufwand**: 30-45 Minuten beim ersten Mal.

---

## Schritt 1 — Cloudflare-Account + Domain

1. Account anlegen: https://dash.cloudflare.com/sign-up (kostenlos)
2. „Add a Site" → deine Domain eingeben → **Free Plan** wählen
3. Cloudflare zeigt dir 2 Nameserver (z.B. `nina.ns.cloudflare.com` + `xerxes.ns.cloudflare.com`)
4. Bei deinem aktuellen Domain-Provider (Strato, GoDaddy, All-Inkl, …) Nameserver auf diese ändern
5. Warte 10-60 Minuten bis Cloudflare aktiv ist (Mail-Bestätigung kommt)

**Schon eine Cloudflare-Domain?** → weiter mit Schritt 2.

---

## Schritt 2 — cloudflared installieren (Windows)

```powershell
# Variante A: Direkt-Download (empfohlen)
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "$env:USERPROFILE\cloudflared.exe"

# Variante B: via winget
winget install --id Cloudflare.cloudflared
```

Test:
```powershell
& "$env:USERPROFILE\cloudflared.exe" --version
```

Sollte z.B. `cloudflared version 2025.x.x` ausgeben.

---

## Schritt 3 — Tunnel anlegen

```powershell
cd $env:USERPROFILE

# 1. Bei Cloudflare anmelden (öffnet Browser)
.\cloudflared.exe tunnel login

# 2. Tunnel erstellen
.\cloudflared.exe tunnel create magaloko
# → Output: "Created tunnel magaloko with id 12345678-…"
# Notiere die ID, du brauchst sie gleich.

# 3. DNS-Route anlegen
.\cloudflared.exe tunnel route dns magaloko magaloko.deinedomain.de
# → Cloudflare-DNS bekommt einen CNAME-Eintrag automatisch
```

Im Cloudflare-Dashboard (DNS-Sektion) siehst du jetzt einen neuen CNAME-Record `magaloko` → `<tunnel-id>.cfargotunnel.com`.

---

## Schritt 4 — Tunnel-Konfiguration

Erstelle `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: magaloko
credentials-file: C:\Users\<DEIN-USERNAME>\.cloudflared\<TUNNEL-ID>.json

ingress:
  - hostname: magaloko.deinedomain.de
    service: http://127.0.0.1:4177
  - service: http_status:404
```

`<DEIN-USERNAME>` und `<TUNNEL-ID>` ersetzen.

Test (Vordergrund):
```powershell
.\cloudflared.exe tunnel run magaloko
```

Öffne im Browser `https://magaloko.deinedomain.de` — sollte MAGALOKO zeigen (sobald `node server.mjs` läuft).

---

## Schritt 5 — Magic-Link-Auth scharf schalten

Damit nicht das halbe Internet auf MAGALOKO zugreifen kann, bevor du die Domain veröffentlichst Auth aktivieren.

`magaloko/config/auth.json` editieren:

```json
{
  "requireAuth": true,
  "allowedEmails": ["dadakaev10@gmail.com"],
  "sessionSecret": "<wird automatisch generiert>",
  "smtp": null,
  "publicUrl": "https://magaloko.deinedomain.de"
}
```

**Wichtig**:
- `requireAuth: true` → Auth ist aktiv
- `allowedEmails` → nur diese Mails bekommen einen Magic-Link
- `publicUrl` → wird in Magic-Links verwendet (sonst kämest du im Mail-Link auf `http://127.0.0.1`)

Server neu starten:
```powershell
cd F:\JTL_Export\JTL_Export\magaloko
node server.mjs
```

Konsole sollte zeigen:
```
Auth: AKTIV · zugelassene Mails: 1
```

---

## Schritt 6 — SMTP (Brevo) konfigurieren

Ohne SMTP läuft Auth im Dev-Modus: Magic-Link wird in `data/last-magic-link.txt` geschrieben statt versendet. Funktioniert, aber unpraktisch unterwegs.

Brevo-SMTP-Zugangsdaten (kostenlos bis 300 Mails/Tag):
1. Bei https://app.brevo.com → Settings → SMTP & API → SMTP Keys → „Generate a new SMTP key"
2. Notiere: Server `smtp-relay.brevo.com`, Port `587`, User (deine Brevo-Login-Mail), Pass (der generierte SMTP-Key)

`config/auth.json` ergänzen:

```json
{
  "requireAuth": true,
  "allowedEmails": ["dadakaev10@gmail.com"],
  "sessionSecret": "...",
  "publicUrl": "https://magaloko.deinedomain.de",
  "smtp": {
    "host": "smtp-relay.brevo.com",
    "port": 587,
    "secure": false,
    "user": "deine-mail@beispiel.de",
    "pass": "DEIN_BREVO_SMTP_KEY",
    "from": "MAGALOKO <noreply@deinedomain.de>"
  }
}
```

Dependency installieren:
```powershell
cd F:\JTL_Export\JTL_Export\magaloko
npm init -y
npm install nodemailer
```

Server neu starten — Magic-Links landen jetzt direkt in deinem Mail-Postfach.

---

## Schritt 7 — cloudflared als Windows-Service

Damit der Tunnel automatisch beim Booten startet:

```powershell
# Als Admin ausführen:
.\cloudflared.exe service install
```

Status prüfen:
```powershell
Get-Service cloudflared
```

Stop / Start:
```powershell
Stop-Service cloudflared
Start-Service cloudflared
```

---

## Schritt 8 — MAGALOKO als Windows-Service (optional, empfohlen)

`node server.mjs` läuft sonst nur solange deine PowerShell offen ist.

Variante 1 — **NSSM** (einfach, kostenlos):
```powershell
# NSSM downloaden: https://nssm.cc/download
.\nssm.exe install MAGALOKO
# Path: C:\Program Files\nodejs\node.exe
# Arguments: F:\JTL_Export\JTL_Export\magaloko\server.mjs
# Startup directory: F:\JTL_Export\JTL_Export\magaloko
.\nssm.exe start MAGALOKO
```

Variante 2 — **PM2** (cross-platform, mehr Features):
```powershell
npm install -g pm2 pm2-windows-startup
cd F:\JTL_Export\JTL_Export\magaloko
pm2 start server.mjs --name magaloko
pm2 save
pm2-startup install
```

---

## Schritt 9 — Login testen

1. Handy aufmachen, `https://magaloko.deinedomain.de` öffnen
2. Magic-Link-Mail eingeben → Submit
3. In deiner Mail-App den Link klicken
4. Du bist in MAGALOKO drin, mobil
5. Im Handy-Browser: „Zum Home-Bildschirm hinzufügen" — MAGALOKO bekommt ein App-Icon

Phase 2 baut das dann zur richtigen PWA aus (Icon, Splash, Offline).

---

## Troubleshooting

### „Tunnel error: failed to connect"
- Läuft `node server.mjs` wirklich? Test: `curl http://127.0.0.1:4177`
- Firewall blockiert Cloudflared? In Defender freigeben.

### Login-Mail kommt nicht an
- Spam-Ordner checken
- `data/last-magic-link.txt` schauen — wenn da was steht, ist SMTP nicht konfiguriert oder fehlerhaft → Konsole zeigt SMTP-Fehler
- Brevo-Limit erreicht? Dashboard checken.

### „Link ungültig oder abgelaufen"
- Magic-Links sind 15 Minuten gültig — neuen anfordern
- Wenn du in zwei verschiedenen Browsern arbeitest: Link öffnet sich im falschen → kopiere ihn in den richtigen Browser

### Cookie wird nicht gesetzt (lokal über http)
- Auth-Cookie hat `Secure`-Flag → Browser akzeptiert es nur über HTTPS
- Lokal-Test geht ohne Auth (`requireAuth: false`) oder über Tunnel-URL (HTTPS via Cloudflare)

### Session läuft alle 30 Tage ab
- Standardwert in `server.mjs` (`SESSION_DAYS = 30`)
- Wenn länger gewünscht → konstante hochsetzen und Server neu starten

---

## Sicherheits-Hinweise

✓ **Auth-Cookie**: HttpOnly + SameSite=Lax + Secure → kein XSS-Diebstahl, kein CSRF
✓ **Rate Limiting**: max 5 Login-Anfragen pro IP pro 15 Minuten
✓ **Audit-Log**: `data/audit.jsonl` für jede Auth-Aktion (Login, Logout, Fehlversuch)
✓ **allowedEmails**: nur deine Adresse bekommt Magic-Links — Fremde Adressen bekommen `200 OK` zurück (keine User-Enumeration), Mail wird aber nie gesendet
✓ **Token-Hash**: Magic-Links und Session-Tokens werden nur gehasht gespeichert
✓ **Cloudflare-WAF**: blockt automatisch Bot-Traffic und bekannte Angriffsmuster

⚠ **NICHT auf `0.0.0.0` binden** wenn du Cloudflare Tunnel nutzt — der Tunnel verbindet sich lokal zu `127.0.0.1:4177`. Wenn du auf `0.0.0.0` bindest, ist der Server zusätzlich im LAN ohne Auth erreichbar (sofern requireAuth=false).

⚠ **Backup `config/auth.json`** separat — enthält `sessionSecret` und SMTP-Credentials. **NICHT** ins MAGALOKO-Backup einspielen.

⚠ **`data/sessions.json`** ist sensibel — gehashte Tokens, aber wenn jemand Lese-Zugang zum Server hat, sieht er aktive Sessions. Daten-Ordner sollte nur du lesen können.
