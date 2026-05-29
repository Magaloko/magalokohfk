// Einmaliger Import: data/state.json → Supabase app_state (id='hfk').
// Ohne Abhängigkeiten (Node 18+ fetch). Nutzt die Supabase REST-API mit dem Service-Role-Key.
//
// Aufruf (PowerShell):
//   $env:SUPABASE_URL="https://cfvbahyrullcwmhuddfm.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="<service_role secret aus Supabase → Settings → API>"
//   node scripts/import-state.mjs
//
// Aufruf (bash):
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-state.mjs

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const URL_ = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) {
  console.error("FEHLER: SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.");
  process.exit(1);
}

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const statePath = join(root, "data", "state.json");

const raw = await readFile(statePath, "utf8");
const parsed = JSON.parse(raw); // Validierung
const updatedAt = Number(parsed.updatedAt) || Date.now();
console.log(`State gelesen: ${(raw.length / 1024).toFixed(0)} KB, updatedAt=${updatedAt}, Top-Level-Keys=${Object.keys(parsed).length}`);

const endpoint = `${URL_.replace(/\/$/, "")}/rest/v1/app_state?id=eq.hfk`;
const res = await fetch(endpoint, {
  method: "PATCH",
  headers: {
    "apikey": KEY,
    "Authorization": `Bearer ${KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  },
  body: JSON.stringify({ data: parsed, updated_at: updatedAt })
});

if (!res.ok) {
  console.error(`FEHLER ${res.status}:`, (await res.text()).slice(0, 500));
  process.exit(1);
}
const out = await res.json();
const stored = Array.isArray(out) ? out[0] : out;
const storedKeys = stored?.data ? Object.keys(stored.data).length : 0;
console.log(`✓ Import OK. app_state.updated_at=${stored?.updated_at}, gespeicherte Top-Level-Keys=${storedKeys}`);
if (storedKeys !== Object.keys(parsed).length) {
  console.warn("⚠ Key-Anzahl weicht ab — bitte prüfen.");
} else {
  console.log("✓ Key-Anzahl identisch zur lokalen state.json.");
}
