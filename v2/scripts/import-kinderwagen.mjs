// Import der Kinderwagen-Basisdaten aus dem HFK-JTL-Export in die Supabase-Tabelle `produkte`.
//
// LOKAL vom User auszuführen (Supabase ist nicht per MCP erreichbar). Beispiel:
//   cd v2
//   $env:SUPABASE_URL="https://<ref>.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
//   node scripts/import-kinderwagen.mjs            # DRY-RUN: zeigt nur eine Stichprobe
//   $env:DRY_RUN="false"; node scripts/import-kinderwagen.mjs   # schreibt (Upsert)
//
// Hinweise:
// - Die Roh-CSVs sind echte Geschäftsdaten → NICHT committen (.gitignore).
// - JTL-Export ist pipe-getrennt, OHNE Header. Spalten (verifiziert am Export):
//     dbo_tkategorieartikel:  col1 = kArtikel, col2 = kKategorie
//     dbo_tArtikel:           col0 = kArtikel, col1 = Name, col2 = Netto-Preis
// - Maße/Gewicht sind im Export NICHT vorhanden → kommen ins kuratierte Overlay (kompassEignung).

import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const JTL_DIR = process.env.JTL_DIR || "F:\\JTL_Export\\JTL_Export";
const ENCODING = process.env.JTL_ENCODING || "cp850"; // JTL-Export ist DOS-codiert (CP850); sonst "utf8"/"latin1"
const DRY_RUN = process.env.DRY_RUN !== "false";

// CP850 (DOS) High-Bytes → Unicode, fokussiert auf deutsche/akzentuierte Buchstaben in Produktnamen.
// Wir lesen die Datei als "latin1" (Byte → U+00XX) und mappen die relevanten Bytes nach Unicode.
const CP850 = { 0x80:"Ç",0x81:"ü",0x82:"é",0x83:"â",0x84:"ä",0x85:"à",0x86:"å",0x87:"ç",0x88:"ê",0x89:"ë",0x8a:"è",0x8b:"ï",0x8c:"î",0x8d:"ì",0x8e:"Ä",0x8f:"Å",0x90:"É",0x91:"æ",0x92:"Æ",0x93:"ô",0x94:"ö",0x95:"ò",0x96:"û",0x97:"ù",0x98:"ÿ",0x99:"Ö",0x9a:"Ü",0x9b:"ø",0x9d:"Ø",0xa0:"á",0xa1:"í",0xa2:"ó",0xa3:"ú",0xa4:"ñ",0xa5:"Ñ",0xc6:"ã",0xc7:"Ã",0xe1:"ß",0xe4:"õ",0xe5:"Õ",0xf8:"°" };
function fromCp850(s) {
  let out = "";
  for (let i = 0; i < s.length; i++) { const code = s.charCodeAt(i); out += code >= 0x80 ? (CP850[code] ?? s[i]) : s[i]; }
  return out;
}
const VAT = Number(process.env.VAT || "1.20"); // AT 20% → Netto×1,20 = Brutto
// Kinderwagen-Kategorien (Spike): 365 Kinderwagen, 757 Kinderwagen & Buggys, 597 Buggys
const TARGET_KATEGORIEN = new Set((process.env.KATEGORIEN || "365,757,597").split(","));

async function readLines(file, onLine) {
  // CP850 lesen wir physisch als latin1 und transkodieren danach (Node kennt cp850 nicht nativ).
  const streamEnc = ENCODING === "cp850" ? "latin1" : ENCODING;
  const rl = createInterface({ input: createReadStream(path.join(JTL_DIR, file), { encoding: streamEnc }), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line) continue;
    onLine((ENCODING === "cp850" ? fromCp850(line) : line).split("|"));
  }
}

function round2(n) { return Math.round(n * 100) / 100; }

async function main() {
  console.log(`[import] JTL_DIR=${JTL_DIR} ENCODING=${ENCODING} DRY_RUN=${DRY_RUN} Kategorien=${[...TARGET_KATEGORIEN].join(",")}`);

  // Pass 1: Artikel-IDs der Ziel-Kategorien sammeln
  const ids = new Set();
  await readLines("dbo_tkategorieartikel.csv", (c) => { if (TARGET_KATEGORIEN.has(c[2])) ids.add(c[1]); });
  console.log(`[import] Artikel in Ziel-Kategorien: ${ids.size}`);

  // Pass 2: Basisdaten aus dbo_tArtikel ziehen
  const rows = [];
  await readLines("dbo_tArtikel.csv", (c) => {
    const id = c[0];
    if (!ids.has(id)) return;
    const name = (c[1] || "").trim();
    if (!name) return;
    const netto = parseFloat((c[2] || "0").replace(",", "."));
    const preis = Number.isFinite(netto) && netto > 0 ? round2(netto * VAT) : null;
    rows.push({ id, jtl_artikel_nr: id, name, marke: null, kategorie: "Kinderwagen", preis_eur: preis, aktiv: true, updated_at: new Date().toISOString() });
  });
  console.log(`[import] Produkt-Zeilen vorbereitet: ${rows.length}`);

  if (DRY_RUN) {
    console.log("[import] DRY-RUN — Stichprobe (erste 10), kein Schreiben:");
    for (const r of rows.slice(0, 10)) console.log(`   ${r.jtl_artikel_nr} | ${r.name} | ${r.preis_eur ?? "–"} €`);
    console.log("[import] Zum Schreiben: DRY_RUN=false setzen.");
    return;
  }

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.error("[import] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen."); process.exit(1); }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  let written = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await sb.from("produkte").upsert(batch, { onConflict: "id" });
    if (error) { console.error(`[import] Upsert-Fehler bei Batch ${i}:`, error.message); process.exit(1); }
    written += batch.length;
    console.log(`[import] ${written}/${rows.length} upserted …`);
  }
  console.log(`[import] Fertig. ${written} Produkte upserted.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
