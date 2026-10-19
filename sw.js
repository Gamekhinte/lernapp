// Offline-Cache: App-Dateien zuerst aus dem Cache, Updates im Hintergrund.
const CACHE = 'lernapp-v2';
const FILES = [
  './', './index.html', './manifest.json', './css/style.css?v=2',
  './js/data.js?v=2', './js/store.js?v=2', './js/ui.js?v=2', './js/images.js?v=2', './js/ai.js?v=2', './js/gamify.js?v=2',
  './js/math.js?v=2', './js/decks.js?v=2', './js/mathview.js?v=2', './js/exam.js?v=2',
  './js/tutor.js?v=2', './js/plan.js?v=2', './js/onenote.js?v=2', './js/app.js?v=2',
  './icons/icon-192.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // KI, Supabase und Videos nie aus dem Cache
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('.mp4')) return;
  // Seiten selbst immer zuerst frisch laden, damit Updates sofort ankommen
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(res => {
      caches.open(CACHE).then(c => c.put('./index.html', res.clone()));
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
