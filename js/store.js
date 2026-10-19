// Zustand, Speichern im Browser, Cloud-Sync und Übernahme alter Voc-Trainer-Daten.

const DATA_KEY = 'lernapp-data-v1';
const BOX_DAYS = [0, 1, 2, 4, 8, 16];

const savedProvider = localStorage.getItem('ai-provider');

const state = {
  screen: 'auth',
  params: {},
  data: null,
  provider: ['gemini', 'claude', 'openai'].includes(savedProvider) ? savedProvider : 'gemini',
  apiKeys: {
    gemini: localStorage.getItem('key-gemini') || '',
    claude: localStorage.getItem('key-claude') || '',
    openai: localStorage.getItem('key-openai') || ''
  },
  authUser: null,
  authMode: 'login',
  authMessage: '',
  authMessageType: '',
  isGuest: localStorage.getItem('guest-mode') === 'true',
  cloudSyncTimer: null,
  // Laufende Sitzungen (werden nicht gespeichert)
  editor: null,
  practice: null,
  mathRun: null,
  exam: null,
  tutor: null
};

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function daysBetween(fromStr, toStr) {
  const a = new Date(fromStr + 'T12:00:00');
  const b = new Date(toStr + 'T12:00:00');
  return Math.round((b - a) / 86400000);
}

function emptyData() {
  return {
    decks: [],
    folders: [],
    learningHistory: [],
    exams: [],
    examResults: [],
    mathSets: [],
    mathProgress: {},
    customSubjects: [],
    stats: { xp: 0, daily: {}, streak: 0, best: 0, lastDay: null, badges: [], dailyGoal: 100 },
    settings: { theme: 'classic' },
    onenote: { notebooks: {}, sections: {}, texts: {}, seen: {}, items: [], lastScan: null },
    updatedAt: null
  };
}

function getSubjects() {
  return [...BASE_SUBJECTS, ...(state.data.customSubjects || [])];
}

function getSubject(id) {
  return getSubjects().find(s => s.id === id) || { id, name: 'Weitere', emoji: '📦', kind: 'sach', color: '#4a4a4a' };
}

function subjectForLang(lang) {
  const hit = getSubjects().find(s => s.kind === 'sprache' && s.lang === lang);
  if (hit) return hit.id;
  return 'weitere-sprachen';
}

// Bringt Daten (lokal, Cloud oder Backup) auf den aktuellen Stand.
function normalizeData(raw) {
  const data = Object.assign(emptyData(), raw || {});
  data.stats = Object.assign(emptyData().stats, data.stats || {});
  data.settings = Object.assign({ theme: 'classic' }, data.settings || {});
  ['decks', 'folders', 'learningHistory', 'exams', 'examResults', 'mathSets', 'customSubjects'].forEach(k => {
    if (!Array.isArray(data[k])) data[k] = [];
  });
  if (!data.mathProgress || typeof data.mathProgress !== 'object') data.mathProgress = {};
  data.onenote = Object.assign(emptyData().onenote, data.onenote || {});
  if (!Array.isArray(data.onenote.items)) data.onenote.items = [];

  data.decks.forEach(d => {
    if (!d.id) d.id = uid();
    if (!d.sourceLang) d.sourceLang = 'en';
    if (!d.targetLang) d.targetLang = 'de';
    if (!d.type) d.type = 'vocab';
    if (!Array.isArray(d.cards)) d.cards = [];
    if (!Array.isArray(d.quiz)) d.quiz = [];
    if (!Array.isArray(d.pages)) d.pages = [];
    if (typeof d.folderId === 'undefined') d.folderId = null;
    d.cards.forEach(c => {
      if (!c.id) c.id = uid();
      if (typeof c.masteryLevel !== 'number') c.masteryLevel = 0;
      if (typeof c.box !== 'number') c.box = Math.min(c.masteryLevel, 3);
    });
  });
  // Fach erst setzen, wenn eigene Fächer bekannt sind
  const tmp = state.data;
  state.data = data;
  data.decks.forEach(d => { if (!d.subject) d.subject = subjectForLang(d.sourceLang); });
  if (data.decks.some(d => d.subject === 'weitere-sprachen') && !data.customSubjects.some(s => s.id === 'weitere-sprachen')) {
    data.customSubjects.push({ id: 'weitere-sprachen', name: 'Weitere Sprachen', emoji: '🗣️', kind: 'sprache', lang: 'es', color: '#176b87' });
  }
  data.folders.forEach(f => {
    if (!f.color) f.color = '#8b3a2b';
    if (!f.emoji) f.emoji = '📁';
    if (!f.subject) {
      const deck = data.decks.find(d => d.folderId === f.id);
      f.subject = deck ? deck.subject : 'englisch';
    }
  });
  state.data = tmp;
  return data;
}

function loadLocalData() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(DATA_KEY) || 'null'); } catch (e) { raw = null; }
  if (!raw) {
    // Erststart: alte Voc-Trainer-Daten übernehmen, falls auf dieser Adresse vorhanden
    raw = {};
    try { raw.decks = JSON.parse(localStorage.getItem('app-decks-v3') || '[]'); } catch (e) {}
    try { raw.folders = JSON.parse(localStorage.getItem('app-folders-v3') || '[]'); } catch (e) {}
    try { raw.learningHistory = JSON.parse(localStorage.getItem('learning-history-v1') || '[]'); } catch (e) {}
    raw.settings = { theme: localStorage.getItem('set-theme') || 'classic' };
  }
  state.data = normalizeData(raw);
}

function saveData() {
  state.data.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(state.data));
  } catch (e) {
    toast('Speicher voll. Bitte alte Karteien löschen.');
  }
  queueCloudSync();
}

function queueCloudSync() {
  if (!state.authUser || !supabaseClient) return;
  clearTimeout(state.cloudSyncTimer);
  state.cloudSyncTimer = setTimeout(syncCloudData, 600);
}

async function syncCloudData() {
  if (!state.authUser || !supabaseClient) return;
  const payload = { ...state.data, learningHistory: state.data.learningHistory.slice(0, 200) };
  const { error } = await supabaseClient
    .from('user_data')
    .upsert({ user_id: state.authUser.id, data: payload, updated_at: payload.updatedAt || new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) console.warn('Cloud-Sync nicht möglich:', error.message);
}

async function loadCloudData() {
  if (!state.authUser || !supabaseClient) return;
  const { data, error } = await supabaseClient
    .from('user_data')
    .select('data')
    .eq('user_id', state.authUser.id)
    .maybeSingle();
  if (error || !data?.data) {
    // Neues Konto: lokale Daten hochladen
    queueCloudSync();
    return;
  }
  state.data = normalizeData(data.data);
  localStorage.setItem(DATA_KEY, JSON.stringify(state.data));
  applyTheme();
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state.data, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'lernapp-backup-' + todayStr() + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function importBackup(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!confirm('Backup laden? Deine aktuellen Daten werden dadurch ersetzt.')) return;
      state.data = normalizeData(parsed);
      saveData();
      applyTheme();
      toast('Backup geladen.');
      go('home');
    } catch (err) {
      alert('Die Datei ist kein gültiges Backup.');
    }
  };
  reader.readAsText(file);
}

// ---------- Karteikarten: Wiederholung nach Lernkasten ----------

function cardIsDue(card) {
  if (!card.box) return false;
  return !card.due || card.due <= todayStr();
}

function cardIsNew(card) {
  return !card.box && !card.needsPractice;
}

function updateCard(deckId, cardId, success) {
  const deck = state.data.decks.find(d => d.id === deckId);
  const card = deck?.cards.find(c => c.id === cardId);
  if (!card) return;
  const box = success ? Math.min((card.box || 0) + 1, 5) : 0;
  card.box = box;
  card.due = todayStr(success ? BOX_DAYS[box] : 0);
  card.needsPractice = !success;
  card.masteryLevel = Math.min(box, 3);
}

function deckStats(deck) {
  const cards = deck.cards || [];
  const mastered = cards.filter(c => (c.box || 0) >= 3).length;
  return {
    total: cards.length,
    mastered,
    pct: cards.length ? Math.round(mastered / cards.length * 100) : 0,
    due: cards.filter(cardIsDue).length,
    weak: cards.filter(c => c.needsPractice).length,
    fresh: cards.filter(cardIsNew).length
  };
}

function allDueCards(subjectId) {
  const list = [];
  state.data.decks.forEach(d => {
    if (subjectId && d.subject !== subjectId) return;
    d.cards.forEach(c => { if (cardIsDue(c) || c.needsPractice) list.push({ card: c, deckId: d.id }); });
  });
  return list;
}
