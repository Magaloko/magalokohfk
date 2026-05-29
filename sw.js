// MAGALOKO Service Worker
// Strategie:
//   static (HTML/CSS/JS/SVG/manifest)  → cache-first, im Hintergrund updaten
//   /api/state                          → network-first, cache-fallback (offline-lesen)
//   /api/hfk/*, /api/jtl/*              → network-first, cache-fallback (lange gültig)
//   /api/state PUT                       → durchreichen, bei Fehler: in IDB-Queue (vom Client)
//   /auth/*                              → network-only (nie cachen, sensibel)

const VERSION = "magaloko-v40-multiacc-fix";
const STATIC_CACHE = `${VERSION}-static`;
const DATA_CACHE = `${VERSION}-data`;

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/login.html",
  "/styles.css",
  "/app.js",
  "/icon.svg",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS).catch(() => null))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Audit-Finding R6: nur explizit gelistete Assets cachen — kein Wildcard-Caching
const CACHED_STATIC = new Set(["/icon.svg", "/manifest.json", "/login.html"]);

function isStaticRequest(url) {
  if (url.origin !== self.location.origin) return false;
  return CACHED_STATIC.has(url.pathname);
}

// Audit-Finding R8: nur explizit harmlose Referenzdaten cachen — keine Geschäfts-/Preisdaten
const CACHEABLE_DATA_PATHS = new Set([
  "/api/jtl/manufacturers",
  "/api/jtl/suppliers",
  "/api/jtl/manufacturers/list"
]);

function isDataRequest(url) {
  // Explizite Allowlist: nur unveränderliche Stammdaten ohne Preis-/Umsatz-/Kundenbezug
  return CACHEABLE_DATA_PATHS.has(url.pathname);
}

// App-Shell: network-first damit neuer Code sofort kommt (Audit-Finding #9 — löst 2×-Reload)
function isAppShell(url) {
  return url.pathname === "/" ||
    url.pathname === "/index.html" ||
    url.pathname === "/app.js" ||
    url.pathname === "/styles.css";
}

async function networkFirstShell(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch {
    const cached = await cache.match(request) || await cache.match("/index.html");
    if (cached) return cached;
    throw new Error("offline + nicht im Cache");
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) {
    // Im Hintergrund aktualisieren
    fetch(request).then((response) => {
      if (response.ok) cache.put(request, response.clone()).catch(() => {});
    }).catch(() => {});
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch (error) {
    // Letzter Fallback: Index aus Cache (für SPA-Routen ohne match)
    const fallback = await cache.match("/index.html");
    if (fallback) return fallback;
    throw error;
  }
}

async function networkFirst(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set("X-MAGALOKO-Offline", "true");
      return new Response(await cached.blob(), {
        status: cached.status,
        statusText: cached.statusText,
        headers
      });
    }
    return new Response(JSON.stringify({ error: "offline", offline: true }), {
      status: 503,
      headers: { "Content-Type": "application/json" }
    });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return; // PUTs/POSTs nie SW-handhaben
  const url = new URL(request.url);

  if (url.pathname.startsWith("/auth/")) return; // niemals cachen, niemals abfangen
  if (url.pathname === "/api/state") return; // niemals cachen (sensibel, immer frisch)

  // App-Shell network-first → neuer Code ohne Mehrfach-Reload
  if (isAppShell(url)) {
    event.respondWith(networkFirstShell(request));
    return;
  }

  if (isStaticRequest(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isDataRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }
});

// Messages vom Client (z.B. SKIP_WAITING bei Update)
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

// Click auf Notification → App fokussieren oder öffnen
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Audit-Finding R5: Open-Redirect-Schutz — nur Same-Origin-URLs erlaubt
  const rawUrl = (event.notification.data && event.notification.data.url) || "/";
  let targetUrl = "/";
  try {
    const u = new URL(rawUrl, self.location.origin);
    if (u.origin === self.location.origin) targetUrl = u.pathname + u.search + u.hash;
  } catch { /* ungültige URL → Fallback auf / */ }
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl).catch(() => {});
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
