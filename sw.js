const CACHE = "simulador-controle-acesso-v0.3.11";
const ESSENTIAL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ESSENTIAL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          return new Response("Simulador indisponível sem conexão. Reconecte-se e tente novamente.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
        }
        return Response.error();
      })
  );
});
