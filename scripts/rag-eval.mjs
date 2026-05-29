// RAG-Retrieval-Evaluation (Lehrbuch "RAG-Systeme", Kap. 7)
// Misst ob das Top-k-Retrieval die erwartete Marke/Begriff trifft (Hit-Rate@k).
// Start:  node scripts/rag-eval.mjs
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const SERVER = "http://127.0.0.1:4177";

// Test-Set: Frage -> erwarteter Begriff, der in mind. einem Top-k-Treffer vorkommen MUSS.
// Erweitere das hier mit echten Mitarbeiter-Fragen + bekannter richtiger Antwort.
const TESTS = [
  { q: "liewood schlafsack", expect: "liewood" },
  { q: "stokke hochstuhl", expect: "stokke" },
  { q: "was kostet der tripp trapp", expect: "tripp trapp" },
  { q: "stokke nomi", expect: "nomi" },
  { q: "bio baumwolle schlafsack", expect: "schlafsack" }
];
const K = 5;

const cfg = JSON.parse(await readFile(join(root, "config", "telegram.json"), "utf8"));
const token = cfg.internalApiToken;
if (!token) { console.error("Kein internalApiToken in config/telegram.json"); process.exit(1); }

let hits = 0;
for (const t of TESTS) {
  const url = `${SERVER}/api/rag/search?k=${K}&q=${encodeURIComponent(t.q)}`;
  let docs = [];
  try {
    const res = await fetch(url, { headers: { "x-internal-token": token } });
    docs = (await res.json()).docs || [];
  } catch (e) { console.error("Fehler:", e.message); }
  const hay = docs.map(d => `${d.name} ${d.marke}`.toLowerCase()).join(" | ");
  const hit = hay.includes(t.expect.toLowerCase());
  if (hit) hits++;
  const pos = docs.findIndex(d => `${d.name} ${d.marke}`.toLowerCase().includes(t.expect.toLowerCase()));
  console.log(`${hit ? "✅" : "❌"} "${t.q}"  → erwartet "${t.expect}"${hit ? ` (Rang ${pos + 1})` : " — NICHT in Top-" + K}`);
  if (!hit && docs.length) console.log(`     Top-Treffer: ${docs.slice(0, 3).map(d => d.name).join(" · ")}`);
}
const rate = Math.round((hits / TESTS.length) * 100);
console.log(`\nHit-Rate@${K}: ${hits}/${TESTS.length} = ${rate}%  ${rate >= 80 ? "✅ gut" : rate >= 60 ? "⚠️ ok" : "🔴 schwach"}`);
