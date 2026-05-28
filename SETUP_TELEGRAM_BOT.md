# SETUP: MAGALOKO Telegram-Bot

Bot für die HFK Verkaufs-Akademie. Mitarbeiter trainieren Produktwissen & Verkauf direkt im Telegram-Chat. Daten kommen **live** aus derselben `data/state.json`, die das Cockpit schreibt — du pflegst Drills/Marken/Einwände im Dashboard, der Bot zieht automatisch nach.

## 1. Bot bei BotFather anlegen (einmalig, 2 Min)

1. In Telegram **@BotFather** öffnen
2. `/newbot` senden
3. Namen vergeben (z.B. `HFK Akademie`)
4. Username vergeben (muss auf `bot` enden, z.B. `hfk_akademie_bot`)
5. BotFather gibt dir einen **Token** wie `7123456789:AAH...xyz`

## 2. Token eintragen

```
cd F:\JTL_Export\JTL_Export\magaloko\config
copy telegram.example.json telegram.json
```

Dann `config/telegram.json` öffnen und Token eintragen:

```json
{
  "token": "7123456789:AAH...xyz",
  "allowedUserIds": []
}
```

- **`allowedUserIds` leer `[]`** = jeder der den Bot findet darf ihn nutzen.
- **Zugang beschränken** (empfohlen für echtes Team): trag die numerischen Telegram-User-IDs ein, z.B. `[123456789, 987654321]`. Deine eigene ID bekommst du indem du dem Bot `/start` schreibst und kurz in die Bot-Konsole schaust (sie wird geloggt) — oder via **@userinfobot**.

> ⚠️ `telegram.json` enthält den Token = Secret. NICHT committen, NICHT ins Backup. (Liegt in `config/`, das ist vom Backup ausgeschlossen.)

## 3. Bot starten

```
cd F:\JTL_Export\JTL_Export\magaloko
node telegram-bot.mjs
```

Erfolg: `[telegram-bot] gestartet als @hfk_akademie_bot`

Der Bot läuft **unabhängig** vom Cockpit-Server (`server.mjs`) — beide können parallel laufen. Bot braucht keine öffentliche URL (Long-Polling).

### Dauerhaft laufen lassen
- **Einfach**: zweites Terminal-Fenster offen lassen
- **Robust**: per Windows-Aufgabenplanung beim Boot starten, oder `pm2 start telegram-bot.mjs` falls du pm2 nutzt

## 4. Befehle im Chat

| Befehl | Wirkung |
|---|---|
| `/start` | Hilfe + Befehlsübersicht |
| `/drill` | Zufalls-Quiz mit Antwort-Buttons → Tap → Feedback + Musterantwort |
| `/drill liewood` | Drill nur zu einer Marke |
| `/marke LIEWOOD` | Marken-Steckbrief (Herkunft, Philosophie, Hero-Produkte, Verkaufsargumente) |
| `/einwand preis` | Top-3 Einwand-Antworten zum Stichwort |
| `/persona anna` | Kunden-Typ-Steckbrief |
| `/rollenspiel` | Zufalls-Trainingsszenario (Ablauf + Einwände) |

## 5. Wie die Daten zusammenhängen

```
MAGALOKO-Cockpit (Akademie-Tabs)
   │  du pflegst/editierst Drills, Marken, Einwände, Personas, Rollenspiele
   ▼
data/state.json  (workspaces.hfk.data.*)
   ▲
   │  liest frisch bei jedem Befehl
Telegram-Bot (telegram-bot.mjs)
```

→ Änderst du im Dashboard einen Einwand, antwortet der Bot beim nächsten `/einwand` sofort mit dem neuen Stand. Kein Neustart nötig.

## 6. Troubleshooting

- **`token fehlt`** → `config/telegram.json` existiert nicht oder Token leer.
- **Bot antwortet nicht** → läuft `node telegram-bot.mjs`? Konsole auf Fehler prüfen.
- **„Kein Zugriff"** → deine User-ID ist nicht in `allowedUserIds`. Entweder Liste leeren oder ID ergänzen.
- **Doppelte Antworten** → läuft der Bot zweimal? Nur eine Instanz pro Token erlaubt.
- **Keine Drills/Marken** → im Cockpit erst Lernsystem importiert? Akademie-Tabs prüfen.

## 7. Erweiterung später

Der Bot ist bewusst dependency-frei (nur `node:https`). Erweiterbar um:
- Score-Tracking pro User (zurückschreiben in `state.staffTraining`)
- Daily-Push („Dein Drill des Tages" um 9:00)
- Weekly-Deepdive-Reminder
- WhatsApp-Variante (gleiche Datenbasis, anderer API-Adapter)
