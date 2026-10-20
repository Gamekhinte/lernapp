// Themen aus OneNote, ganz ohne KI: jeder OneNote-Abschnitt ist ein Thema mit Bildern, Mitschrift und Text.
// Der Lernplan nimmt diese Themen direkt, Lernkarten entstehen aus Zeilen wie "Begriff: Erklärung".

function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

// Alle Themen (Abschnitte) mit Fach, optional nur ein Fach
function oneTopics(subjectId = null) {
  const on = state.data.onenote || {};
  const nbSubject = name => (on.notebooks?.[name]?.include ? on.notebooks[name].subject : null);
  const map = {};
  const get = (key, info) => map[key] || (map[key] = {
    key, notebook: info.notebook, section: info.section || key.split(' / ').pop(),
    subject: nbSubject(info.notebook) || null, date: info.date || '', imgs: [], fresh: 0
  });
  Object.entries(on.sectionInfo || {}).forEach(([key, info]) => get(key, info));
  (on.items || []).forEach(it => {
    if (it.status === 'ignored') return;
    const t = get(it.key, it);
    t.imgs.push(it.imgId);
    if (it.status === 'new') t.fresh++;
    if ((it.date || '') > t.date) t.date = it.date;
  });
  return Object.values(map)
    .map(t => ({ ...t, notesLen: sectionNotes(t.key).length, done: !!(on.notesDone || {})[t.key] }))
    .filter(t => t.subject && (!subjectId || t.subject === subjectId) && (t.imgs.length || t.notesLen >= (KA_PAGE_RE.test(t.section) ? 20 : 120)))
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.section.localeCompare(b.section));
}

function oneTopic(key) {
  return oneTopics().find(t => t.key === key) || null;
}

// Geschätzte Lernzeit: Grundzeit plus etwas pro Bild und pro Textmenge
function topicMinutes(t) {
  const m = 15 + Math.min(4, t.imgs.length) * 5 + Math.min(20, Math.round(t.notesLen / 600) * 5);
  return Math.min(60, Math.max(15, Math.round(m / 5) * 5));
}

// Stichpunkte von einer Klassenarbeits-Seite: Aufzählungen und nummerierte Zeilen
function topicLinesFromText(text) {
  const out = [];
  String(text || '').split('\n').forEach(line => {
    // Aufzählungszeichen mitten in der Zeile trennen ("• Thema A • Thema B")
    const bits = line.split(/[•▪➢◦]/);
    bits.forEach((raw, i) => {
      const s = raw.trim();
      const m = s.match(/^(?:[-*·>]|\d{1,2}[.)]|[a-h]\))\s*(.{3,70})$/) || (i > 0 ? s.match(/^(.{3,70})$/) : null);
      if (m) pushTitle(m[1]);
    });
  });
  function pushTitle(raw) {
    const title = raw.replace(/\s+/g, ' ').replace(/[,;:]$/, '').trim();
    if (title.split(' ').length > 9 || /klassenarbeit|klausur|datum|name|seite \d/i.test(title)) return;
    if (!out.some(o => o.toLowerCase() === title.toLowerCase())) out.push(title);
  }
  return out.slice(0, 8);
}

// Themen für eine Arbeit aus OneNote: Klassenarbeits-Seite zuerst, sonst die letzten Abschnitte des Fachs
function topicsFromOneNote(exam) {
  const all = oneTopics(exam.subject);
  const ka = all.filter(t => KA_PAGE_RE.test(t.section));
  const topics = [];
  ka.forEach(t => {
    const n = sectionNotes(t.key);
    topicLinesFromText([n.typed, n.ink].join('\n')).forEach(title => {
      // Gibt es einen OneNote-Abschnitt mit dem gleichen Namen, wird mit dem gelernt
      const low = title.toLowerCase();
      const match = all.find(o => o !== t && !KA_PAGE_RE.test(o.section) && (o.section.toLowerCase().includes(low) || low.includes(o.section.toLowerCase())));
      topics.push({
        id: 'ka-' + strHash(t.key + title), title, minutes: match ? topicMinutes(match) : 30, how: 'Verstehen',
        refs: [{ type: 'note', id: (match || t).key }], summary: 'Steht auf der Seite "' + t.section + '"'
      });
    });
  });
  // Keine Stichpunkte erkannt: die Klassenarbeits-Seite selbst ist das Thema
  const pool = topics.length ? [] : (ka.length ? ka : all.filter(t => !t.done).slice(0, 4));
  pool.forEach(t => topics.push({
    id: 'o-' + strHash(t.key), title: t.section, minutes: topicMinutes(t), how: 'Mitschrift',
    refs: [{ type: 'note', id: t.key }], summary: ''
  }));
  return { topics, fromKa: ka.length > 0 };
}

// Themen ohne KI setzen: Karteien und Mathe-Themen der Arbeit plus OneNote
function setTopicsWithoutAi(exam) {
  const { topics, fromKa } = topicsFromOneNote(exam);
  const merged = [...topics, ...topicsFromSources(exam)];
  if (!merged.length) return false;
  exam.topics = merged.slice(0, 10);
  exam.topicsFrom = topics.length ? (fromKa ? 'ka-auto' : 'onenote-auto') : 'auswahl';
  exam.topicsAt = new Date().toISOString();
  touch(exam);
  return true;
}

// ---------- Lernkarten ohne KI ----------

// Zeilen wie "Photosynthese: Pflanzen machen aus Licht Zucker" oder "to go - gehen" werden Karten
function cardsFromNotes(text) {
  const cards = [];
  const seen = new Set();
  String(text || '').split(/\n|•|▪/).forEach(raw => {
    const line = raw.replace(/^\s*(?:[-*·>]|\d{1,2}[.)])\s*/, '').trim();
    const m = line.match(/^(.{2,45}?)\s*(?::|=|→|->|\s[-–]\s)\s*(.{3,200})$/);
    if (!m) return;
    const term = m[1].trim(), back = m[2].trim();
    if (term.split(' ').length > 6 || !/[A-Za-zÄÖÜäöü]{2}/.test(term) || !/[A-Za-zÄÖÜäöü]{2}/.test(back)) return;
    if (/^(name|datum|seite|aufgabe|nr|hausaufgabe|ha|lösung|https?)$/i.test(term)) return;
    const k = term.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    cards.push({ id: uid(), term, translation: back });
  });
  return cards.slice(0, 60);
}

function topicCards(key) {
  const n = sectionNotes(key);
  return cardsFromNotes([n.typed, n.ink].join('\n'));
}

function cardsFromTopic(key) {
  const t = oneTopic(key);
  if (!t) return;
  const cards = topicCards(key);
  if (!cards.length) return toast('In der Mitschrift stehen keine Zeilen wie "Begriff: Erklärung".');
  const subject = getSubject(t.subject);
  let deck = state.data.decks.find(d => d.onenoteKey === key);
  if (deck) {
    const known = new Set(deck.cards.map(c => c.term.toLowerCase()));
    deck.cards.push(...cards.filter(c => !known.has(c.term.toLowerCase())));
    touch(deck);
  } else {
    deck = {
      id: uid(), name: t.section, subject: subject.id, type: subject.kind === 'sprache' ? 'vocab' : 'facts',
      sourceLang: subject.lang || 'en', targetLang: 'de', folderId: null, cards, quiz: [], pages: t.imgs.slice(0, 12),
      onenoteKey: key, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    state.data.decks.unshift(deck);
  }
  saveData();
  toast(`${cards.length} Karten aus der Mitschrift.`);
  go('deckSetup', { deckId: deck.id });
}

// ---------- Ansicht eines Themas ----------

function renderOneTopic(container) {
  const p = state.params;
  const on = state.data.onenote;
  const t = oneTopic(p.key);
  const exam = p.examId ? state.data.exams.find(e => e.id === p.examId) : null;
  const task = exam?.tasks?.find(x => x.id === p.taskId);
  const back = p.back || (exam ? ['home', {}] : ['onenote', {}]);
  if (!t) {
    container.innerHTML = `<div class="setup-header">${backBtn(back[0], back[1])}<h3>Thema</h3><span></span></div><div class="empty">Dieses Thema gibt es nicht mehr.</div>`;
    return;
  }
  // Beim Öffnen gelten die Bilder als gesehen, der "Neu"-Hinweis verschwindet
  if (!p.marked) {
    p.marked = true;
    let changed = false;
    on.items.forEach(it => { if (it.key === t.key && it.status === 'new') { it.status = 'seen'; changed = true; } });
    if (changed) saveData();
  }
  const subject = getSubject(t.subject);
  const n = sectionNotes(t.key);
  const cards = topicCards(t.key);
  const deck = state.data.decks.find(d => d.onenoteKey === t.key);
  const set = state.data.mathSets.find(s => s.onenoteKey === t.key);
  container.innerHTML = `
    <div class="subject-head" style="--subject:${subject.color}">
      ${backBtn(back[0], back[1])}
      <h2>${esc(t.section)}</h2>
      <span></span>
    </div>
    ${task ? `<div class="card plan-hint"><p class="note" style="margin:0 0 10px;"><b>Aus deinem Lernplan:</b> ${esc(task.label)} · ${task.minutes} Min. Lies dir alles durch, schreib die wichtigsten Punkte auf und erklär sie dir selbst laut.</p>
      <button class="btn btn-primary" onclick="finishTopicTask()">${icon('check', 16)} ${task.done ? 'Erledigt' : 'Fertig gelernt'}</button></div>` : ''}
    <div class="card">
      <p class="note" style="margin-top:0;">${esc(subject.name)}${t.date ? ' · Stand ' + dateLabel(t.date) : ''} · ${t.imgs.length} Bild${t.imgs.length === 1 ? '' : 'er'}${n.ink ? ' · Handschrift' : ''}${n.typed ? ' · Text' : ''}</p>
      <label class="check-row" style="border:0;padding:0;"><input type="checkbox" ${t.done ? 'checked' : ''} onchange="setTopicDone(${jsArg(t.key)}, this.checked)"> Kann ich schon</label>
    </div>
    ${t.imgs.length ? `<h3 class="group-title">Seiten</h3><div class="one-grid">${t.imgs.map(id => `<div class="one-item" onclick="openImage('${id}')">${imgTag(id, 'thumb', false)}</div>`).join('')}</div>` : ''}
    ${n.ink ? `<h3 class="group-title">Handschrift</h3><div class="notes-box">${esc(n.ink).replace(/\n/g, '<br>')}</div><p class="note">Automatisch erkannt, einzelne Wörter können falsch sein.</p>` : ''}
    ${n.typed ? `<h3 class="group-title">Text</h3><div class="notes-box">${esc(n.typed).replace(/\n/g, '<br>')}</div>` : ''}
    <h3 class="group-title">Lernen</h3>
    <div class="card">
      ${deck ? `<button class="btn btn-primary" onclick="go('deckSetup', {deckId:'${deck.id}'})">${icon('cards', 16)} Kartei "${esc(deck.name)}" lernen (${deck.cards.length})</button>` : ''}
      ${set ? `<button class="btn btn-primary" style="margin-top:8px;" onclick="startMathRun({ setId: '${set.id}' })">Aufgaben üben (${set.tasks.length})</button>` : ''}
      ${cards.length ? `<button class="btn btn-outline" style="margin-top:8px;" onclick="cardsFromTopic(${jsArg(t.key)})">${cards.length} Karten aus der Mitschrift${deck ? ' ergänzen' : ''}</button>
        <p class="note">Aus Zeilen wie "Begriff: Erklärung". Geht ohne KI.</p>` : `<p class="note" style="margin-top:${deck || set ? '10px' : '0'};">Tipp: Schreib in OneNote Zeilen wie <b>Begriff: Erklärung</b>, dann baut die App daraus Lernkarten, ganz ohne KI.</p>`}
      ${subject.kind === 'mathe' ? `<button class="btn btn-outline" style="margin-top:8px;" onclick="go('subject', {id:'mathe'})">Passende Mathe-Übungen</button>` : ''}
      ${hasAiKey() ? `<details class="solution" style="margin-top:12px;"><summary>Mit KI (braucht deinen API-Schlüssel)</summary>
        <div class="row-2" style="margin-top:8px;">
          ${t.imgs.length ? `<button class="btn btn-outline btn-sm" onclick="aiFromTopicImages(${jsArg(t.key)})">Bilder auswerten</button>` : ''}
          ${n.length >= 120 ? `<button class="btn btn-outline btn-sm" onclick='learnFromNotes(${jsArg(t.key)})'>Aus der Mitschrift</button>` : ''}
        </div></details>` : ''}
    </div>`;
}

function setTopicDone(key, done) {
  const on = state.data.onenote;
  on.notesDone = { ...(on.notesDone || {}) };
  if (done) on.notesDone[key] = true; else delete on.notesDone[key];
  saveData();
  render();
}

function finishTopicTask() {
  const p = state.params;
  const exam = state.data.exams.find(e => e.id === p.examId);
  const task = exam?.tasks?.find(x => x.id === p.taskId);
  if (task && !task.done) {
    task.done = true;
    touch(exam);
    addXp(10);
    saveData();
    toast('Erledigt, stark.');
  }
  const back = p.back || ['home', {}];
  go(back[0], back[1]);
}

function aiFromTopicImages(key) {
  const ids = state.data.onenote.items.filter(it => it.key === key && ['new', 'seen'].includes(it.status)).map(it => it.id);
  if (!ids.length) return toast('Die Bilder sind schon ausgewertet.');
  state.params.sel = ids;
  processOneNote();
}

// Plan-Aufgabe ohne Material und ohne KI: kurz selbst lernen und abhaken
function selfStudyTask(exam, task) {
  const topic = (exam.topics || []).find(t => t.id === task.topicId) || { title: task.label, summary: '' };
  openModal(`
    <h3 class="modal-title">${esc(topic.title)}</h3>
    ${topic.summary ? `<p class="note" style="margin-top:0;">${esc(topic.summary)}</p>` : ''}
    <ol class="solution-steps">
      <li>Heft, Buch oder Arbeitsblatt zu dem Thema raussuchen.</li>
      <li>Alles einmal durchlesen und die 5 wichtigsten Punkte aufschreiben.</li>
      <li>Heft zu und die Punkte laut erklären, als würdest du es jemandem beibringen.</li>
      <li>Was nicht geklappt hat, nochmal nachlesen.</li>
    </ol>
    <div class="row-2" style="margin-top:14px;">
      ${hasAiKey() ? `<button class="btn btn-outline" onclick="closeModal(); startTutorTopicById('${exam.id}', '${task.id}')">Mit KI erklären</button>` : `<button class="btn btn-outline" onclick="closeModal()">Später</button>`}
      <button class="btn btn-primary" onclick="closeModal(); markPlanTaskDone('${exam.id}', '${task.id}')">${icon('check', 16)} Erledigt</button>
    </div>`);
}

function startTutorTopicById(examId, taskId) {
  const exam = state.data.exams.find(e => e.id === examId);
  const task = exam?.tasks?.find(x => x.id === taskId);
  if (task) startTutorTopic(exam, task);
}

function markPlanTaskDone(examId, taskId) {
  const exam = state.data.exams.find(e => e.id === examId);
  const task = exam?.tasks?.find(x => x.id === taskId);
  if (!task) return;
  task.done = true;
  touch(exam);
  addXp(10);
  saveData();
  render();
}

// ---------- Themenliste auf der OneNote-Seite ----------

function topicListHtml(subjectId = null) {
  const list = oneTopics(subjectId);
  if (!list.length) return '';
  const bySubject = {};
  list.forEach(t => (bySubject[t.subject] = bySubject[t.subject] || []).push(t));
  return Object.entries(bySubject).map(([sid, items]) => {
    const subj = getSubject(sid);
    return `
      <h3 class="group-title">${esc(subj.name)} · ${items.length} ${items.length === 1 ? 'Thema' : 'Themen'}</h3>
      <div class="card tight">
        ${items.slice(0, subjectId ? 60 : 8).map(t => `
          <div class="task-row topic-row ${t.done ? 'done' : ''}" onclick='go("oneTopic", {key: ${jsArg(t.key)}})'>
            ${subjectBadge(subj, 'sm')}
            <div class="task-text"><span>${esc(t.section)}${t.fresh ? ' <em class="new-pill">neu</em>' : ''}</span>
              <small>${t.date ? dateLabel(t.date) + ' · ' : ''}${t.imgs.length} Bild${t.imgs.length === 1 ? '' : 'er'}${t.notesLen >= 120 ? ' · Mitschrift' : ''}${t.done ? ' · kann ich' : ''}</small></div>
            <span class="chev">›</span>
          </div>`).join('')}
        ${!subjectId && items.length > 8 ? `<button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="go('onenote', {subject:'${sid}'})">Alle ${items.length} anzeigen</button>` : ''}
      </div>`;
  }).join('');
}
