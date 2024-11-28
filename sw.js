const CACHE_NAME = "video-cache-v1";

// Lista de videos para precargar en el caché
const videoPaths = [
  "Videos/Escena 1-1.mp4",
  "Videos/Escena 1-2.mp4",
  "Videos/Escena 2-1.mp4",
  "Videos/Escena 2-2.mp4",
  "Videos/Escena 2-3 DER.mp4",
  "Videos/Escena 2-4 IZQ.mp4",
  "Videos/Escena 3-1.mp4",
  "Videos/Escena 3-2.mp4",
  "Videos/Escena 4-1.mp4",
  "Videos/Escena 4-3.mp4",
  "Videos/Escena 4-4.mp4",
  "Videos/Escena 4-5.mp4",
  "Videos/Escena 5.mp4",
  "Videos/Escena 5-0.mp4",
  "Videos/Escena 5-1.mp4",
  "Videos/Escena 6.mp4",
  "Videos/Escena 7-1.mp4",
  "Videos/Escena 8-1.mp4",
  "Videos/Escena 8 servir.mp4",
  "Videos/Escena 8 vueltas.mp4",
  "Videos/Limon.mp4",
  "Videos/Pimienta.mp4",
  "Videos/Sal.mp4",
  "Imagenes/LogoLaRanchaBlanco.png"
];

// Convertir rutas relativas en URLs absolutas
const videoURLs = videoPaths.map((path) => new URL(path, self.location.origin).href);

self.addEventListener("install", (event) => {
  console.log("Service Worker instalado.");
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("Precargando videos...");
      const results = await Promise.allSettled(
        videoURLs.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`Error al cargar ${url}:`, err);
          })
        )
      );
      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length > 0) {
        console.warn(`${failed.length} videos no pudieron ser precargados.`);
      }
    }).catch((error) => {
      console.error("Error al abrir el caché:", error);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activado.");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Eliminando caché antiguo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (videoURLs.includes(event.request.url)) {
    console.log(`Interceptando solicitud de: ${event.request.url}`);
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});