
const CACHE_NAME = 'generatore-verifiche-ai-v1';
// Usa percorsi relativi per essere compatibile con GitHub Pages
const urlsToCache = [
  '.',
  'index.html',
  'index.tsx',
  'App.tsx',
  'types.ts',
  'services/geminiService.ts',
  'components/Header.tsx',
  'components/InputForm.tsx',
  'components/QuizDisplay.tsx',
  'components/LoadingSpinner.tsx',
  'components/ErrorAlert.tsx',
  'components/Welcome.tsx',
  'components/ApiKeyModal.tsx',
  'manifest.json'
  // Le risorse CDN sono state rimosse per evitare errori CORS nel service worker.
  // Il browser le metterà in cache usando la sua cache HTTP standard.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Usiamo no-cache per le richieste di caching per assicurarci di ottenere le risorse
        // anche se sono già nella cache del browser, ma con header CORS mancanti.
        const cachePromises = urlsToCache.map(urlToCache => {
          return fetch(new Request(urlToCache, {cache: 'reload'}))
            .then(response => {
              if (response.ok) {
                return cache.put(urlToCache, response);
              }
              return Promise.reject(`Failed to fetch ${urlToCache}: ${response.statusText}`);
            }).catch(err => {
                console.warn(`Could not cache ${urlToCache}. It might be unavailable offline.`, err);
            });
        });

        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Se non è in cache, vai alla rete.
        return fetch(event.request).then(
          response => {
            // Non mettiamo in cache le risorse esterne (es. API di Google) qui
            // per evitare di salvare risposte che potrebbero cambiare o avere header restrittivi.
            // Il codice originale provava a mettere in cache tutto, il che è rischioso.
            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});