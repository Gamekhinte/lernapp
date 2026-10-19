// Cloud-Sync zwischen Geräten: zusammenführen statt überschreiben.
// Jedes Gerät merkt sich den Stand der Cloud, den es zuletzt gesehen hat (cloudBase).
// Hat ein anderes Gerät inzwischen hochgeladen, wird erst zusammengeführt und dann hochgeladen.

state.cloudReady = false;
state.cloudBase = null;
state.sync = { at: null, error: null };

function newer(a, b) {
  return String(a || '') >= String(b || '') ? 'a' : 'b';
}

function byId(listA = [], listB = [], pickSame, idOf = x => x.id) {
  const map = new Map();
  listB.forEach(x => map.set(idOf(x), x));
  listA.forEach(x => {
    const id = idOf(x);
    map.set(id, map.has(id) ? pickSame(x, map.get(id)) : x);
  });
  return [...map.values()];
}

const pickNewer = (a, b) => newer(a.updatedAt || a.createdAt, b.updatedAt || b.createdAt) === 'a' ? a : b;

// a = dieses Gerät, b = Cloud. Ergebnis enthält Änderungen von beiden.
function mergeData(a, b) {
  if (!b) return a;
  if (!a) return b;
  const aNewer = newer(a.updatedAt, b.updatedAt) === 'a';
  const base = aNewer ? a : b;
  const deleted = { ...(b.deleted || {}), ...(a.deleted || {}) };
  const alive = x => !deleted[x.id];

  const out = { ...base, deleted };
  out.decks = byId(a.decks, b.decks, pickNewer).filter(alive);
  out.folders = byId(a.folders, b.folders, (x, y) => aNewer ? x : y).filter(alive);
  out.customSubjects = byId(a.customSubjects, b.customSubjects, (x, y) => aNewer ? x : y).filter(alive);
  out.mathSets = byId(a.mathSets, b.mathSets, (x, y) => (x.tasks?.length || 0) >= (y.tasks?.length || 0) ? x : y).filter(alive);
  out.examResults = byId(a.examResults, b.examResults, x => x);
  out.learningHistory = byId(a.learningHistory, b.learningHistory, x => x, h => h.finishedAt + '|' + h.deckName)
    .sort((x, y) => String(y.finishedAt).localeCompare(String(x.finishedAt))).slice(0, 200);

  // Arbeiten: neuere Version nehmen, erledigte Aufgaben von beiden behalten
  out.exams = byId(a.exams, b.exams, (x, y) => {
    const win = pickNewer(x, y), other = win === x ? y : x;
    const doneIds = new Set([...(x.tasks || []), ...(y.tasks || [])].filter(t => t.done).map(t => t.id));
    const doneLabels = new Set([...(other.tasks || [])].filter(t => t.done).map(t => t.date + t.label));
    return { ...win, tasks: (win.tasks || []).map(t => ({ ...t, done: t.done || doneIds.has(t.id) || doneLabels.has(t.date + t.label) })) };
  }).filter(alive);

  // Mathe-Fortschritt: pro Thema den weiter gekommenen Stand
  out.mathProgress = { ...(b.mathProgress || {}) };
  Object.entries(a.mathProgress || {}).forEach(([k, v]) => {
    if (!out.mathProgress[k] || (v.total || 0) > (out.mathProgress[k].total || 0)) out.mathProgress[k] = v;
  });

  // XP, Streak und Abzeichen: nie etwas verlieren
  const sa = a.stats || {}, sb = b.stats || {};
  const daily = { ...(sb.daily || {}) };
  Object.entries(sa.daily || {}).forEach(([d, v]) => { daily[d] = Math.max(v, daily[d] || 0); });
  out.stats = {
    ...(aNewer ? sb : sa), ...(aNewer ? sa : sb),
    xp: Math.max(sa.xp || 0, sb.xp || 0),
    best: Math.max(sa.best || 0, sb.best || 0),
    daily,
    badges: [...new Set([...(sa.badges || []), ...(sb.badges || [])])]
  };

  // OneNote: alles Gefundene zusammen, erledigt schlägt neu
  const oa = a.onenote || {}, ob = b.onenote || {};
  const rank = { done: 3, ignored: 2, new: 1 };
  out.onenote = {
    ...(aNewer ? ob : oa), ...(aNewer ? oa : ob),
    notebooks: { ...(aNewer ? ob.notebooks : oa.notebooks), ...(aNewer ? oa.notebooks : ob.notebooks) },
    sections: { ...(ob.sections || {}), ...(oa.sections || {}) },
    texts: { ...(ob.texts || {}), ...(oa.texts || {}) },
    seen: { ...(ob.seen || {}), ...(oa.seen || {}) },
    items: byId(oa.items, ob.items, (x, y) => (rank[x.status] || 0) >= (rank[y.status] || 0) ? x : y, it => it.imgId),
    lastScan: [oa.lastScan, ob.lastScan].filter(Boolean).sort().pop() || null
  };

  // Untis und SCP: der zuletzt abgerufene Stand, Einstellungen von beiden
  const ua = a.untis || {}, ub = b.untis || {};
  if (ua.school || ub.school) {
    const win = newer(ua.lastSync, ub.lastSync) === 'a' ? ua : ub;
    out.untis = {
      ...win,
      mapping: { ...(ub.mapping || {}), ...(ua.mapping || {}) },
      hwDone: { ...(ub.hwDone || {}), ...(ua.hwDone || {}) },
      ignoredExams: [...new Set([...(ua.ignoredExams || []), ...(ub.ignoredExams || [])])]
    };
  }
  const ca = a.scp || {}, cb = b.scp || {};
  if (ca.email || cb.email) out.scp = newer(ca.lastSync, cb.lastSync) === 'a' ? ca : cb;

  // Zwei Geräte können dieselbe Untis-Arbeit oder denselben OneNote-Abschnitt unabhängig angelegt haben
  out.exams = dedupeBy(out.exams, e => e.untisId || e.scpId);
  out.decks = dedupeBy(out.decks, d => d.onenoteKey);
  out.mathSets = dedupeBy(out.mathSets, s => s.onenoteKey);

  out.updatedAt = [a.updatedAt, b.updatedAt].filter(Boolean).sort().pop();
  return out;
}

function dedupeBy(list, keyOf) {
  const seen = new Map();
  const rest = [];
  (list || []).forEach(x => {
    const k = keyOf(x);
    if (!k) return rest.push(x);
    const prev = seen.get(k);
    seen.set(k, prev ? pickNewer(x, prev) : x);
  });
  return [...rest, ...seen.values()];
}

// Gelöschte Dinge merken, damit sie nicht vom anderen Gerät zurückkommen
function markDeleted(id) {
  if (!id) return;
  state.data.deleted = state.data.deleted || {};
  state.data.deleted[id] = new Date().toISOString();
}

function touch(obj) {
  if (obj) obj.updatedAt = new Date().toISOString();
}

async function fetchCloud(full = true) {
  const { data, error } = await supabaseClient
    .from('user_data')
    .select(full ? 'data, updated_at' : 'updated_at')
    .eq('user_id', state.authUser.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

function applyCloudMerge(cloudRow) {
  const merged = normalizeData(mergeData(state.data, cloudRow.data));
  state.data = merged;
  state.cloudBase = cloudRow.updated_at;
  localStorage.setItem(DATA_KEY, JSON.stringify(state.data));
  applyTheme();
}

// Beim Login oder Start: Cloud holen und mit diesem Gerät zusammenführen
async function loadCloudData() {
  if (!state.authUser || !supabaseClient) return;
  try {
    const row = await fetchCloud(true);
    if (row?.data) applyCloudMerge(row);
    state.cloudReady = true;
    state.sync = { at: new Date().toISOString(), error: null };
    // Zusammengeführten Stand gleich wieder hochladen, damit beide Geräte gleich sind
    queueCloudSync();
  } catch (err) {
    // Bei Fehler nichts hochladen, sonst könnte ein alter Stand die Cloud überschreiben
    state.sync = { at: state.sync.at, error: err.message };
    console.warn('Cloud laden nicht möglich:', err.message);
  }
}

function queueCloudSync() {
  if (!state.authUser || !supabaseClient || !state.cloudReady) return;
  clearTimeout(state.cloudSyncTimer);
  state.cloudSyncTimer = setTimeout(syncCloudData, 800);
}

let syncing = false;
async function syncCloudData() {
  if (!state.authUser || !supabaseClient || !state.cloudReady) return;
  if (syncing) return queueCloudSync();
  syncing = true;
  try {
    // Hat ein anderes Gerät inzwischen hochgeladen? Dann erst zusammenführen.
    const head = await fetchCloud(false);
    if (head && head.updated_at !== state.cloudBase) {
      const row = await fetchCloud(true);
      if (row?.data) applyCloudMerge(row);
    }
    const now = new Date().toISOString();
    const payload = { ...state.data, learningHistory: state.data.learningHistory.slice(0, 200) };
    const { error } = await supabaseClient
      .from('user_data')
      .upsert({ user_id: state.authUser.id, data: payload, updated_at: now }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);
    state.cloudBase = now;
    state.sync = { at: now, error: null };
  } catch (err) {
    state.sync = { at: state.sync.at, error: err.message };
    console.warn('Cloud-Sync nicht möglich:', err.message);
  } finally {
    syncing = false;
  }
}

// Änderungen vom anderen Gerät holen, wenn die App wieder in den Vordergrund kommt
const SAFE_RENDER = ['home', 'subjects', 'subject', 'plan', 'profile', 'examPlan', 'onenote', 'untis', 'history'];
async function pullCloud() {
  if (!state.authUser || !supabaseClient || !state.cloudReady || syncing || state.onenoteScanning) return;
  try {
    const head = await fetchCloud(false);
    if (!head || head.updated_at === state.cloudBase) return;
    const row = await fetchCloud(true);
    if (!row?.data) return;
    applyCloudMerge(row);
    state.sync = { at: new Date().toISOString(), error: null };
    if (SAFE_RENDER.includes(state.screen)) render();
  } catch (err) {
    state.sync = { at: state.sync.at, error: err.message };
  }
}

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pullCloud(); });
window.addEventListener('focus', pullCloud);
setInterval(() => { if (document.visibilityState === 'visible') pullCloud(); }, 90000);

function syncStatusHtml() {
  if (!state.authUser) return '';
  const s = state.sync;
  if (s.error) return `<p class="status-line bad">${icon('close', 15)} Sync-Fehler: ${esc(s.error)}</p>`;
  if (!s.at) return '<p class="note">Wird synchronisiert …</p>';
  const mins = Math.round((Date.now() - new Date(s.at)) / 60000);
  return `<p class="status-line ok">${icon('check', 15)} Synchronisiert ${mins < 1 ? 'gerade eben' : `vor ${mins} Min`}</p>`;
}
