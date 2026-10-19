// Fächer mit Karteien: Ordner, Editor, Foto-Scan, KI-Themen und alle Lernmodi.

// ---------- Fächer-Übersicht ----------

function renderSubjects(container) {
  const cards = getSubjects().map(s => {
    const decks = state.data.decks.filter(d => d.subject === s.id);
    const due = allDueCards(s.id).length;
    const exam = nextExam(s.id);
    let meta;
    if (s.kind === 'mathe') {
      const done = Object.values(state.data.mathProgress).reduce((n, p) => n + (p.correct || 0), 0);
      meta = `${MATH_TOPICS.length} THEMEN · ${done} RICHTIG GELÖST`;
    } else {
      const total = decks.reduce((n, d) => n + d.cards.length, 0);
      meta = `${decks.length} KARTEI${decks.length === 1 ? '' : 'EN'} · ${total} KARTEN${due ? ` · ${due} FÄLLIG` : ''}`;
    }
    return `
      <div class="deck-card subject-card" style="--subject:${s.color}" onclick="go('subject', {id:'${s.id}'})">
        ${subjectBadge(s, 'lg')}
        <div class="deck-info" style="flex:1;">
          <h3>${esc(s.name)}</h3>
          <p>${meta}</p>
          ${exam ? `<p class="exam-hint">${esc(exam.title)} in ${countdownText(exam.date)}</p>` : ''}
        </div>
        <span class="chev">›</span>
      </div>`;
  }).join('');
  container.innerHTML = `
    <h2 class="page-title">Fächer</h2>
    ${cards}
    <button class="btn btn-outline" onclick="openSubjectModal()">+ Fach hinzufügen</button>
  `;
}

function openSubjectModal(editId = null) {
  const s = editId ? state.data.customSubjects.find(x => x.id === editId) : null;
  openModal(`
    <h3 class="modal-title">${s ? 'Fach bearbeiten' : 'Neues Fach'}</h3>
    <div style="display:flex; gap:10px; margin-bottom:12px;">
      <input type="text" id="subAbbr" value="${esc(s?.abbr || '')}" maxlength="3" placeholder="Kürzel" style="width:84px; text-align:center;">
      <input type="text" id="subName" value="${esc(s?.name || '')}" placeholder="z. B. Deutsch, Religion, Physik" style="flex:1;">
    </div>
    <label class="field-label">Art des Fachs</label>
    <select id="subKind">
      <option value="sach" ${s?.kind !== 'sprache' ? 'selected' : ''}>Lernkarten und Quiz (z. B. Deutsch, Reli, Physik)</option>
      <option value="sprache" ${s?.kind === 'sprache' ? 'selected' : ''}>Fremdsprache mit Vokabeln</option>
    </select>
    <label class="field-label" style="margin-top:12px;">Sprache (nur bei Fremdsprache)</label>
    <select id="subLang">${LANGUAGES.filter(l => l.code !== 'auto' && l.code !== 'de').map(l => `<option value="${l.code}" ${(s?.lang || 'es') === l.code ? 'selected' : ''}>${l.name}</option>`).join('')}</select>
    <div class="row-2" style="margin-top:18px;">
      ${s ? `<button class="btn btn-danger" onclick="deleteSubject('${s.id}')">Löschen</button>` : `<button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>`}
      <button class="btn btn-primary" onclick="saveSubject(${s ? `'${s.id}'` : 'null'})">Speichern</button>
    </div>
  `);
}

function saveSubject(editId) {
  const name = document.getElementById('subName').value.trim();
  if (!name) return;
  const entry = {
    id: editId || 'f-' + uid(),
    name,
    abbr: document.getElementById('subAbbr').value.trim() || '',
    kind: document.getElementById('subKind').value,
    lang: document.getElementById('subLang').value,
    color: pick(FOLDER_COLORS)
  };
  if (editId) {
    const i = state.data.customSubjects.findIndex(x => x.id === editId);
    entry.color = state.data.customSubjects[i].color;
    state.data.customSubjects[i] = entry;
  } else {
    state.data.customSubjects.push(entry);
  }
  saveData();
  closeModal();
  render();
}

function deleteSubject(id) {
  const count = state.data.decks.filter(d => d.subject === id).length;
  if (!confirm(count ? `Fach löschen? ${count} Kartei(en) darin werden mit gelöscht.` : 'Fach löschen?')) return;
  state.data.customSubjects = state.data.customSubjects.filter(s => s.id !== id);
  state.data.decks = state.data.decks.filter(d => d.subject !== id);
  state.data.folders = state.data.folders.filter(f => f.subject !== id);
  saveData();
  go('subjects');
}

// ---------- Fach-Seite ----------

function renderSubject(container) {
  const subject = getSubject(state.params.id);
  if (subject.kind === 'mathe') return renderMathSubject(container, subject);

  const folderId = state.params.folderId || null;
  const folder = folderId ? state.data.folders.find(f => f.id === folderId) : null;
  const due = allDueCards(subject.id).length;
  const exam = nextExam(subject.id);
  const isCustom = state.data.customSubjects.some(s => s.id === subject.id);

  let html = `
    <div class="subject-head" style="--subject:${subject.color}">
      ${backBtn(folder ? 'subject' : 'subjects', folder ? { id: subject.id } : {}, folder ? esc(subject.name) : 'Fächer')}
      <h2>${folder ? esc(folder.name) : esc(subject.name)}</h2>
      ${folder ? `<button class="icon-btn" onclick="editFolder('${folder.id}')" title="Bearbeiten">${icon('edit', 16)}</button>` : isCustom ? `<button class="icon-btn" onclick="openSubjectModal('${subject.id}')" title="Bearbeiten">${icon('edit', 16)}</button>` : '<span></span>'}
    </div>
    ${exam ? examBanner(exam) : ''}
    ${oneNoteBanner(subject.id)}
    <div class="quick-grid">
      <button class="btn btn-primary" ${due ? '' : 'disabled'} onclick="startDueReview('${subject.id}')">${icon('repeat', 16)} Wiederholen${due ? ` (${due})` : ''}</button>
      <button class="btn btn-outline" onclick="go('examSetup', {subject:'${subject.id}'})">${icon('pen', 16)} Probearbeit</button>
      <button class="btn btn-outline" onclick="openTutor('${subject.id}')">${icon('chat', 16)} Fragen</button>
    </div>
  `;

  if (!folder) {
    const folders = state.data.folders.filter(f => f.subject === subject.id);
    html += folders.map(f => {
      const count = state.data.decks.filter(d => d.folderId === f.id).length;
      return `
        <div class="deck-card" style="background:${f.color}; color:${getContrastColor(f.color)};" onclick="go('subject', {id:'${subject.id}', folderId:'${f.id}'})">
          <div class="deck-info" style="flex:1;"><h3>${icon('folder', 17)} ${esc(f.name)}</h3><p style="color:inherit; opacity:.8;">${count} KARTEI${count === 1 ? '' : 'EN'}</p></div>
          <span class="chev">›</span>
        </div>`;
    }).join('');
  }

  const decks = state.data.decks.filter(d => d.subject === subject.id && (d.folderId || null) === folderId);
  const hasFolders = !folder && state.data.folders.some(f => f.subject === subject.id);
  if (!decks.length && !hasFolders) {
    html += `<div class="empty">${subject.kind === 'sprache'
      ? 'Noch keine Vokabeln. Vokabelliste aus dem Buch fotografieren oder Kartei anlegen.'
      : 'Noch keine Lernkarten. Buchseite oder Hefteintrag fotografieren, daraus werden Karten und Quizfragen.'}</div>`;
  }
  html += decks.map(deckCardHtml).join('');

  html += `
    <div class="action-grid">
      <input type="file" accept="image/*" id="scanInput" multiple hidden onchange="scanPhotos(event, '${subject.id}')">
      <button class="btn btn-primary" onclick="document.getElementById('scanInput').click()">${icon('camera')} ${subject.kind === 'sprache' ? 'Vokabeln scannen' : 'Buchseite scannen'}</button>
      <button class="btn btn-outline" onclick="openAiTopicModal('${subject.id}')">${icon('pen')} Thema eingeben</button>
      <div class="row-2">
        <button class="btn btn-outline" onclick="newDeck('${subject.id}')">+ Kartei</button>
        ${folder ? '' : `<button class="btn btn-outline" onclick="createFolder('${subject.id}')">${icon('folder')} Ordner</button>`}
      </div>
    </div>
  `;
  container.innerHTML = html;
}

function deckCardHtml(d) {
  const st = deckStats(d);
  const typeLabel = d.type === 'vocab' ? 'VOKABELN' : 'KARTEN';
  return `
    <div class="deck-card" onclick="go('deckSetup', {deckId:'${d.id}'})">
      <div class="deck-info" style="flex:1; min-width:0;">
        <h3>${esc(d.name)}</h3>
        <p>${st.total} ${typeLabel}${d.quiz.length ? ` · ${d.quiz.length} QUIZ` : ''} · ${st.pct}% SICHER${st.due ? ` · ${st.due} FÄLLIG` : ''}</p>
        <div class="bar small"><div style="width:${st.pct}%"></div></div>
      </div>
      <div class="deck-actions" onclick="event.stopPropagation()">
        ${st.weak ? `<button class="icon-btn" style="color:var(--red)" onclick="practiceWeak('${d.id}')" title="Schwierige üben">${icon('target', 16)} ${st.weak}</button>` : ''}
        <button class="icon-btn" onclick="chooseFolderForDeck('${d.id}')" title="Verschieben">${icon('folder', 16)}</button>
        <button class="icon-btn" onclick="editDeck('${d.id}')" title="Bearbeiten">${icon('edit', 16)}</button>
        <button class="icon-btn" onclick="deleteDeck('${d.id}')" title="Löschen">${icon('trash', 16)}</button>
      </div>
    </div>`;
}

// ---------- Ordner ----------

function folderModal(title, f, onSave) {
  openModal(`
    <h3 class="modal-title">${title}</h3>
    <div style="display:flex; gap:10px; margin-bottom:14px;">
      <input type="text" id="folderName" value="${esc(f?.name || '')}" placeholder="Name des Ordners" style="flex:1;" onkeydown="if(event.key==='Enter') ${onSave}">
    </div>
    <label class="field-label">Farbe</label>
    <div class="color-row">${FOLDER_COLORS.map(c => `<button class="color-dot ${(f?.color || FOLDER_COLORS[0]) === c ? 'active' : ''}" style="background:${c}" onclick="document.querySelectorAll('.color-dot').forEach(b=>b.classList.remove('active')); this.classList.add('active'); document.getElementById('folderColor').value='${c}'"></button>`).join('')}</div>
    <input type="hidden" id="folderColor" value="${f?.color || FOLDER_COLORS[0]}">
    <div class="row-2" style="margin-top:18px;">
      ${f ? `<button class="btn btn-danger" onclick="deleteFolder('${f.id}')">Löschen</button>` : `<button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>`}
      <button class="btn btn-primary" onclick="${onSave}">Speichern</button>
    </div>
  `);
}

function createFolder(subjectId) {
  folderModal('Neuer Ordner', null, `confirmFolder(null, '${subjectId}')`);
}

function editFolder(id) {
  const f = state.data.folders.find(x => x.id === id);
  if (f) folderModal('Ordner bearbeiten', f, `confirmFolder('${id}')`);
}

function confirmFolder(id, subjectId) {
  const name = document.getElementById('folderName').value.trim();
  if (!name) return;
  const color = document.getElementById('folderColor').value;
  if (id) Object.assign(state.data.folders.find(f => f.id === id), { name, color });
  else state.data.folders.push({ id: uid(), name, color, subject: subjectId });
  saveData();
  closeModal();
  render();
}

function deleteFolder(id) {
  if (!confirm('Ordner löschen? Die Karteien darin bleiben erhalten.')) return;
  const f = state.data.folders.find(x => x.id === id);
  state.data.folders = state.data.folders.filter(x => x.id !== id);
  state.data.decks.forEach(d => { if (d.folderId === id) d.folderId = null; });
  saveData();
  go('subject', { id: f?.subject || state.params.id });
}

function chooseFolderForDeck(deckId) {
  const deck = state.data.decks.find(d => d.id === deckId);
  const folders = state.data.folders.filter(f => f.subject === deck.subject);
  openModal(`
    <h3 class="modal-title">Kartei verschieben</h3>
    <button class="btn btn-outline" style="margin-bottom:10px;" onclick="setDeckFolder('${deckId}', null)">Kein Ordner</button>
    ${folders.map(f => `<button class="btn btn-outline" style="margin-bottom:8px;" onclick="setDeckFolder('${deckId}', '${f.id}')">${esc(f.name)}</button>`).join('') || '<p class="note">In diesem Fach gibt es noch keine Ordner.</p>'}
    <label class="field-label" style="margin-top:14px;">Oder in ein anderes Fach</label>
    <select onchange="moveDeckSubject('${deckId}', this.value)">
      ${getSubjects().filter(s => s.kind !== 'mathe').map(s => `<option value="${s.id}" ${s.id === deck.subject ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
    </select>
  `);
}

function setDeckFolder(deckId, folderId) {
  state.data.decks.find(d => d.id === deckId).folderId = folderId;
  saveData();
  closeModal();
  render();
}

function moveDeckSubject(deckId, subjectId) {
  const deck = state.data.decks.find(d => d.id === deckId);
  deck.subject = subjectId;
  deck.folderId = null;
  saveData();
  closeModal();
  toast('Kartei verschoben.');
  render();
}

// ---------- Editor ----------

function newDeck(subjectId, preset = {}) {
  const subject = getSubject(subjectId);
  state.editor = {
    deckId: null,
    subject: subjectId,
    folderId: state.params.folderId || null,
    name: preset.name || (subject.kind === 'sprache' ? 'Neue Vokabeln' : 'Neue Lernkarten'),
    type: preset.type || (subject.kind === 'sprache' ? 'vocab' : 'facts'),
    sourceLang: preset.sourceLang || subject.lang || 'en',
    cards: preset.cards || [{ id: uid(), term: '', translation: '' }, { id: uid(), term: '', translation: '' }],
    quiz: preset.quiz || [],
    pages: preset.pages || []
  };
  go('deckEdit');
}

function editDeck(id) {
  const d = state.data.decks.find(x => x.id === id);
  if (!d) return;
  state.editor = {
    deckId: id, subject: d.subject, folderId: d.folderId, name: d.name, type: d.type, sourceLang: d.sourceLang,
    cards: JSON.parse(JSON.stringify(d.cards)), quiz: JSON.parse(JSON.stringify(d.quiz)), pages: [...(d.pages || [])]
  };
  go('deckEdit');
}

function renderDeckEdit(container) {
  const ed = state.editor;
  if (!ed) return go('subjects');
  const vocab = ed.type === 'vocab';
  const langName = getLangConfig(ed.sourceLang).name;
  const rows = ed.cards.map((c, i) => `
    <div class="edit-row">
      <span class="row-num">${i + 1}</span>
      <div class="edit-fields">
        <input type="text" value="${esc(c.term)}" placeholder="${vocab ? langName : 'Begriff oder Frage'}" oninput="state.editor.cards[${i}].term=this.value">
        ${vocab
          ? `<input type="text" value="${esc(c.translation)}" placeholder="Deutsch" oninput="state.editor.cards[${i}].translation=this.value">`
          : `<textarea rows="2" placeholder="Erklärung oder Antwort" oninput="state.editor.cards[${i}].translation=this.value">${esc(c.translation)}</textarea>`}
        ${c.img ? `<div class="edit-img">${imgTag(c.img, 'thumb')}<button class="icon-btn small" onclick="state.editor.cards[${i}].img=null; render();">Bild entfernen</button></div>` : ''}
      </div>
      <div class="edit-btns">
        <button class="icon-btn small" onclick="state.editor.cards.splice(${i},1); render();" title="Zeile löschen">${icon('close', 14)}</button>
        <button class="icon-btn small" onclick="pickImage('setCardImage', ${i})" title="Bild auf die Karte">${icon('image', 14)}</button>
      </div>
    </div>`).join('');

  container.innerHTML = `
    <div class="card">
      <input class="editor-header" type="text" value="${esc(ed.name)}" oninput="state.editor.name=this.value" placeholder="Name der Kartei">
      <div class="toggle-row">
        <div class="toggle-btn ${vocab ? 'active' : ''}" onclick="state.editor.type='vocab'; render();">Vokabeln</div>
        <div class="toggle-btn ${!vocab ? 'active' : ''}" onclick="state.editor.type='facts'; render();">Lernkarten</div>
      </div>
      ${vocab ? `<button class="btn btn-outline btn-sm" style="margin-bottom:12px;" onclick="openLanguagePicker()">Sprache: ${esc(langName)}</button>` : ''}
      ${ed.quiz.length ? `<p class="note" style="margin-bottom:10px;">Dazu ${ed.quiz.length} Quizfragen.</p>` : ''}
      ${ed.pages.length ? `<div class="page-strip"><span class="mini-label">Buchseiten</span>${ed.pages.map((id, n) => `<span class="page-thumb">${imgTag(id, 'thumb')}<button onclick="state.editor.pages.splice(${n},1); render();">✕</button></span>`).join('')}</div>` : ''}
      <div class="edit-list">${rows}</div>
      <div class="row-2" style="margin:12px 0 18px;">
        <button class="btn btn-outline btn-sm" onclick="state.editor.cards.push({id:uid(), term:'', translation:''}); render(); setTimeout(()=>{const l=document.querySelectorAll('.edit-row input'); l[l.length-(state.editor.type==='vocab'?2:1)]?.focus();},30);">+ Zeile</button>
        <input type="file" accept="image/*" id="scanAppend" multiple hidden onchange="scanPhotos(event, state.editor.subject, true)">
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('scanAppend').click()">${icon('camera', 15)} Seite dazu</button>
      </div>
      <div class="row-2">
        <button class="btn btn-outline" onclick="go('subject', {id: state.editor.subject})">Abbrechen</button>
        <button class="btn btn-primary" onclick="saveDeck()">Speichern</button>
      </div>
    </div>`;
}

function openLanguagePicker() {
  openModal(`
    <h3 class="modal-title">Sprache wählen</h3>
    <input type="text" placeholder="Sprache suchen..." oninput="document.querySelectorAll('.lang-opt').forEach(b => b.hidden = !b.textContent.toLowerCase().includes(this.value.toLowerCase()))" style="margin-bottom:12px;">
    <div class="lang-list">
      ${LANGUAGES.filter(l => l.code !== 'auto').map(l => `<button class="btn btn-outline lang-opt ${l.code === state.editor.sourceLang ? 'selected' : ''}" onclick="state.editor.sourceLang='${l.code}'; closeModal(); render();">${l.name}</button>`).join('')}
    </div>
  `);
}

function saveDeck() {
  const ed = state.editor;
  const cards = ed.cards.filter(c => (c.term || '').trim() || (c.translation || '').trim() || c.img)
    .map(c => ({ ...c, term: (c.term || '').trim(), translation: (c.translation || '').trim(), id: c.id || uid() }));
  if (!cards.length) return alert('Bitte mindestens eine Karte eintragen.');
  let deck;
  if (ed.deckId) {
    deck = state.data.decks.find(d => d.id === ed.deckId);
    Object.assign(deck, { name: ed.name.trim() || deck.name, type: ed.type, sourceLang: ed.sourceLang, cards, quiz: ed.quiz, pages: ed.pages });
  } else {
    deck = {
      id: uid(), name: ed.name.trim() || 'Neue Kartei', subject: ed.subject, type: ed.type, sourceLang: ed.sourceLang,
      targetLang: 'de', folderId: ed.folderId, cards, quiz: ed.quiz, pages: ed.pages, createdAt: new Date().toISOString()
    };
    state.data.decks.unshift(deck);
  }
  saveData();
  state.editor = null;
  toast('Gespeichert.');
  go('subject', { id: deck.subject, folderId: deck.folderId || undefined });
}

function deleteDeck(id) {
  if (!confirm('Kartei wirklich löschen?')) return;
  state.data.decks = state.data.decks.filter(d => d.id !== id);
  saveData();
  render();
}

// ---------- Foto-Scan und KI-Themen ----------

function cleanQuiz(list) {
  return (Array.isArray(list) ? list : []).filter(q => q && q.q && Array.isArray(q.options) && q.options.length >= 2
    && Number.isInteger(Number(q.correct)) && q.options[Number(q.correct)] !== undefined)
    .map(q => ({ id: uid(), q: String(q.q), options: q.options.map(String).slice(0, 5), correct: Number(q.correct), explain: String(q.explain || '') }));
}

function cleanCards(list) {
  return (Array.isArray(list) ? list : []).filter(c => c && (c.term || c.translation))
    .map(c => ({ id: uid(), term: String(c.term || '').trim(), translation: String(c.translation || '').trim() }));
}

// Gemeinsamer KI-Prompt für Foto-Scan und OneNote. context = Text aus OneNote, falls vorhanden.
function cardsPrompt(subject, vocabMode, context = '') {
  const ctx = context ? `\nZusätzlich der Text aus dem OneNote-Abschnitt (kann Erkennungsfehler enthalten, nur als Hilfe):\n${context.slice(0, 2500)}\n` : '';
  return vocabMode
    ? `Analysiere das Bild einer Vokabelliste oder Buchseite. 1. Erkenne die Fremdsprache (ISO-Code wie "en", "fr", "es", "la"). 2. Extrahiere alle Vokabelpaare Fremdsprache → Deutsch. Übernimm Zusätze wie "(to)" oder "sb/sth" so, wie sie dastehen. Beispielsätze nicht als eigene Vokabeln aufnehmen. Wenn auf dem Bild keine Vokabeln stehen, sondern Grammatik oder ein Text, erstelle stattdessen Lernkarten zum Inhalt (Regel oder Frage → Erklärung auf Deutsch) und setze "type":"facts". Schlage einen kurzen Titel vor. Erstelle außerdem bis zu 8 Multiple-Choice-Fragen mit je 4 Antworten (genau eine richtig) und kurzer Erklärung. Wenn das Bild keinen Lernstoff zeigt, gib leere Listen zurück.${ctx}
JSON: {"detectedLang":"en","type":"vocab","title":"...","cards":[{"term":"Fremdwort","translation":"Deutsch"}],"quiz":[{"q":"...","options":["A","B","C","D"],"correct":0,"explain":"..."}]}`
    : `${SCHOOL_CONTEXT} Fach: ${subject.name}. Das Bild zeigt eine Buchseite, einen Hefteintrag oder ein Arbeitsblatt. Erstelle daraus Lernkarten zu den wichtigsten Begriffen, Daten, Personen, Formeln, Ursachen und Folgen (je nach Inhalt 4 bis 20 Karten). "term" ist ein Begriff oder eine kurze Frage, "translation" die Erklärung in höchstens zwei Sätzen. Erstelle außerdem 3 bis 10 Multiple-Choice-Fragen mit je 4 Antworten, davon genau eine richtig, plus kurzer Erklärung. Nur Inhalte, die auf dem Bild stehen oder direkt dazugehören. Wenn das Bild keinen Lernstoff zeigt (Deko, Logo, Foto ohne Inhalt), gib leere Listen zurück.${ctx}
JSON: {"title":"kurzer Titel","cards":[{"term":"...","translation":"..."}],"quiz":[{"q":"Frage","options":["A","B","C","D"],"correct":0,"explain":"..."}]}`;
}

async function scanPhotos(e, subjectId, append = false) {
  const files = Array.from(e.target.files || []);
  e.target.value = '';
  if (!files.length) return;
  if (!requireAi()) return;
  const subject = getSubject(subjectId);
  const vocabMode = append ? state.editor?.type === 'vocab' : subject.kind === 'sprache';
  const returnScreen = append ? 'deckEdit' : 'subject';
  const returnParams = append ? {} : { ...state.params };

  const prompt = cardsPrompt(subject, vocabMode);

  let cards = [], quiz = [], pages = [], title = '', lang = null, error = '', typeHint = null;
  for (let i = 0; i < files.length; i++) {
    renderLoading(`Foto ${i + 1} von ${files.length} wird gelesen`);
    try {
      const img = await compressImage(files[i], 1400);
      pages.push(await putImage(img));
      const res = await aiAsk(prompt, [img]);
      if (res.type === 'facts') typeHint = 'facts';
      cards.push(...cleanCards(res.cards || res));
      quiz.push(...cleanQuiz(res.quiz));
      if (!title && res.title) title = String(res.title);
      if (res.detectedLang && !lang) lang = res.detectedLang;
    } catch (err) {
      console.error('Scan-Fehler', err);
      error = err.message || 'Unbekannter Fehler';
    }
  }
  unlockBadge('scan');
  if (!cards.length) {
    alert(error ? `Der Scan hat nicht geklappt: ${error}` : 'Auf dem Foto wurde nichts gefunden. Versuch ein schärferes Bild.');
    return go(returnScreen, returnParams);
  }
  if (append) {
    state.editor.cards = state.editor.cards.filter(c => c.term || c.translation).concat(cards);
    state.editor.quiz = state.editor.quiz.concat(quiz);
    state.editor.pages = state.editor.pages.concat(pages);
    return go('deckEdit');
  }
  const validLang = lang && LANGUAGES.some(l => l.code === lang) ? lang : subject.lang || 'en';
  state.params = returnParams;
  newDeck(subjectId, { name: title || (vocabMode ? 'Gescannte Vokabeln' : 'Gescannte Seite'), type: vocabMode && typeHint !== 'facts' ? 'vocab' : 'facts', sourceLang: validLang, cards, quiz, pages });
  toast(`${cards.length} Karten erkannt. Kurz prüfen und speichern.`);
}

function openAiTopicModal(subjectId) {
  if (!requireAi()) return;
  const subject = getSubject(subjectId);
  const examples = {
    sprache: subject.lang === 'fr' ? 'z. B. "passé composé mit être" oder "Vokabeln: Schule und Freizeit"' : 'z. B. "simple past vs. present perfect" oder "Vokabeln: Australia, nature"',
    sach: { geschichte: 'z. B. "Ursachen des Ersten Weltkriegs" oder "Weimarer Republik"', erdkunde: 'z. B. "Klimazonen der Erde" oder "Plattentektonik"', biologie: 'z. B. "Aufbau der Zelle" oder "Genetik: Mendelsche Regeln"' }[subjectId] || 'z. B. ein Thema aus dem Unterricht'
  }[subject.kind];
  openModal(`
    <h3 class="modal-title">Thema eingeben</h3>
    <p class="note" style="margin-bottom:12px;">Am besten so, wie es im Buch oder auf dem Arbeitsblatt heißt.</p>
    <textarea id="aiTopic" rows="3" placeholder="${esc(examples)}"></textarea>
    <label class="field-label" style="margin-top:12px;">Umfang</label>
    <select id="aiAmount">
      <option value="10">Klein (ca. 10 Karten)</option>
      <option value="18" selected>Mittel (ca. 18 Karten)</option>
      <option value="28">Groß (ca. 28 Karten)</option>
    </select>
    <div class="row-2" style="margin-top:18px;">
      <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" onclick="createAiTopic('${subjectId}')">Erstellen</button>
    </div>
  `);
}

async function createAiTopic(subjectId) {
  const topic = document.getElementById('aiTopic').value.trim();
  const amount = document.getElementById('aiAmount').value;
  if (!topic) return;
  const subject = getSubject(subjectId);
  const back = { ...state.params };
  closeModal();
  renderLoading('Lernkarten werden erstellt');
  const prompt = subject.kind === 'sprache'
    ? `${SCHOOL_CONTEXT} Fremdsprache: ${getLangConfig(subject.lang).name}. Thema: "${topic}".
Wenn es um Wortschatz geht: erstelle etwa ${amount} Vokabelkarten mit "term" in der Fremdsprache und "translation" auf Deutsch und setze "type":"vocab".
Wenn es um Grammatik geht: erstelle etwa ${amount} Lernkarten ("term" = Regel oder Frage, "translation" = Erklärung mit Beispiel) und setze "type":"facts".
Erstelle in beiden Fällen 8 bis 12 Multiple-Choice-Fragen (z. B. Lückensätze) mit je 4 Antworten, genau eine richtig, mit kurzer Erklärung auf Deutsch.
JSON: {"title":"...","type":"vocab","cards":[{"term":"...","translation":"..."}],"quiz":[{"q":"...","options":["A","B","C","D"],"correct":0,"explain":"..."}]}`
    : `${SCHOOL_CONTEXT} Fach: ${subject.name}. Thema: "${topic}". Erstelle etwa ${amount} Lernkarten zu den wichtigsten Begriffen, Daten, Personen und Zusammenhängen, so wie sie in einer Klassenarbeit abgefragt werden. "term" = Begriff oder kurze Frage, "translation" = Erklärung in höchstens zwei Sätzen. Erstelle außerdem 8 bis 12 Multiple-Choice-Fragen mit je 4 Antworten, genau eine richtig, plus kurzer Erklärung. Inhalte müssen fachlich korrekt sein.
JSON: {"title":"...","cards":[{"term":"...","translation":"..."}],"quiz":[{"q":"...","options":["A","B","C","D"],"correct":0,"explain":"..."}]}`;
  try {
    const res = await aiAsk(prompt);
    const cards = cleanCards(res.cards);
    if (!cards.length) throw new Error('Keine Karten erhalten.');
    state.params = back;
    newDeck(subjectId, {
      name: res.title || topic,
      type: subject.kind === 'sprache' && res.type !== 'facts' ? 'vocab' : 'facts',
      sourceLang: subject.lang || 'en',
      cards,
      quiz: cleanQuiz(res.quiz)
    });
    toast('Fertig! Kurz prüfen und speichern.');
  } catch (err) {
    alert('Das hat nicht geklappt: ' + err.message);
    go('subject', back);
  }
}

// ---------- Lernrunde vorbereiten ----------

function renderDeckSetup(container) {
  const deck = state.data.decks.find(d => d.id === state.params.deckId);
  if (!deck) return go('subjects');
  const vocab = deck.type === 'vocab';
  const langName = getLangConfig(deck.sourceLang).name;
  const st = deckStats(deck);
  if (!state.params.sel || state.params.sel.length !== deck.cards.length) state.params.sel = deck.cards.map(() => true);
  const p = state.params;
  if (!p.mode) p.mode = 'classic';
  if (!p.dir) p.dir = 'source-target';
  if (p.shuffle === undefined) p.shuffle = true;

  const modes = vocab
    ? [['classic', 'Karten'], ['writing', 'Schreiben'], ['mc', 'Auswahl'], ['speech', 'Sprechen']]
    : [['classic', 'Karten'], ['mc', 'Auswahl'], ...(deck.quiz.length ? [['quiz', `Quiz (${deck.quiz.length})`]] : [])];

  const rows = deck.cards.map((c, i) => `
    <label class="setup-row">
      <input type="checkbox" ${p.sel[i] ? 'checked' : ''} onchange="state.params.sel[${i}]=this.checked">
      <span>${esc(c.term)}</span><span class="sep">↔</span><span>${esc(c.translation)}</span>
      <span class="box-dots">${boxDots(c)}</span>
    </label>`).join('');

  container.innerHTML = `
    <div class="card">
      <div class="setup-header">
        ${backBtn('subject', { id: deck.subject, folderId: deck.folderId || undefined })}
        <h3>${esc(deck.name)}</h3>
        <button class="icon-btn" onclick="editDeck('${deck.id}')" title="Bearbeiten">${icon('edit', 16)}</button>
      </div>
      <p class="note" style="margin-bottom:12px;">${st.total} Karten · ${st.mastered} sicher · ${st.due} fällig · ${st.fresh} neu</p>
      <div class="page-strip">
        <span class="mini-label">Buchseiten</span>
        ${(deck.pages || []).map(id => `<span class="page-thumb">${imgTag(id, 'thumb')}</span>`).join('')}
        <button class="icon-btn small" onclick="pickImage('addDeckPage', '${deck.id}')">${icon('plus', 14)} Bild</button>
      </div>
      <div class="toggle-row">${modes.map(([id, label]) => `<div class="toggle-btn ${p.mode === id ? 'active' : ''}" onclick="state.params.mode='${id}'; render();">${label}</div>`).join('')}</div>
      ${p.mode !== 'quiz' ? `
      <div class="toggle-row">
        <div class="toggle-btn ${p.dir === 'source-target' ? 'active' : ''}" onclick="state.params.dir='source-target'; render();">${vocab ? langName + ' → DE' : 'Begriff → Erklärung'}</div>
        <div class="toggle-btn ${p.dir === 'target-source' ? 'active' : ''}" onclick="state.params.dir='target-source'; render();">${vocab ? 'DE → ' + langName : 'Erklärung → Begriff'}</div>
      </div>` : ''}
      <div class="toggle-row">
        <div class="toggle-btn ${!p.shuffle ? 'active' : ''}" onclick="state.params.shuffle=false; render();">Reihenfolge</div>
        <div class="toggle-btn ${p.shuffle ? 'active' : ''}" onclick="state.params.shuffle=true; render();">Zufällig</div>
      </div>
      ${p.mode !== 'quiz' ? `
      <div class="sel-bar">
        <span class="mini-label">Karten auswählen</span>
        <div class="sel-btns">
          <button class="btn btn-outline btn-xs" onclick="setupSelect('all')">Alle</button>
          <button class="btn btn-outline btn-xs" onclick="setupSelect('due')">Fällig</button>
          <button class="btn btn-outline btn-xs" onclick="setupSelect('weak')">Schwer</button>
          <button class="btn btn-outline btn-xs" onclick="setupSelect('none')">Keine</button>
        </div>
      </div>
      <div class="setup-list">${rows}</div>` : ''}
      <button class="btn btn-primary" style="margin-top:16px;" onclick="startDeckPractice()">Starten</button>
    </div>`;
}

function boxDots(c) {
  return [1, 2, 3].map(i => `<i class="${(c.box || 0) >= i ? 'on' : ''}"></i>`).join('');
}

function setupSelect(which) {
  const deck = state.data.decks.find(d => d.id === state.params.deckId);
  state.params.sel = deck.cards.map(c =>
    which === 'all' ? true : which === 'none' ? false : which === 'due' ? (cardIsDue(c) || cardIsNew(c)) : !!c.needsPractice);
  render();
}

function startDeckPractice() {
  const deck = state.data.decks.find(d => d.id === state.params.deckId);
  const p = state.params;
  let items;
  if (p.mode === 'quiz') {
    items = deck.quiz.map(q => ({ kind: 'quiz', q, deckId: deck.id }));
  } else {
    const chosen = deck.cards.filter((c, i) => p.sel[i]);
    if (!chosen.length) return alert('Bitte wähle mindestens eine Karte aus.');
    if (p.mode === 'mc' && deck.cards.length < 4) return alert('Für die Auswahl-Übung braucht die Kartei mindestens 4 Karten.');
    items = chosen.map(c => ({ kind: 'card', card: c, deckId: deck.id }));
  }
  startPractice({
    title: deck.name, subject: deck.subject, mode: p.mode, dir: p.dir, shuffle: p.shuffle, items,
    ref: { type: 'deck', id: deck.id }, returnTo: ['deckSetup', { deckId: deck.id }]
  });
}

function practiceWeak(deckId) {
  const deck = state.data.decks.find(d => d.id === deckId);
  const weak = deck.cards.filter(c => c.needsPractice);
  if (!weak.length) return;
  startPractice({
    title: deck.name + ' (schwierige)', subject: deck.subject, mode: 'classic', dir: 'source-target', shuffle: true,
    items: weak.map(c => ({ kind: 'card', card: c, deckId })), ref: { type: 'deck', id: deckId },
    returnTo: ['subject', { id: deck.subject }]
  });
}

function startDueReview(subjectId = null) {
  const due = shuffle(allDueCards(subjectId)).slice(0, 40);
  if (!due.length) return toast('Gerade ist nichts fällig.');
  startPractice({
    title: 'Wiederholung' + (subjectId ? ' ' + getSubject(subjectId).name : ''), subject: subjectId, mode: 'classic', dir: 'source-target', shuffle: false,
    items: due.map(x => ({ kind: 'card', card: x.card, deckId: x.deckId })), ref: { type: 'review' },
    returnTo: subjectId ? ['subject', { id: subjectId }] : ['home', {}]
  });
}

// ---------- Lernrunde ----------

function startPractice({ title, subject, mode, dir, shuffle: doShuffle, items, ref, returnTo }) {
  const list = (doShuffle ? shuffle(items) : items).map((it, i) => ({ ...it, uid: i, tries: 0 }));
  list.forEach(it => { if (mode === 'mc' && it.kind === 'card') it.mc = buildMc(it, dir); });
  state.practice = {
    title, subject, mode, dir, items: list, queue: [...list], index: 0, flipped: false,
    correct: 0, wrong: 0, status: list.map(() => 'pending'), everWrong: new Set(), startedAt: Date.now(),
    feedback: null, streak: 0, ref, returnTo, recorded: false, speech: null
  };
  go('practice');
}

function cardSides(item, dir) {
  const deck = state.data.decks.find(d => d.id === item.deckId);
  const vocab = deck?.type === 'vocab';
  const lang = deck?.sourceLang || 'en';
  const fwd = dir !== 'target-source';
  return {
    vocab,
    front: fwd ? item.card.term : item.card.translation,
    back: fwd ? item.card.translation : item.card.term,
    frontLang: fwd ? lang : 'de',
    backLang: fwd ? 'de' : lang,
    frontImg: fwd ? item.card.img : null,
    backImg: fwd ? null : item.card.img,
    frontLabel: vocab ? (fwd ? getLangConfig(lang).name : 'Deutsch') : (fwd ? 'Begriff' : 'Erklärung'),
    backLabel: vocab ? (fwd ? 'Deutsch' : getLangConfig(lang).name) : (fwd ? 'Erklärung' : 'Begriff'),
    deckName: deck?.name || ''
  };
}

function buildMc(item, dir) {
  const deck = state.data.decks.find(d => d.id === item.deckId);
  const sides = cardSides(item, dir);
  const pool = shuffle(deck.cards.filter(c => c.id !== item.card.id)
    .map(c => dir !== 'target-source' ? c.translation : c.term)
    .filter(t => t && t !== sides.back));
  const options = shuffle([sides.back, ...[...new Set(pool)].slice(0, 3)]);
  return { prompt: sides.front, options, correct: options.indexOf(sides.back) };
}

function renderPractice(container) {
  const pr = state.practice;
  if (!pr) return go('home');
  const item = pr.queue[pr.index];
  if (!item) return finishPractice();

  const top = `
    <div class="practice-top">
      <button class="icon-btn" onclick="quitPractice()" aria-label="Beenden">${icon('close', 16)}</button>
      <span class="mono-muted">${pr.correct} richtig · ${pr.wrong} falsch</span>
    </div>
    <div class="progress-dashes">${pr.status.map(s => `<span class="${s}"></span>`).join('')}</div>`;

  if (item.kind === 'quiz' || pr.mode === 'mc') return renderChoiceItem(container, top, item);
  if (pr.mode === 'writing') return renderWritingItem(container, top, item);
  if (pr.mode === 'speech') return renderSpeechItem(container, top, item);

  const s = cardSides(item, pr.dir);
  container.innerHTML = `${top}
    <div class="flashcard-wrapper" onclick="toggleFlip()">
      <div class="flashcard ${pr.flipped ? 'flipped' : ''}" id="cardElement">
        <div class="card-face">
          <div class="label">${esc(s.frontLabel)}</div>
          ${s.vocab ? `<button class="tts-btn" onclick='event.stopPropagation(); speakWord(${jsArg(s.front)}, "${s.frontLang}")' aria-label="Vorlesen">${icon('speaker', 16)}</button>` : ''}
          ${s.frontImg ? imgTag(s.frontImg, 'card-img') : ''}
          <div class="word ${s.front.length > 60 ? 'long' : ''}">${esc(s.front)}</div>
          <div class="tap-hint">Tippen zum Umdrehen</div>
        </div>
        <div class="card-face back">
          <div class="label">${esc(s.backLabel)}</div>
          ${s.vocab ? `<button class="tts-btn" onclick='event.stopPropagation(); speakWord(${jsArg(s.back)}, "${s.backLang}")' aria-label="Vorlesen">${icon('speaker', 16)}</button>` : ''}
          ${s.backImg ? imgTag(s.backImg, 'card-img') : ''}
          <div class="word ${s.back.length > 60 ? 'long' : ''}">${esc(s.back)}</div>
        </div>
      </div>
    </div>
    <div class="row-2">
      <button class="btn btn-danger" onclick="answerItem(false)">Nicht gewusst</button>
      <button class="btn btn-success" onclick="answerItem(true)">Gewusst</button>
    </div>
    <p class="note center">Leertaste: umdrehen · Pfeil links: nicht gewusst · Pfeil rechts: gewusst</p>`;
}

function renderChoiceItem(container, top, item) {
  const pr = state.practice;
  const data = item.kind === 'quiz'
    ? { prompt: item.q.q, options: item.q.options, correct: item.q.correct, explain: item.q.explain, label: 'Quizfrage' }
    : { ...item.mc, label: cardSides(item, pr.dir).frontLabel };
  const fb = pr.feedback;
  container.innerHTML = `${top}
    <div class="card question-card">
      <div class="mini-label">${esc(data.label)}</div>
      ${item.kind === 'card' && cardSides(item, pr.dir).frontImg ? imgTag(cardSides(item, pr.dir).frontImg, 'card-img') : ''}
      <div class="question-text">${esc(data.prompt)}</div>
      <div class="choice-list">
        ${data.options.map((o, i) => {
          let cls = '';
          if (fb) cls = i === data.correct ? 'right' : i === fb.picked ? 'wrong' : 'dim';
          return `<button class="choice ${cls}" ${fb ? 'disabled' : ''} onclick="pickChoice(${i})">${esc(o)}</button>`;
        }).join('')}
      </div>
      ${fb ? `
        <div class="feedback ${fb.ok ? 'ok' : 'bad'}">${fb.ok ? 'Richtig.' : 'Falsch.'}${data.explain ? `<p>${esc(data.explain)}</p>` : ''}</div>
        ${fb.ok ? '' : `<button class="btn btn-outline btn-sm" style="margin-bottom:10px;" onclick='explainItem()'>Erklärung</button>`}
        <button class="btn btn-primary" onclick="nextItem()">Weiter</button>` : ''}
    </div>`;
}

function pickChoice(i) {
  const pr = state.practice;
  const item = pr.queue[pr.index];
  const correct = item.kind === 'quiz' ? item.q.correct : item.mc.correct;
  pr.feedback = { picked: i, ok: i === correct };
  scoreItem(pr.feedback.ok);
  render();
}

function renderWritingItem(container, top, item) {
  const pr = state.practice;
  const s = cardSides(item, pr.dir);
  const fb = pr.feedback;
  container.innerHTML = `${top}
    <div class="card question-card center">
      <div class="mini-label">${esc(s.frontLabel)} → ${esc(s.backLabel)}</div>
      ${s.frontImg ? imgTag(s.frontImg, 'card-img') : ''}
      <div class="question-text big">${esc(s.front)}</div>
      <input id="writingAnswer" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" ${fb ? 'disabled' : ''} value="${esc(fb?.typed || '')}" placeholder="Übersetzung eintippen" onkeydown="if(event.key==='Enter') checkWriting()">
      ${fb ? `
        <div class="feedback ${fb.ok ? 'ok' : 'bad'}">${fb.ok ? 'Richtig:' : 'Richtig wäre:'} <b>${esc(s.back)}</b></div>
        ${fb.ok ? '' : `<button class="btn btn-outline btn-sm" style="margin-bottom:10px;" onclick="overrideWriting()">War nur ein Tippfehler</button>`}
        <button class="btn btn-primary" id="nextBtn" onclick="nextItem()">Weiter</button>`
      : `<div class="row-2" style="margin-top:14px;">
          <button class="btn btn-outline" onclick="checkWriting(true)">Lösung zeigen</button>
          <button class="btn btn-primary" onclick="checkWriting()">Prüfen</button>
        </div>`}
    </div>`;
  setTimeout(() => (fb ? document.getElementById('nextBtn') : document.getElementById('writingAnswer'))?.focus(), 30);
}

function checkWriting(giveUp = false) {
  const pr = state.practice;
  const item = pr.queue[pr.index];
  const typed = document.getElementById('writingAnswer')?.value || '';
  const ok = !giveUp && answerMatches(typed, cardSides(item, pr.dir).back);
  pr.feedback = { ok, typed };
  scoreItem(ok);
  render();
}

function overrideWriting() {
  const pr = state.practice;
  // Falsch gewertete Antwort zurücknehmen
  pr.wrong--; pr.correct++;
  const item = pr.queue[pr.index];
  pr.status[item.uid] = 'correct';
  if (pr.pushed) { pr.queue.pop(); pr.pushed = false; }
  if (item.tries === 1) pr.everWrong.delete(item.uid);
  if (item.kind === 'card') updateCard(item.deckId, item.card.id, true);
  addXp(8);
  pr.feedback.ok = true;
  render();
}

function renderSpeechItem(container, top, item) {
  const pr = state.practice;
  const s = cardSides(item, 'target-source');
  const sp = pr.speech || {};
  container.innerHTML = `${top}
    <div class="card question-card center">
      <div class="mini-label">Sag es auf ${esc(getLangConfig(s.backLang).name)}</div>
      <div class="question-text big">${esc(s.front)}</div>
      <button class="btn btn-outline btn-sm" style="width:auto; margin:0 auto 12px;" onclick='speakWord(${jsArg(s.back)}, "${s.backLang}")'>${icon('speaker', 15)} Anhören</button>
      <div class="speech-box">
        <button class="mic-btn ${sp.recording ? 'recording' : ''}" onclick='startSpeech(${jsArg(s.back)}, "${s.backLang}")' aria-label="Aufnehmen">${icon('mic', 28)}</button>
        ${sp.recording ? '<p class="note">Sprich jetzt, die Aufnahme endet automatisch.</p>' : ''}
        ${sp.heard ? `<p class="mono">Erkannt: "${esc(sp.heard)}"</p>` : ''}
        ${sp.error ? `<p class="note" style="color:var(--red)">${esc(sp.error)}</p>` : ''}
        ${sp.stars ? `<div class="star-rating">${'★'.repeat(sp.stars)}${'☆'.repeat(3 - sp.stars)}</div><p class="note">Lösung: ${esc(s.back)}</p>` : ''}
      </div>
      ${sp.stars ? `<div class="row-2">
        <button class="btn btn-danger" onclick="answerItem(false)">Nochmal üben</button>
        <button class="btn btn-success" onclick="answerItem(true)">Gewusst</button>
      </div>` : `<button class="btn btn-outline btn-sm" onclick="answerItem(false)">Überspringen</button>`}
    </div>`;
}

function startSpeech(target, langCode) {
  const pr = state.practice;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return alert('Spracherkennung wird von diesem Browser nicht unterstützt. Probier Chrome oder Safari.');
  if (pr.speech?.recording) return;
  const rec = new SR();
  rec.lang = getLangConfig(langCode).speech;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  pr.speech = { recording: true };
  render();
  const stop = setTimeout(() => rec.stop(), 8000);
  rec.onresult = ev => {
    clearTimeout(stop);
    const heard = ev.results[0][0].transcript;
    const sim = calculateSimilarity(normalizeAnswer(heard), normalizeAnswer(target));
    pr.speech = { heard, stars: sim >= 0.85 ? 3 : sim >= 0.6 ? 2 : 1 };
    render();
  };
  const fail = () => {
    clearTimeout(stop);
    if (pr.speech?.recording) { pr.speech = { error: 'Ich habe nichts verstanden. Versuch es nochmal.' }; render(); }
  };
  rec.onerror = fail;
  rec.onend = fail;
  try { rec.start(); } catch (e) { fail(); }
}

function toggleFlip() {
  const pr = state.practice;
  pr.flipped = !pr.flipped;
  document.getElementById('cardElement')?.classList.toggle('flipped', pr.flipped);
}

// Wertung ohne Weiterblättern (für Auswahl und Schreiben)
function scoreItem(success) {
  const pr = state.practice;
  const item = pr.queue[pr.index];
  item.tries++;
  if (success) {
    pr.correct++;
    pr.streak++;
    pr.status[item.uid] = 'correct';
  } else {
    pr.wrong++;
    pr.streak = 0;
    pr.status[item.uid] = 'wrong';
    pr.everWrong.add(item.uid);
    pr.pushed = item.tries < 3;
    if (pr.pushed) pr.queue.push(item);
  }
  if (item.kind === 'card') updateCard(item.deckId, item.card.id, success);
  addXp(success ? 10 : 2);
}

function answerItem(success) {
  const wrapper = document.querySelector('.flashcard-wrapper');
  document.querySelectorAll('.btn-danger, .btn-success').forEach(b => b.disabled = true);
  if (wrapper) {
    wrapper.style.transition = 'transform .3s ease, opacity .3s ease';
    wrapper.style.transform = `translateX(${success ? '140%' : '-140%'}) rotate(${success ? 12 : -12}deg)`;
    wrapper.style.opacity = '0';
  }
  scoreItem(success);
  setTimeout(nextItem, wrapper ? 260 : 0);
}

function nextItem() {
  const pr = state.practice;
  pr.index++;
  pr.flipped = false;
  pr.feedback = null;
  pr.speech = null;
  saveData();
  render();
}

function quitPractice() {
  const pr = state.practice;
  if (pr.correct + pr.wrong > 0 && !confirm('Runde beenden? Dein Fortschritt bis hier ist gespeichert.')) return;
  saveData();
  const [screen, params] = pr.returnTo || ['home', {}];
  state.practice = null;
  go(screen, params);
}

function explainItem() {
  const pr = state.practice;
  const item = pr.queue[pr.index];
  let text;
  if (item.kind === 'quiz') {
    text = `Ich habe diese Quizfrage falsch beantwortet:\n"${item.q.q}"\nAntworten: ${item.q.options.join(' | ')}\nRichtig ist: "${item.q.options[item.q.correct]}"${pr.feedback ? `\nIch hatte: "${item.q.options[pr.feedback.picked]}"` : ''}\nErklär mir bitte, warum die richtige Antwort stimmt und wie ich mir das merken kann.`;
  } else {
    const s = cardSides(item, pr.dir);
    text = `Ich lerne gerade "${s.deckName}". Bei dieser Karte lag ich falsch:\n${s.frontLabel}: "${s.front}"\n${s.backLabel}: "${s.back}"\nErklär mir das bitte kurz und gib mir eine Eselsbrücke${s.vocab ? ' und zwei Beispielsätze' : ''}.`;
  }
  explainWithTutor(text, pr.subject, ['practice', {}]);
}

function finishPractice() {
  const pr = state.practice;
  if (!pr.recorded) {
    pr.recorded = true;
    recordSession({
      kind: pr.mode === 'quiz' || pr.mode === 'mc' ? 'quiz' : 'karten', subject: pr.subject, name: pr.title,
      total: pr.items.length, correct: pr.correct, wrong: pr.wrong, seconds: (Date.now() - pr.startedAt) / 1000, ref: pr.ref
    });
  }
  state.screen = 'summary';
  render();
}

function renderSummary(container) {
  const pr = state.practice;
  if (!pr) return go('home');
  const hard = pr.everWrong.size;
  const firstTry = pr.items.length - hard;
  const pct = Math.round(firstTry / pr.items.length * 100);
  const [screen, params] = pr.returnTo || ['home', {}];
  container.innerHTML = `
    <div class="card center" style="padding:32px 20px;">
      <div class="big-number">${pct}%</div>
      <h2 class="mono">Runde fertig</h2>
      <p class="note">${esc(pr.title)}</p>
      <div class="stat-grid">
        <div><strong style="color:var(--green)">${firstTry}</strong><small>direkt gewusst</small></div>
        <div><strong style="color:var(--red)">${hard}</strong><small>schwierig</small></div>
        <div><strong>+${pr.correct * 10 + pr.wrong * 2 + 20}</strong><small>XP</small></div>
      </div>
      ${hard ? `<button class="btn btn-danger" style="margin-bottom:12px;" onclick="retryHard()">Schwierige nochmal</button>` : ''}
      <button class="btn btn-primary" onclick='state.practice=null; go(${JSON.stringify(screen)}, ${esc(JSON.stringify(params))})'>Weiter</button>
    </div>`;
}

function retryHard() {
  const pr = state.practice;
  const items = pr.items.filter(it => pr.everWrong.has(it.uid)).map(({ kind, card, deckId, q }) => ({ kind, card, deckId, q }));
  startPractice({ title: pr.title, subject: pr.subject, mode: pr.mode, dir: pr.dir, shuffle: true, items, ref: pr.ref, returnTo: pr.returnTo });
}

document.addEventListener('keydown', e => {
  if (state.screen !== 'practice' || !state.practice) return;
  if (e.target.tagName === 'INPUT') return;
  const pr = state.practice;
  const item = pr.queue[pr.index];
  if (!item) return;
  if (pr.mode === 'classic' && item.kind === 'card') {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); toggleFlip(); }
    else if (e.code === 'ArrowRight') answerItem(true);
    else if (e.code === 'ArrowLeft') answerItem(false);
  } else if (pr.feedback && e.code === 'Enter') {
    nextItem();
  } else if (!pr.feedback && /^Digit[1-5]$/.test(e.code) && (pr.mode === 'mc' || item.kind === 'quiz')) {
    pickChoice(Number(e.code.slice(5)) - 1);
  }
});

function setCardImage(id, index) {
  if (!state.editor?.cards[index]) return;
  state.editor.cards[index].img = id;
  render();
}

function addDeckPage(id, deckId) {
  const deck = state.data.decks.find(d => d.id === deckId);
  if (!deck) return;
  deck.pages = [...(deck.pages || []), id];
  saveData();
  toast('Bild angehängt. Tipp drauf, um es groß zu sehen oder dazu zu fragen.');
  render();
}
