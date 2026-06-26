// Backfill fuer `analytics_sales.kartikel` aus `analytics_products`.
//
// Zweck:
// - bereits importierte Verkaufspositionen ohne kartikel matchen
// - erst Dry-Run mit Report, dann kontrolliert schreiben
//
// Dry-run:
//   cd v2
//   $env:SUPABASE_URL="https://<ref>.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
//   node scripts/match-analytics-sales-products.mjs
//
// Schreiben:
//   $env:DRY_RUN="false"; node scripts/match-analytics-sales-products.mjs
//
// Optionen:
//   $env:MIN_SCORE="0.86"          # konservativer Default
//   $env:LIMIT="0"                 # 0 = alle offenen Sales
//   $env:REPORT_OUT="sales-product-matches.csv"

import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.env.DRY_RUN !== "false";
const MIN_SCORE = Number(process.env.MIN_SCORE || "0.86");
const LIMIT = Number(process.env.LIMIT || "0");
const REPORT_OUT = process.env.REPORT_OUT || "sales-product-matches.csv";
const BATCH_SIZE = Number(process.env.BATCH_SIZE || "250");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[sales-match] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen.");
  process.exit(1);
}
if (!Number.isFinite(MIN_SCORE) || MIN_SCORE < 0.5 || MIN_SCORE > 1) {
  console.error("[sales-match] MIN_SCORE muss zwischen 0.5 und 1 liegen.");
  process.exit(1);
}

function norm(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bstk\b/g, "")
    .replace(/\bset\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  return norm(value)
    .split(" ")
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

const STOP = new Set([
  "der", "die", "das", "und", "oder", "mit", "fur", "fuer", "von", "im", "in", "am",
  "cm", "gr", "kg", "nr", "art", "neu", "one", "size",
]);

function productShape(p) {
  const id = p.kartikel ?? p.kArtikel ?? p.id ?? p.product_id ?? null;
  const artnr = p.artnr ?? p.cartnr ?? p.cArtNr ?? p.sku ?? p.jtl_artikel_nr ?? p.article_no ?? "";
  const name = p.name ?? p.bezeichnung ?? p.cName ?? p.title ?? p.position_name ?? "";
  return { id: id == null ? null : Number(id), artnr: String(artnr || ""), name: String(name || ""), raw: p };
}

function salesShape(s) {
  return {
    id: Number(s.kauftragposition),
    artnr: String(s.artnr || ""),
    name: String(s.position_name || ""),
    raw: s,
  };
}

function jaccard(a, b) {
  const sa = new Set(a);
  const sb = new Set(b);
  if (!sa.size || !sb.size) return 0;
  let both = 0;
  for (const x of sa) if (sb.has(x)) both++;
  return both / (sa.size + sb.size - both);
}

function scoreMatch(sale, product) {
  const saleArt = norm(sale.artnr);
  const productArt = norm(product.artnr);
  const saleName = norm(sale.name);
  const productName = norm(product.name);

  if (saleArt && productArt && saleArt === productArt) return { score: 1, reason: "artnr_exact" };
  if (saleName && productName && saleName === productName) return { score: 0.98, reason: "name_exact" };

  const saleCombined = norm(`${sale.artnr} ${sale.name}`);
  if (productArt && saleCombined.includes(productArt) && productArt.length >= 5) return { score: 0.94, reason: "artnr_contains" };
  if (productName && saleCombined.includes(productName) && productName.length >= 10) return { score: 0.92, reason: "name_contains" };

  const tokenScore = jaccard(tokens(`${sale.artnr} ${sale.name}`), tokens(`${product.artnr} ${product.name}`));
  return { score: tokenScore, reason: "token_jaccard" };
}

async function fetchAll(sb, table, select, filterOpenSales = false) {
  const out = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    let query = sb.from(table).select(select).range(from, from + pageSize - 1);
    if (filterOpenSales) query = query.or("kartikel.is.null,kartikel.eq.0");
    const { data, error } = await query;
    if (error) throw new Error(`${table} konnte nicht gelesen werden: ${error.message}`);
    if (!data?.length) break;
    out.push(...data);
    if (LIMIT > 0 && filterOpenSales && out.length >= LIMIT) return out.slice(0, LIMIT);
    if (data.length < pageSize) break;
  }
  return out;
}

function buildCandidateIndex(products) {
  const shaped = products.map(productShape).filter((p) => p.id != null && (p.artnr || p.name));
  const byExactArt = new Map();
  const byExactName = new Map();
  for (const p of shaped) {
    if (p.artnr) byExactArt.set(norm(p.artnr), p);
    if (p.name) byExactName.set(norm(p.name), p);
  }
  return { all: shaped, byExactArt, byExactName };
}

function findBest(sale, index) {
  const art = norm(sale.artnr);
  if (art && index.byExactArt.has(art)) {
    const p = index.byExactArt.get(art);
    return { product: p, score: 1, reason: "artnr_exact" };
  }

  const name = norm(sale.name);
  if (name && index.byExactName.has(name)) {
    const p = index.byExactName.get(name);
    return { product: p, score: 0.98, reason: "name_exact" };
  }

  let best = null;
  for (const p of index.all) {
    const scored = scoreMatch(sale, p);
    if (!best || scored.score > best.score) best = { product: p, ...scored };
  }
  return best;
}

async function writeReport(matches) {
  await mkdir(dirname(resolve(REPORT_OUT)), { recursive: true });
  const ws = createWriteStream(REPORT_OUT, { encoding: "utf8" });
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  ws.write("status;kauftragposition;score;reason;kartikel;sales_artnr;sales_name;product_artnr;product_name\n");
  for (const m of matches) {
    ws.write([
      m.accepted ? "accepted" : "rejected",
      m.sale.id,
      m.score.toFixed(4),
      m.reason,
      m.product?.id ?? "",
      esc(m.sale.artnr),
      esc(m.sale.name),
      esc(m.product?.artnr),
      esc(m.product?.name),
    ].join(";") + "\n");
  }
  await new Promise((resolveWrite) => ws.end(resolveWrite));
}

async function main() {
  console.log(`[sales-match] DRY_RUN=${DRY_RUN} MIN_SCORE=${MIN_SCORE} LIMIT=${LIMIT || "alle"}`);
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const [salesRows, productRows] = await Promise.all([
    fetchAll(sb, "analytics_sales", "kauftragposition, kartikel, artnr, position_name", true),
    fetchAll(sb, "analytics_products", "*"),
  ]);

  const sales = salesRows.map(salesShape);
  const index = buildCandidateIndex(productRows);
  console.log(`[sales-match] offene Sales=${sales.length} products=${index.all.length}`);

  const matches = sales.map((sale) => {
    const best = findBest(sale, index);
    const accepted = !!best?.product && best.score >= MIN_SCORE;
    return { sale, product: best?.product || null, score: best?.score || 0, reason: best?.reason || "none", accepted };
  });

  const accepted = matches.filter((m) => m.accepted);
  const byReason = new Map();
  for (const m of accepted) byReason.set(m.reason, (byReason.get(m.reason) || 0) + 1);

  await writeReport(matches);
  console.log(`[sales-match] akzeptiert=${accepted.length} abgelehnt=${matches.length - accepted.length}`);
  console.log(`[sales-match] akzeptiert nach Grund: ${[...byReason.entries()].map(([k, v]) => `${k}=${v}`).join(" ") || "keine"}`);
  console.log(`[sales-match] Report: ${resolve(REPORT_OUT)}`);

  if (DRY_RUN) {
    console.log("[sales-match] DRY-RUN - keine Updates.");
    for (const m of accepted.slice(0, 10)) {
      console.log(`  ${m.sale.id}: ${m.score.toFixed(2)} ${m.reason} -> ${m.product.id} | ${m.sale.name} => ${m.product.name}`);
    }
    return;
  }

  let updated = 0;
  for (let i = 0; i < accepted.length; i += BATCH_SIZE) {
    const batch = accepted.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (m) => {
      const { error } = await sb
        .from("analytics_sales")
        .update({ kartikel: m.product.id })
        .eq("kauftragposition", m.sale.id);
      if (error) throw new Error(`Update ${m.sale.id} fehlgeschlagen: ${error.message}`);
    }));
    updated += batch.length;
    console.log(`[sales-match] ${updated}/${accepted.length} aktualisiert`);
  }

  console.log(`[sales-match] Fertig. kartikel fuer ${updated} Sales-Zeilen gesetzt.`);
}

main().catch((error) => {
  console.error("[sales-match]", error);
  process.exit(1);
});
