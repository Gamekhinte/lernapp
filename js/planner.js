// Lernplaner: verteilt den Stoff aller anstehenden Arbeiten auf die eingestellten Lernzeiten, mit Uhrzeit.
// Den Stoff findet die KI aus OneNote (Seite "Klassenarbeit" o. ä. oder die letzten Themen), Untis und dem SCP.

const KA_PAGE_RE = /klassenarbeit|klausur|\btest\b|lernzettel|themen|stoff|\bka\b|lzk|lernkontrolle|vorbereitung|übersicht/i;

const DEFAULT_STUDY = {
  days: {
    0: { on: false, from: '16:00', to: '18:00' },
    1: { on: true, from: '16:00', to: '18:00' },
    2: { on: true, from: '16:00', to: '18:00' },
    3: { on: true, from: '16:00', to: '18:00' },
    4: { on: true, from: '16:00', to: '18:00' },
    5: { on: true, from: '15:00', to: '17:00' },
    6: { on: true, from: '10:00', to: '12:00' }
  },
  maxMin: 60,
  unitMin: 25,
  notify: false
};

function studySettings() {
  const s = state.data.settings;
  if (!s.study) s.study = JSON.parse(JSON.stringify(DEFAULT_STUDY));
  for (let d = 0; d < 7; d++) if (!s.study.days[d]) s.study.days[d] = { ...DEFAULT_STUDY.days[d] };
  return s.study;
}

const toMin = t => { const [h, m] = String(t || '0:0').split(':').map(Number); return h * 60 + (m || 0); };
const fmtTime = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');

function dayWindow(date) {
  const st = studySettings();
  const cfg = st.days[new Date(date + 'T12:00:00').getDay()];
  if (!cfg?.on) return null;
  let from = toMin(cfg.from);
  const to = toMin(cfg.to);
  if (date === todayStr()) {
    const now = new Date();
    from = Math.max(from, Math.ceil((now.getHours() * 60 + now.getMinutes() + 5) / 5) * 5);
  }
  return to - from >= 10 ? { from, to } : null;
}

function dayCapacity(date) {
  const w = dayWindow(date);
  return w ? Math.min(w.to - w.from, studySettings().maxMin) : 0;
}

// Ohne KI: jede ausgewählte Kartei oder jedes Mathe-Thema ist ein Thema
function topicsFromSources(exam) {
  return (exam.sources || []).map(s => ({
    id: 's-' + s.type + '-' + s.id, title: sourceName(s), minutes: 30,
    how: s.type === 'deck' ? 'Karteikarten' : 'Aufgaben', refs: [s], summary: ''
  }));
}

function ensureTopics(exam) {
  if (!Array.isArray(exam.topics) || !exam.topics.length) exam.topics = topicsFromSources(exam);
}

function topicRef(topic) {
  const r = topic.refs?.[0];
  if (r && (r.type === 'deck' ? state.data.decks.some(d => d.id === r.id) : r.type === 'set' ? state.data.mathSets.some(m => m.id === r.id) : true)) {
    return { type: r.type, id: r.id };
  }
  return { type: 'tutor', topicId: topic.id };
}

// Plant alle anstehenden Arbeiten zusammen. extra = neue Arbeit, die noch nicht in der Liste steht.
function rebuildAllPlans(extra = null) {
  const today = todayStr();
  const st = studySettings();
  const exams = state.data.exams.filter(e => e.date > today);
  if (extra && extra.date > today && !exams.includes(extra)) exams.push(extra);
  exams.sort((a, b) => a.date.localeCompare(b.date));
  const used = {};
  const placed = [];

  exams.forEach(exam => {
    ensureTopics(exam);
    const old = new Map((exam.tasks || []).map(t => [t.id, t]));
    const oldDone = new Set((exam.tasks || []).filter(t => t.done).map(t => t.date + '|' + t.label));
    const n = Math.max(0, daysBetween(today, exam.date));
    let days = Array.from({ length: n }, (_, i) => todayStr(i)).filter(d => dayCapacity(d) > 0);
    if (!days.length) days = [today];
    const free = d => dayCapacity(d) - (used[d] || 0);
    const take = (d, m) => { used[d] = (used[d] || 0) + m; };
    // Gleichmäßig verteilen: Einheit i von n bekommt bevorzugt den passenden Tag im Zeitraum, sonst den nächsten mit Platz
    const pick = (pool, minutes, i, n) => {
      const want = Math.min(pool.length - 1, Math.floor(i * pool.length / Math.max(1, n)));
      const near = pool.map((d, k) => ({ d, dist: Math.abs(k - want) })).sort((a, b) => a.dist - b.dist).map(x => x.d);
      return near.find(d => free(d) >= minutes) || [...pool].sort((a, b) => free(b) - free(a))[0];
    };

    const hasExamDay = days.length >= 2;
    const lastDay = days[days.length - 1];
    const learnPool = hasExamDay ? days.slice(0, Math.max(1, Math.ceil((days.length - 1) * 0.6))) : days;
    const reviewPool = hasExamDay ? days.slice(learnPool.length, days.length - 1) : [];
    const tasks = [];
    const add = (date, unit) => {
      take(date, unit.minutes);
      const t = { ...unit, date, done: false };
      t.done = !!(old.get(t.id)?.done || oldDone.has(t.date + '|' + t.label));
      tasks.push(t);
    };

    // Themen in gleich große Einheiten teilen (z. B. 45 Min bei 25er Einheiten: 2 x 25, kein 5-Minuten-Rest)
    const learnUnits = [];
    exam.topics.forEach(topic => {
      const total = Math.max(10, topic.minutes || 30);
      const parts = Math.max(1, Math.round(total / st.unitMin));
      const each = Math.max(10, Math.round(total / parts / 5) * 5);
      for (let k = 0; k < parts; k++) {
        learnUnits.push({
          id: `${exam.id}:l:${topic.id}:${k}`, kind: 'learn', minutes: each, topicId: topic.id,
          label: `${topic.title}${parts > 1 ? ` (Teil ${k + 1})` : ''}`, ref: topicRef(topic)
        });
      }
    });
    learnUnits.forEach((u, i) => add(pick(learnPool, u.minutes, i, learnUnits.length), u));
    if (reviewPool.length) {
      exam.topics.forEach((topic, i) => {
        const m = Math.max(10, Math.round((topic.minutes || 30) * 0.4 / 5) * 5);
        add(pick(reviewPool, m, i, exam.topics.length), {
          id: `${exam.id}:r:${topic.id}`, kind: 'review', minutes: m, topicId: topic.id,
          label: `Wiederholen: ${topic.title}`, ref: topicRef(topic)
        });
      });
    }
    if (hasExamDay) add(lastDay, { id: `${exam.id}:e`, kind: 'exam', minutes: 30, label: 'Probearbeit schreiben', ref: { type: 'exam' } });
    exam.tasks = tasks;
    placed.push(...tasks.map(t => ({ t, exam })));
  });

  // Uhrzeiten vergeben: pro Tag der Reihe nach, frühere Arbeit zuerst, mit 5 Minuten Pause
  const byDay = {};
  placed.forEach(p => (byDay[p.t.date] = byDay[p.t.date] || []).push(p));
  const order = { learn: 0, review: 1, exam: 2 };
  Object.entries(byDay).forEach(([date, list]) => {
    const w = dayWindow(date) || { from: toMin(studySettings().days[new Date(date + 'T12:00:00').getDay()].from), to: 24 * 60 };
    let t = w.from;
    list.sort((a, b) => a.exam.date.localeCompare(b.exam.date) || order[a.t.kind] - order[b.t.kind]);
    list.forEach(p => { p.t.time = fmtTime(Math.min(t, 23 * 60)); t += p.t.minutes + 5; });
  });
  return extra ? extra.tasks : null;
}

// ---------- Stoff mit KI finden ----------

function examContext(exam) {
  const on = state.data.onenote || {};
  const notebooks = Object.entries(on.notebooks || {}).filter(([, nb]) => nb.subject === exam.subject).map(([name]) => name);
  const sections = {};
  (on.items || []).forEach(it => {
    if (!notebooks.includes(it.notebook)) return;
    const s = sections[it.key] || (sections[it.key] = { key: it.key, name: it.section, date: it.date || '', imgs: [] });
    s.imgs.push(it.imgId);
    if ((it.date || '') > s.date) s.date = it.date;
  });
  Object.keys(on.texts || {}).forEach(k => {
    if (notebooks.some(nb => k.startsWith(nb + ' / ')) && !sections[k]) sections[k] = { key: k, name: k.split(' / ').pop(), date: '', imgs: [] };
  });
  const all = Object.values(sections);
  const kaPages = all.filter(s => KA_PAGE_RE.test(s.name));
  const chosen = kaPages.length ? kaPages : all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  return {
    fromKaPage: kaPages.length > 0,
    sections: chosen.map(s => ({ name: s.name, text: cleanOneText(on.texts?.[s.key] || '').slice(0, 1800), imgs: s.imgs.slice(0, 2) }))
  };
}

// Links, Dateipfade und Namen von Lehrer-PCs aus dem OneNote-Text entfernen
function cleanOneText(text) {
  return String(text).split('\n').filter(l => !/HYPERLINK|file:|[A-Z]:\\|\\Users\\|Exported|\.html?\b/i.test(l)).join('\n');
}

async function findTopicsWithAi(exam, { silent = false } = {}) {
  if (!hasAiKey()) { if (!silent) setApiKey(); return false; }
  const subject = getSubject(exam.subject);
  const ctx = examContext(exam);
  const images = [];
  for (const s of ctx.sections.slice(0, 2)) for (const id of s.imgs) {
    const b64 = await getImageBase64(id).catch(() => null);
    if (b64 && images.length < 3) images.push(b64);
  }
  const decks = state.data.decks.filter(d => d.subject === exam.subject).map(d => `deck:${d.id} = ${d.name} (${d.cards.length} Karten)`);
  const math = subject.kind === 'mathe' ? MATH_TOPICS.map(t => `topic:${t.id} = ${t.name}`).concat(state.data.mathSets.map(m => `set:${m.id} = ${m.title}`)) : [];
  const prompt = `${SCHOOL_CONTEXT}
Es steht eine Arbeit an: ${exam.title} am ${exam.date} im Fach ${subject.name}.
${exam.note ? `Info aus Untis oder dem Schulportal: ${exam.note}\n` : ''}${ctx.fromKaPage ? 'Die Lehrkraft hat eine Seite zur Klassenarbeit hochgeladen, die ist am wichtigsten:' : 'Das sind die letzten Themen aus dem OneNote-Notizbuch:'}
${ctx.sections.map(s => `--- ${s.name} ---\n${s.text || '(nur Bilder)'}`).join('\n') || '(keine OneNote-Inhalte vorhanden)'}

Lernmaterial, das es in der App schon gibt (IDs nur aus dieser Liste verwenden):
${[...decks, ...math].join('\n') || '(nichts)'}

Erstelle eine Liste der Themen, die für diese Arbeit gelernt werden müssen (3 bis 8 Themen). Schätze pro Thema die Lernzeit in Minuten (10 bis 90) für eine Schülerin oder einen Schüler der 9. Klasse. Ordne passende App-Materialien über "refs" zu, wenn sie wirklich passen. "summary" sagt in 1 bis 2 Sätzen, was man zu dem Thema können muss.
JSON: {"topics":[{"title":"...","minutes":30,"how":"Karteikarten|Aufgaben|Verstehen","refs":["deck:..."],"summary":"..."}]}`;
  try {
    const res = await aiAsk(prompt, images);
    const valid = new Set([...decks, ...math].map(l => l.split(' = ')[0]));
    const topics = (res.topics || []).filter(t => t?.title).slice(0, 8).map((t, i) => ({
      id: 'k' + i + '-' + uid().slice(0, 4),
      title: String(t.title).slice(0, 80),
      minutes: Math.min(90, Math.max(10, Math.round((Number(t.minutes) || 30) / 5) * 5)),
      how: String(t.how || ''),
      summary: String(t.summary || '').slice(0, 300),
      refs: (t.refs || []).map(String).filter(r => valid.has(r)).map(r => { const [type, ...id] = r.split(':'); return { type, id: id.join(':') }; })
    }));
    if (!topics.length) throw new Error('Keine Themen gefunden.');
    exam.topics = topics;
    exam.topicsFrom = ctx.fromKaPage ? 'ka' : ctx.sections.length ? 'onenote' : 'ki';
    exam.topicsAt = new Date().toISOString();
    touch(exam);
    rebuildAllPlans();
    saveData();
    if (!silent) toast(`${topics.length} Themen gefunden, Plan steht.`);
    return true;
  } catch (err) {
    if (!silent) toast('Stoff suchen hat nicht geklappt: ' + err.message);
    return false;
  }
}

// Im Hintergrund: neue Arbeiten ohne KI-Themen und neue "Klassenarbeit"-Seiten in OneNote
let autoTopicsRunning = false;
async function autoFindTopics() {
  if (autoTopicsRunning || !hasAiKey()) return;
  autoTopicsRunning = true;
  try {
    const today = todayStr();
    for (const exam of state.data.exams.filter(e => e.date > today)) {
      const ctx = examContext(exam);
      const needs = !exam.topicsFrom || (ctx.fromKaPage && exam.topicsFrom !== 'ka');
      if (needs) await findTopicsWithAi(exam, { silent: true });
    }
  } finally {
    autoTopicsRunning = false;
    if (['home', 'plan', 'examPlan'].includes(state.screen)) render();
  }
}

// ---------- Lernzeiten einstellen ----------

function studySettingsHtml() {
  const st = studySettings();
  const order = [1, 2, 3, 4, 5, 6, 0];
  return `
    <div class="card">
      <h3 class="card-title">Lernzeiten</h3>
      <p class="note" style="margin-top:0;">Wann du lernen kannst. Der Plan verteilt den Stoff nur auf diese Zeiten.</p>
      ${order.map(d => {
        const c = st.days[d];
        return `<div class="study-row ${c.on ? '' : 'off'}">
          <label class="check-row" style="border:0; padding:0;"><input type="checkbox" ${c.on ? 'checked' : ''} onchange="setStudyDay(${d}, 'on', this.checked)"> ${WEEKDAYS[d]}</label>
          <input type="time" value="${c.from}" ${c.on ? '' : 'disabled'} onchange="setStudyDay(${d}, 'from', this.value)">
          <span>bis</span>
          <input type="time" value="${c.to}" ${c.on ? '' : 'disabled'} onchange="setStudyDay(${d}, 'to', this.value)">
        </div>`;
      }).join('')}
      <div class="row-2" style="margin-top:12px;">
        <div><label class="field-label">Höchstens pro Tag</label>
          <select onchange="setStudyValue('maxMin', Number(this.value))">${[30, 45, 60, 90, 120, 180].map(v => `<option value="${v}" ${st.maxMin === v ? 'selected' : ''}>${v} Min</option>`).join('')}</select></div>
        <div><label class="field-label">Eine Einheit</label>
          <select onchange="setStudyValue('unitMin', Number(this.value))">${[15, 20, 25, 30, 45].map(v => `<option value="${v}" ${st.unitMin === v ? 'selected' : ''}>${v} Min</option>`).join('')}</select></div>
      </div>
      <label class="field-label" style="margin-top:14px;">Erinnerungen</label>
      ${pushStatusHtml()}
    </div>`;
}

function setStudyDay(d, key, value) {
  studySettings().days[d][key] = value;
  rebuildAllPlans();
  saveData();
  render();
}

function setStudyValue(key, value) {
  studySettings()[key] = value;
  rebuildAllPlans();
  saveData();
  render();
}

// ---------- Aufgabe aus dem Plan starten, die kein App-Material hat ----------

function startTutorTopic(exam, task) {
  const topic = (exam.topics || []).find(t => t.id === task.topicId) || { title: task.label, summary: '' };
  task.done = true;
  saveData();
  const ctx = examContext(exam);
  // Der OneNote-Text geht nur an die KI, im Chat steht nur die kurze Frage
  const context = `Ich lerne für "${exam.title}" am ${dateLabel(exam.date)}.${topic.summary ? ` Zum Thema wichtig: ${topic.summary}` : ''}
${ctx.sections.length ? `Aus meinem OneNote dazu (Texterkennung, kann Fehler enthalten):\n${ctx.sections.map(s => s.text).join('\n').slice(0, 1500)}\n` : ''}Erklär mir das Wichtigste kurz und verständlich. Stell mir danach nacheinander 5 Fragen dazu, immer nur eine, und warte auf meine Antwort.`;
  explainWithTutor(`Erklär mir "${topic.title}" und frag mich danach ab.`, exam.subject, ['home', {}], context);
}
