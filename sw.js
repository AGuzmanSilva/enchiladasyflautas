const CACHE = "flauxil-gichi-v3";

const PRECACHE = [
  "/",
  "/index.html",
  "/menu/index.html",
  "/cafeteria/index.html",
  "/offline.html",
  "/assets/variables.css",
  "/assets/layout.css",
  "/assets/components.css",
  "/assets/styles.css",
  "/assets/shared.js",
  "/assets/cart.js",
  "/assets/ui.js",
  "/assets/payment.js",
  "/assets/accordion.js",
  "/assets/product-card.js",
  "/assets/fetch.js",
  "/assets/config.example.js",
  "/data/menu-comida.json",
  "/data/menu-cafeteria.json",
  "/assets/icons/icon-192.png",
  "/assets/icons/icon-512.png",
  "/assets/images/favicon.ico",
  "/assets/images/promocion.webp",
  "/assets/images/productos/enchiladas.webp",
  "/assets/images/productos/flautas.webp",
  "/assets/images/productos/agua-jamaica.webp",
  "/assets/images/productos/coca-cola.webp",
  "/assets/images/productos/americano.webp",
  "/assets/images/productos/latte.webp",
  "/assets/images/productos/capuccino.webp",
  "/assets/images/productos/mocha.webp",
  "/assets/images/productos/caramel-macchiato.webp",
  "/assets/images/productos/chocolate.webp",
  "/assets/images/productos/bebidas-frias.webp",
  "/assets/images/productos/pan-dulce.webp",
  "/manifest.json",
];

const OFFLINE_PAGE = "/offline.html";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(PRECACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  const path = url.pathname;

  const isAsset = /\.(css|js|json|png|ico|webp)$/.test(path);
  const isPage = path === "/" || path.endsWith("/index.html");
  const isData = path.startsWith("/data/") && path.endsWith(".json");

  if (isAsset || isData) {
    e.respondWith(cacheFirst(e.request));
  } else if (isPage) {
    e.respondWith(networkFirstWithTimeout(e.request, 3000));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return caches.match(OFFLINE_PAGE);
  }
}

async function networkFirstWithTimeout(request, timeout) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), timeout)
  );

  try {
    const res = await Promise.race([fetch(request), timeoutPromise]);
    if (res && res.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, res.clone());
      return res;
    }
    throw new Error("response not ok");
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match(OFFLINE_PAGE);
  }
}

self.addEventListener("message", e => {
  if (e.data === "skipWaiting") {
    self.skipWaiting();
  }
});
