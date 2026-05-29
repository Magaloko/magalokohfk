// Einfaches In-Memory-Rate-Limit pro Schlüssel (Sliding Window).
// Schützt vor einzelnen Flut-Sessions (KI-Kosten). Hinweis: pro Serverless-Instanz,
// kein globaler Zähler — als erste Verteidigungslinie für den Launch ausreichend.
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { buckets.set(key, arr); return false; }
  arr.push(now);
  buckets.set(key, arr);
  // gelegentlich aufräumen, damit die Map nicht unbegrenzt wächst
  if (buckets.size > 5000) { for (const [k, v] of buckets) { if (!v.some((t) => now - t < windowMs)) buckets.delete(k); } }
  return true;
}
