// Offline-Cache: App-Dateien zuerst aus dem Cache, Updates im Hintergrund.
const CACHE = 'lernapp-v15';
const FILES = [
  './', './index.html', './manifest.json', './css/style.css?v=15',
  './js/data.js?v=15', './js/store.js?v=15', './js/sync.js?v=15', './js/ui.js?v=15', './js/icons.js?v=15', './js/images.js?v=15', './js/ai.js?v=15', './js/gamify.js?v=15',
  './js/math.js?v=15', './js/decks.js?v=15', './js/mathview.js?v=15', './js/exam.js?v=15',
  './js/tutor.js?v=15', './js/plan.js?v=15', './js/planner.js?v=15', './js/push.js?v=15', './js/onenote.js?v=15', './js/untis.js?v=15', './js/scp.js?v=15', './js/app.js?v=15',
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

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: 'Lernapp', body: e.data?.text() || '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Lernapp', {
    body: d.body || '', icon: './icons/icon-192.png', badge: './icons/icon-192.png', tag: d.title || 'lernapp'
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(c => c.url.includes('/lernapp/'));
    return open ? open.focus() : self.clients.openWindow('./');
  }));
});
