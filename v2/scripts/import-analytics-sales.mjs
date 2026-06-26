// Importiert Verkaufspositionen aus einem headerbasierten Rechnungs-/PDF-CSV in
// `analytics_sales`.
//
// Dry-run:
//   cd v2
//   $env:SUPABASE_URL="https://<ref>.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
//   $env:SALES_CSV="F:\JTL_Export\JTL_Export\pfad\rechnungen.csv"
//   node scripts/import-analytics-sales.mjs
//
// Schreiben:
//   $env:DRY_RUN="false"; node scripts/import-analytics-sales.mjs
//
// Wichtige Optionen:
//   $env:SOURCE="pdf-export"
//   $env:ID_FACTOR="1000"              # kauftragposition = rechnungsnr * factor + positionsnr
//   $env:ALLOW_UNMATCHED="false"       # true => kartikel=null fuer ungematchte Zeilen
//   $env:UNMATCHED_OUT="unmatched-sales.csv"

import { createReadStream, createWriteStream } from "node:fs";
import { access, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

const SALES_CSV = process.env.SALES_CSV;
const SOURCE = process.env.SOURCE || "pdf-export";
const DRY_RUN = process.env.DRY_RUN !== "false";
const ID_FACTOR = Number(process.env.ID_FACTOR || "1000");
const ALLOW_UNMATCHED = process.env.ALLOW_UNMATCHED === "true";
const UNMATCHED_OUT = process.env.UNMATCHED_OUT || "analytics-sales-unmatched.csv";
const BATCH_SIZE = Number(process.env.BATCH_SIZE || "500");

if (!SALES_CSV) {
  console.error("[sales-import] SALES_CSV fehlt.");
  process.exit(1);
}
if (!Number.isInteger(ID_FACTOR) || ID_FACTOR < 100) {
  console.error("[sales-import] ID_FACTOR muss eine Integer-Zahl >= 100 sein.");
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[sales-import] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen.");
  process.exit(1);
}

const HEADER_ALIASES = {
  invoiceNo: ["rechnungs-nr", "rechnungsnr", "rechnung", "rechnung nr", "invoice", "invoice no"],
  positionNo: ["positions-nr", "positionsnr", "position", "pos", "pos."],
  date: ["rechnungsdatum", "datum", "auftrag_erstellt_am", "created_at", "date"],
  artnr: ["artnr", "artikelnummer", "artikel-nr", "sku", "artikel nr"],
  name: ["bezeichnung", "position_name", "artikelbezeichnung", "name", "artikel"],
  qty: ["menge", "anzahl", "qty", "quantity"],
  unitPrice: ["e-preis", "e preis", "einzelpreis", "vk_netto", "preis", "unit price"],
  totalPrice: ["g-preis", "g preis", "gesamtpreis", "summe", "total"],
  vat: ["ust", "mwst", "mwst_prozent", "ust %", "mwst %"],
  unit: ["einheit", "unit"],
};

function normHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/\s+/g, " ");
}

function normText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bstk\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/€|eur/gi, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseInteger(value) {
  const n = parseNumber(value);
  return n == null ? null : Math.trunc(n);
}

function parseDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw;
  const m = raw.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/);
  if (!m) return raw;
  const year = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${year}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")} 00:00:00`;
}

function detectDelimiter(line) {
  const candidates = [";", "\t", ",", "|"];
  return candidates
    .map((delimiter) => ({ delimiter, count: splitDelimited(line, delimiter).length }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function splitDelimited(line, delimiter) {
  const out = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === delimiter && !quoted) {
      out.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out.map((v) => v.trim());
}

function buildColumnMap(headers) {
  const normalized = headers.map(normHeader);
  const map = {};
  for (const [target, aliases] of Object.entries(HEADER_ALIASES)) {
    const idx = normalized.findIndex((h) => aliases.includes(h));
    if (idx >= 0) map[target] = idx;
  }
  const required = ["invoiceNo", "positionNo", "date", "name", "qty", "unitPrice", "vat"];
  const missing = required.filter((key) => map[key] == null);
  if (missing.length) {
    throw new Error(`Pflichtspalten fehlen: ${missing.join(", ")}. Header: ${headers.join(" | ")}`);
  }
  return map;
}

async function readSourceRows(filePath) {
  await access(filePath);
  const rl = createInterface({ input: createReadStream(filePath, { encoding: "utf8" }), crlfDelay: Infinity });
  let delimiter = null;
  let columns = null;
  const rows = [];
  let lineNo = 0;
  for await (const line of rl) {
    lineNo++;
    if (!line.trim()) continue;
    if (!delimiter) {
      delimiter = detectDelimiter(line);
      columns = buildColumnMap(splitDelimited(line.replace(/^\uFEFF/, ""), delimiter));
      continue;
    }
    const c = splitDelimited(line, delimiter);
    const get = (key) => c[columns[key]] ?? "";
    const kauftrag = parseInteger(get("invoiceNo"));
    const pos = parseInteger(get("positionNo"));
    const menge = parseNumber(get("qty"));
    const vkNetto = parseNumber(get("unitPrice"));
    const mwst = parseNumber(get("vat"));
    const positionName = get("name");
    const artnr = get("artnr") || positionName;
    const generatedId = kauftrag != null && pos != null ? kauftrag * ID_FACTOR + pos : null;
    rows.push({
      lineNo,
      kauftragposition: generatedId,
      kauftrag,
      artnr,
      auftragsnr: kauftrag != null ? `AUF-${kauftrag}` : "",
      position_name: positionName,
      menge,
      vk_netto: vkNetto,
      mwst_prozent: mwst,
      einheit: get("unit") || "Stk",
      auftrag_erstellt_am: parseDate(get("date")),
      source: SOURCE,
      _pos: pos,
    });
  }
  return { rows, delimiter };
}

function productKeys(product) {
  const art = product.artnr ?? product.cartnr ?? product.sku ?? product.jtl_artikel_nr ?? product.article_no ?? "";
  const name = product.name ?? product.bezeichnung ?? product.title ?? product.position_name ?? "";
  const id = product.kartikel ?? product.kArtikel ?? product.id ?? product.product_id ?? null;
  return { art: String(art || ""), name: String(name || ""), id };
}

async function loadProducts(sb) {
  const products = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await sb.from("analytics_products").select("*").range(from, from + pageSize - 1);
    if (error) throw new Error(`analytics_products konnte nicht gelesen werden: ${error.message}`);
    if (!data?.length) break;
    products.push(...data);
    if (data.length < pageSize) break;
  }

  const byArt = new Map();
  const byName = new Map();
  for (const p of products) {
    const { art, name, id } = productKeys(p);
    if (id == null) continue;
    if (art) byArt.set(normText(art), id);
    if (name) byName.set(normText(name), id);
  }
  return { products, byArt, byName };
}

function matchProduct(row, indexes) {
  const artKey = normText(row.artnr);
  if (artKey && indexes.byArt.has(artKey)) return { kartikel: indexes.byArt.get(artKey), match: "artnr_exact" };

  const nameKey = normText(row.position_name);
  if (nameKey && indexes.byName.has(nameKey)) return { kartikel: indexes.byName.get(nameKey), match: "name_exact" };

  const combined = normText(`${row.artnr} ${row.position_name}`);
  if (!combined) return { kartikel: null, match: "missing" };

  let best = null;
  for (const p of indexes.products) {
    const { name, id } = productKeys(p);
    if (id == null) continue;
    const key = normText(name);
    if (key.length < 8) continue;
    if (combined.includes(key) || key.includes(nameKey)) {
      const score = Math.min(key.length, combined.length);
      if (!best || score > best.score) best = { kartikel: id, match: "name_contains", score };
    }
  }
  return best || { kartikel: null, match: "unmatched" };
}

function validateRow(row) {
  const errors = [];
  if (!Number.isInteger(row.kauftragposition)) errors.push("kauftragposition");
  if (!Number.isInteger(row.kauftrag)) errors.push("kauftrag");
  if (!row.position_name) errors.push("position_name");
  if (row.menge == null) errors.push("menge");
  if (row.vk_netto == null) errors.push("vk_netto");
  if (row.mwst_prozent == null) errors.push("mwst_prozent");
  if (!row.auftrag_erstellt_am) errors.push("auftrag_erstellt_am");
  return errors;
}

async function writeUnmatched(rows) {
  if (!rows.length) return;
  await mkdir(dirname(resolve(UNMATCHED_OUT)), { recursive: true });
  const ws = createWriteStream(UNMATCHED_OUT, { encoding: "utf8" });
  ws.write("line;kauftrag;pos;artnr;position_name;reason\n");
  for (const r of rows) {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    ws.write([r.lineNo, r.kauftrag, r._pos, esc(r.artnr), esc(r.position_name), esc(r._reason)].join(";") + "\n");
  }
  await new Promise((resolveWrite) => ws.end(resolveWrite));
}

async function main() {
  const filePath = resolve(SALES_CSV);
  console.log(`[sales-import] Datei=${filePath}`);
  console.log(`[sales-import] SOURCE=${SOURCE} DRY_RUN=${DRY_RUN} ID_FACTOR=${ID_FACTOR} ALLOW_UNMATCHED=${ALLOW_UNMATCHED}`);

  const { rows, delimiter } = await readSourceRows(filePath);
  console.log(`[sales-import] ${rows.length} CSV-Zeilen gelesen (delimiter=${JSON.stringify(delimiter)}).`);

  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const products = await loadProducts(sb);
  console.log(`[sales-import] ${products.products.length} analytics_products geladen.`);

  const seen = new Set();
  const prepared = [];
  const rejected = [];
  const matchStats = new Map();

  for (const row of rows) {
    const validation = validateRow(row);
    if (validation.length) {
      rejected.push({ ...row, _reason: `ungueltig:${validation.join(",")}` });
      continue;
    }
    if (seen.has(row.kauftragposition)) {
      rejected.push({ ...row, _reason: "duplicate_kauftragposition" });
      continue;
    }
    seen.add(row.kauftragposition);

    const match = matchProduct(row, products);
    matchStats.set(match.match, (matchStats.get(match.match) || 0) + 1);
    if (match.kartikel == null && !ALLOW_UNMATCHED) {
      rejected.push({ ...row, _reason: "unmatched_product" });
      continue;
    }

    const { _pos, lineNo, ...clean } = row;
    prepared.push({ ...clean, kartikel: match.kartikel == null ? null : Number(match.kartikel) });
  }

  await writeUnmatched(rejected);
  console.log(`[sales-import] vorbereitet=${prepared.length} abgelehnt=${rejected.length}`);
  console.log(`[sales-import] Matching: ${[...matchStats.entries()].map(([k, v]) => `${k}=${v}`).join(" ") || "keine"}`);
  if (rejected.length) console.log(`[sales-import] Abgelehnte Zeilen: ${resolve(UNMATCHED_OUT)}`);

  if (DRY_RUN) {
    console.log("[sales-import] DRY-RUN - keine DB-Schreiboperation.");
    console.log("[sales-import] Stichprobe:");
    for (const r of prepared.slice(0, 10)) {
      console.log(`  ${r.kauftragposition} | kArt=${r.kartikel ?? "-"} | ${r.kauftrag} | ${r.artnr} | ${r.position_name} | ${r.menge} x ${r.vk_netto}`);
    }
    return;
  }

  let written = 0;
  for (let i = 0; i < prepared.length; i += BATCH_SIZE) {
    const batch = prepared.slice(i, i + BATCH_SIZE);
    const { error } = await sb.from("analytics_sales").upsert(batch, { onConflict: "kauftragposition" });
    if (error) throw new Error(`Upsert analytics_sales fehlgeschlagen bei Batch ${i}: ${error.message}`);
    written += batch.length;
    console.log(`[sales-import] ${written}/${prepared.length} upserted`);
  }

  console.log(`[sales-import] Fertig. ${written} Zeilen in analytics_sales geschrieben.`);
}

main().catch((error) => {
  console.error("[sales-import]", error);
  process.exit(1);
});
