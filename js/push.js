// Erinnerungen per Push: sparsam, eine zu Beginn der Lernzeit und eine am Abend vor einer Arbeit.
// Versand über die Supabase-Funktion "lernapp-push" (Zeitplan auf dem Server, damit es auch bei geschlossener App klappt).

const PUSH_FN = 'https://fgjtokbluxqnzotblnly.supabase.co/functions/v1/lernapp-push';
const PUSH_SIG_KEY = 'lernapp-push-sig';

const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;

async function pushCall(body) {
  const res = await fetch(PUSH_FN, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error || 'Fehler ' + res.status);
  return data;
}

function b64ToUint8(b64) {
  const pad = '='.repeat((4 - b64.length % 4) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

async function currentSubscription() {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

function pushStatusHtml() {
  const st = studySettings();
  if (!pushSupported() || (isIos() && !isStandalone())) {
    return `<p class="note" style="margin:0;">${isIos()
      ? 'Auf dem iPhone gehen Erinnerungen nur, wenn die App auf dem Home-Bildschirm ist: in Safari auf Teilen tippen, dann "Zum Home-Bildschirm". Danach hier einschalten.'
      : 'Dieser Browser kann keine Erinnerungen. Probier Chrome oder Edge.'}</p>`;
  }
  if (Notification.permission === 'denied') return '<p class="note" style="margin:0; color:var(--red);">Benachrichtigungen sind für die App blockiert. In den Einstellungen des Handys oder Browsers erlauben.</p>';
  return st.notify
    ? `<p class="status-line ok">${icon('check', 15)} An: zu Beginn der Lernzeit und am Abend vor einer Arbeit</p><button class="btn btn-outline btn-sm" onclick="disablePush()">Ausschalten</button>`
    : `<button class="btn btn-outline" onclick="enablePush()">${icon('bell', 16)} Erinnerungen einschalten</button>`;
}

async function enablePush() {
  try {
    if (location.protocol !== 'https:') return toast('Erinnerungen gehen nur in der Online-Version.');
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return toast('Ohne Erlaubnis keine Erinnerungen.');
    const reg = await navigator.serviceWorker.ready;
    const { publicKey } = await pushCall({ action: 'config' });
    const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(publicKey) });
    const json = sub.toJSON();
    await pushCall({ action: 'subscribe', endpoint: json.endpoint, keys: json.keys });
    studySettings().notify = true;
    localStorage.removeItem(PUSH_SIG_KEY);
    saveData();
    await schedulePush();
    toast('Erinnerungen sind an.');
  } catch (err) {
    toast('Erinnerungen gehen gerade nicht: ' + err.message);
  }
  render();
}

async function disablePush() {
  try {
    const sub = await currentSubscription();
    if (sub) {
      await pushCall({ action: 'cancel', endpoint: sub.endpoint }).catch(() => {});
      await sub.unsubscribe();
    }
  } catch (e) { /* egal, wird trotzdem ausgeschaltet */ }
  studySettings().notify = false;
  localStorage.removeItem(PUSH_SIG_KEY);
  saveData();
  render();
}

// Erinnerungen für die nächsten 7 Tage aus dem Plan berechnen
function computePushJobs() {
  const jobs = [];
  const now = Date.now();
  const at = (date, time) => new Date(`${date}T${time}:00`).getTime();
  const byDay = {};
  state.data.exams.forEach(exam => (exam.tasks || []).forEach(t => {
    if (t.done || !t.time || daysBetween(todayStr(), t.date) > 7) return;
    (byDay[t.date] = byDay[t.date] || []).push({ t, exam });
  }));
  Object.entries(byDay).forEach(([date, list]) => {
    list.sort((a, b) => a.t.time.localeCompare(b.t.time));
    const first = list[0].t.time;
    const mins = list.reduce((s, x) => s + (x.t.minutes || 0), 0);
    const names = [...new Set(list.map(x => getSubject(x.exam.subject).name))].join(', ');
    jobs.push({ t: at(date, first), title: 'Lernzeit', body: `${list.length} Einheit${list.length > 1 ? 'en' : ''}, ca. ${mins} Min: ${names}` });
  });
  state.data.exams.forEach(exam => {
    const d = daysBetween(todayStr(), exam.date);
    if (d < 1 || d > 7) return;
    jobs.push({ t: at(todayStr(d - 1), '19:00'), title: `Morgen: ${exam.title}`, body: 'Kurz die Probearbeit machen oder die schwierigen Karten wiederholen.' });
  });
  return jobs.filter(j => j.t > now).sort((a, b) => a.t - b.t).slice(0, 30);
}

let pushTimer = null;
function schedulePushSoon() {
  if (!studySettings().notify) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(schedulePush, 3000);
}

async function schedulePush() {
  if (!studySettings().notify) return;
  try {
    const sub = await currentSubscription();
    if (!sub) return;
    const jobs = computePushJobs();
    const sig = JSON.stringify(jobs);
    if (localStorage.getItem(PUSH_SIG_KEY) === sig) return;
    await pushCall({ action: 'schedule', endpoint: sub.endpoint, jobs });
    localStorage.setItem(PUSH_SIG_KEY, sig);
  } catch (err) {
    console.warn('Erinnerungen planen nicht möglich:', err.message);
  }
}
