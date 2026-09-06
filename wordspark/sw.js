const CACHE_NAME = 'wordspark-v16';
const ASSETS = [
  './',
  './index.html',
  './css/app.css',
  './js/app.js',
  './platform/shell.js',
  './platform/kernel/registry.js',
  './platform/kernel/bus.js',
  './platform/kernel/health.js',
  './platform/kernel/telemetry.js',
  './platform/kernel/policy.js',
  './platform/kernel/context.js',
  './platform/components/storage.js',
  './platform/components/passage.js',
  './platform/components/reading.js',
  './platform/components/speech.js',
  './platform/components/tts.js',
  './platform/components/word-sheet.js',
  './platform/components/quiz.js',
  './platform/components/certificate.js',
  './platform/speech/policy.js',
  './platform/speech/sentences.js',
  './platform/speech/voice-picker.js',
  './platform/speech/visible-text.js',
  './platform/speech/engine.js',
  './platform/speech/listen-control.js',
  './js/passage-generator.js',
  './js/storage.js',
  './js/certificate.js',
  './js/data/words.js',
  './js/data/topics.js',
  './js/data/word-explanations.js',
  './js/tts.js',
  './js/voices.js',
  './js/questions.js',
  './js/word-usage.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
