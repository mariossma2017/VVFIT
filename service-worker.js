/* VV FIT — service worker: cache offline e atualização de versão */

const CACHE_VERSAO = "vvfit-v3.0.0";

const ARQUIVOS_ESSENCIAIS = [
  "./",
  "./index.html",
  "./style.css",
  "./vendor/jspdf.umd.min.js",
  "./data.js",
  "./storage.js",
  "./core.js",
  "./resumo.js",
  "./app.js",
  "./screens/inicio.js",
  "./screens/treino.js",
  "./screens/alimentacao.js",
  "./screens/evolucao.js",
  "./screens/perfil.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-192.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSAO)
      .then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(
          chaves
            .filter((chave) => chave !== CACHE_VERSAO)
            .map((chave) => caches.delete(chave))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      const buscaRede = fetch(event.request)
        .then((respostaRede) => {
          if (respostaRede && respostaRede.status === 200 && respostaRede.type === "basic") {
            const clone = respostaRede.clone();
            caches.open(CACHE_VERSAO).then((cache) => cache.put(event.request, clone));
          }
          return respostaRede;
        })
        .catch(() => respostaCache);

      return respostaCache || buscaRede;
    })
  );
});
