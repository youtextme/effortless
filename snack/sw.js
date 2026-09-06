/**
 * Effortless snack — service worker (scope: ./ under /effortless/snack/)
 * Static shell: cache-first. Content JSON: stale-while-revalidate.
 */
const SHELL_CACHE = "effortless-snack-shell-v1";
const CONTENT_CACHE = "effortless-snack-content-v1";

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./sw-register.js",
  "./styles.css",
  "./favicon.svg",
  "./favicon.ico",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-192-maskable.png",
  "./icons/icon-512-maskable.png",
  "./icons/apple-touch-icon.png",
];

const CONTENT_ASSETS = [
  "./content/sample-rain.json",
  "./content/sample-mirror.json",
  "./versions/manifest.json",
];

function isContentRequest(url) {
  return url.pathname.includes("/content/") && url.pathname.endsWith(".json");
}

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
      caches.open(CONTENT_CACHE).then((cache) => cache.addAll(CONTENT_ASSETS)),
    ]).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== CONTENT_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !isSameOrigin(request)) {
    return;
  }

  const url = new URL(request.url);

  if (isContentRequest(url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(cacheFirstNavigation(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match("./index.html");
  }
}

async function cacheFirstNavigation(request) {
  try {
    const cached = await caches.match("./index.html");
    const network = fetch(request);
    if (cached) {
      network.catch(() => {});
      return cached;
    }
    return network;
  } catch {
    return caches.match("./index.html");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CONTENT_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkPromise.catch(() => {});
    return cached;
  }

  const network = await networkPromise;
  if (network) {
    return network;
  }

  return new Response(JSON.stringify({ error: "Offline and no cached content." }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
