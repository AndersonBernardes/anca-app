// ============================================================
//  Service Worker - Anca App
//  Habilita instalacao como PWA e cache basico offline
// ============================================================

var CACHE_NAME = "anca-app-v1";
var URLS_PARA_CACHE = [
  "./index.html",
  "./manifest.json"
];

// Instala o service worker e guarda os arquivos essenciais em cache
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_PARA_CACHE);
    })
  );
  self.skipWaiting();
});

// Remove caches antigos quando uma nova versao e ativada
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(nomes) {
      return Promise.all(
        nomes.filter(function(nome) { return nome !== CACHE_NAME; })
             .map(function(nome) { return caches.delete(nome); })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: tenta rede primeiro, cai pro cache se estiver offline
self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(resposta) {
        // Atualiza o cache com a versao mais recente sempre que consegue acessar a rede
        var respostaClone = resposta.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, respostaClone);
        });
        return resposta;
      })
      .catch(function() {
        // Sem internet - tenta responder do cache
        return caches.match(event.request);
      })
  );
});
