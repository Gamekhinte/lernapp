// Schulaufgaben: geschriebene Arbeiten aus dem SCP (Leistungsnachweise) oder von Hand.
// Pro Arbeit merken: Verbesserung nötig (mit Abgabedatum) und abheften, plus Erinnerung auf der Startseite.

const SCP_RESULTS_URL = 'https://kreuzburg-it.de/scp/index.php?site=leistungsnachweise';

function schoolwork() {
  if (!Array.isArray(state.data.schoolwork)) state.data.schoolwork = [];
  return state.data.schoolwork;
}

function swHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return 'sw-' + (h >>> 0).toString(36);
}

function swIsoDate(text) {
  const m = String(text || '').match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})?/);
  if (!m) return '';
  const d = Number(m[1]), mo = Number(m[2]);
  let y = m[3] ? Number(m[3]) : 0;
  if (y && y < 100) y += 2000;
  if (!y) {
    // Ohne Jahr: im laufenden Schuljahr (ab August) einordnen
    const now = new Date();
    y = now.getFullYear();
    if (now.getMonth() + 1 >= 8 && mo < 8) y += 1;
    if (now.getMonth() + 1 < 8 && mo >= 8) y -= 1;
  }
  if (d < 1 || d > 31 || mo < 1 || mo > 12) return '';
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Zeilen der SCP-Seite "Leistungsnachweise" als Arbeiten übernehmen (Neues kommt dazu, Eigenes bleibt)
function importScpResults() {
  const r = scpData().results;
  if (!r || !Array.isArray(r.rows) || !r.rows.length) return 0;
  const heads = (r.headers || []).map(h => String(h).toLowerCase());
  const col = re => heads.findIndex(h => re.test(h));
  const cDate = col(/datum|termin/), cSubj = col(/fach/), cTitle = col(/art|typ|bezeichnung|thema|titel|leistung/);
  const cGrade = col(/note|punkte|bewertung|ergebnis/), cFix = col(/verbesser|berichtig/), cFile = col(/abheft|mappe|ordner/);
  const yesNo = v => /^(ja|j|x|✓|✔|1|yes)$/i.test(String(v || '').trim()) ? true : /^(nein|n|-|–|0|no)$/i.test(String(v || '').trim()) ? false : null;
  const list = schoolwork();
  const deleted = state.data.deleted || {};
  let added = 0;
  r.rows.forEach(cells => {
    const text = cells.filter(Boolean).join(' · ');
    const date = swIsoDate(cDate >= 0 ? cells[cDate] : text);
    if (!date && text.length < 6) return;
    const key = cells.slice(0, 6).join('|');
    const id = swHash(key);
    if (deleted[id] || list.some(x => x.id === id)) return;
    const subject = scpSubject(cSubj >= 0 ? cells[cSubj] : text);
    const used = new Set([cDate, cGrade, cFix, cFile].filter(i => i >= 0));
    const title = (cTitle >= 0 && cells[cTitle]) ? cells[cTitle]
      : cells.filter((c, i) => c && !used.has(i) && !/^\d{1,2}\.\d{1,2}\.(\d{2,4})?$/.test(c.trim())).join(' · ');
    const now = new Date().toISOString();
    list.push({
      id, scpKey: key, fromScp: true, subject, title: title.slice(0, 90) || 'Arbeit', date, info: text.slice(0, 240),
      grade: cGrade >= 0 ? (cells[cGrade] || '') : '',
      needsFix: cFix >= 0 ? yesNo(cells[cFix]) : null, fixDue: '', fixDone: false,
      file: cFile >= 0 ? yesNo(cells[cFile]) : null, filed: false,
      createdAt: now, updatedAt: now
    });
    added++;
  });
  return added;
}

function swTodos() {
  const items = schoolwork();
  const todos = [];
  items.forEach(it => {
    if (it.needsFix && !it.fixDone) todos.push({ it, kind: 'fix', due: it.fixDue || '9999' });
    if (it.file && !it.filed) todos.push({ it, kind: 'file', due: '9999' });
  });
  return todos.sort((a, b) => a.due.localeCompare(b.due));
}

// Neue Arbeiten der letzten Wochen, bei denen noch nichts eingetragen ist
function swUnsorted() {
  const from = todayStr(-45);
  return schoolwork().filter(it => it.needsFix == null && it.file == null && (!it.date || it.date >= from));
}

function swLabel(it) {
  const sub = it.subject ? getSubject(it.subject).name : '';
  return [sub, it.date ? dateLabel(it.date) : '', it.grade ? 'Note ' + it.grade : ''].filter(Boolean).join(' · ');
}

function swTodoRow({ it, kind }) {
  const late = kind === 'fix' && it.fixDue && it.fixDue <= todayStr(1);
  const text = kind === 'fix' ? `Verbesserung abgeben: ${it.title}` : `Abheften: ${it.title}`;
  const sub = it.subject ? getSubject(it.subject).name : '';
  const when = kind === 'fix' ? (it.fixDue ? 'bis ' + dateLabel(it.fixDue) : 'Abgabedatum fehlt') : 'in die Mappe';
  return `<div class="task-row">
    <button class="check-btn" onclick="swDone('${it.id}', '${kind}')" aria-label="Erledigt"></button>
    <div class="task-text" onclick="go('schoolwork', {open:'${it.id}'})" style="cursor:pointer;"><span>${esc(text)}</span><small${late ? ' style="color:var(--red); font-weight:700;"' : ''}>${esc([sub, when].filter(Boolean).join(' · '))}</small></div>
  </div>`;
}

function schoolworkHomeCard() {
  const todos = swTodos();
  const unsorted = swUnsorted();
  if (!todos.length && !unsorted.length && !schoolwork().length && !scpData().email) return '';
  return `
    <div class="card">
      <h3 class="card-title">Schulaufgaben</h3>
      ${todos.slice(0, 6).map(swTodoRow).join('')}
      ${unsorted.length ? `<div class="task-row" onclick="go('schoolwork')" style="cursor:pointer;"><div class="task-text"><span>${unsorted.length} Arbeit${unsorted.length > 1 ? 'en' : ''} zurück</span><small>Eintragen: Verbesserung? Abheften?</small></div>${icon('next', 16)}</div>` : ''}
      ${!todos.length && !unsorted.length ? '<p class="note" style="margin:0 0 10px;">Nichts zu verbessern oder abzuheften.</p>' : ''}
      <div class="row-2" style="margin-top:10px;">
        <button class="btn btn-outline btn-sm" onclick="go('schoolwork')">${icon('list', 15)} Alle Arbeiten</button>
        <a class="btn btn-outline btn-sm" href="${SCP_RESULTS_URL}" target="_blank" rel="noopener">${icon('next', 15)} Im SCP</a>
      </div>
    </div>`;
}

function swToggle(id, field, label, value) {
  const opts = [[null, '?'], [true, 'Ja'], [false, 'Nein']];
  return `<label class="field-label" style="margin-top:10px;">${label}</label>
    <div class="toggle-row">${opts.map(([v, l]) => `<div class="toggle-btn ${value === v ? 'active' : ''}" onclick="swSet('${id}', '${field}', ${JSON.stringify(v)})">${l}</div>`).join('')}</div>`;
}

function swItemHtml(it, open) {
  const sub = it.subject ? getSubject(it.subject) : null;
  const flags = [
    it.needsFix ? (it.fixDone ? 'Verbesserung abgegeben' : 'Verbesserung' + (it.fixDue ? ' bis ' + dateLabel(it.fixDue) : '')) : '',
    it.file ? (it.filed ? 'abgeheftet' : 'abheften') : ''
  ].filter(Boolean).join(' · ');
  const done = (!it.needsFix || it.fixDone) && (!it.file || it.filed) && (it.needsFix != null || it.file != null);
  return `
    <div class="card tight">
      <div class="task-row ${done ? 'done' : ''}" onclick="go('schoolwork', {open:${open ? 'null' : `'${it.id}'`}})" style="cursor:pointer;">
        ${sub ? subjectBadge(sub) : ''}
        <div class="task-text"><span>${esc(it.title)}</span><small>${esc(swLabel(it))}${flags ? ' · ' + esc(flags) : (it.needsFix == null && it.file == null ? ' · noch nicht eingetragen' : '')}</small></div>
        ${icon(open ? 'close' : 'edit', 16)}
      </div>
      ${open ? `
        ${it.info && it.info !== it.title ? `<p class="note">${esc(it.info)}</p>` : ''}
        ${swToggle(it.id, 'needsFix', 'Verbesserung machen?', it.needsFix ?? null)}
        ${it.needsFix ? `
          <label class="field-label">Abgeben bis</label>
          <input type="date" value="${esc(it.fixDue || '')}" onchange="swSet('${it.id}', 'fixDue', this.value)">
          <label class="check-row" style="margin-top:8px;"><input type="checkbox" ${it.fixDone ? 'checked' : ''} onchange="swSet('${it.id}', 'fixDone', this.checked)"> Verbesserung abgegeben</label>` : ''}
        ${swToggle(it.id, 'file', 'Abheften?', it.file ?? null)}
        ${it.file ? `<label class="check-row"><input type="checkbox" ${it.filed ? 'checked' : ''} onchange="swSet('${it.id}', 'filed', this.checked)"> Abgeheftet</label>` : ''}
        <label class="field-label" style="margin-top:10px;">Notiz</label>
        <input type="text" value="${esc(it.note || '')}" placeholder="z. B. Aufgabe 3 neu rechnen" onchange="swSet('${it.id}', 'note', this.value)">
        <button class="btn btn-outline btn-sm" style="margin-top:12px;" onclick="swDelete('${it.id}')">${icon('trash', 15)} Entfernen</button>` : (it.note ? `<p class="note" style="margin:4px 0 0;">${esc(it.note)}</p>` : '')}
    </div>`;
}

function renderSchoolwork(container) {
  const p = state.params || {};
  const s = scpData();
  const items = [...schoolwork()].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const todos = swTodos();
  const res = s.results || {};
  const lastSync = s.lastSync ? new Date(s.lastSync).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : '';
  container.innerHTML = `
    <div class="setup-header">${backBtn('home')}<h3>Schulaufgaben</h3><span></span></div>
    <div class="card">
      <p class="note" style="margin-top:0;">Deine Arbeiten aus dem SCP (Leistungsnachweise). Trag pro Arbeit ein, ob du eine Verbesserung machen und ob du sie abheften musst. Offene Sachen stehen dann auf der Startseite.</p>
      ${s.email ? (s.lastError ? `<p class="status-line bad">${icon('close', 15)} ${esc(s.lastError)}</p>`
        : res.error ? `<p class="status-line bad">${icon('close', 15)} Leistungsnachweise: ${esc(res.error)}</p>`
        : lastSync ? `<p class="status-line ok">${icon('check', 15)} ${(res.rows || []).length} Zeilen aus dem SCP · ${esc(lastSync)}</p>` : '') : ''}
      <div class="row-2" style="margin-top:12px;">
        <a class="btn btn-primary" href="${SCP_RESULTS_URL}" target="_blank" rel="noopener">${icon('next', 16)} Im SCP öffnen</a>
        ${s.email && scpPassword()
          ? `<button class="btn btn-outline" onclick="syncScp()">${icon('refresh', 16)} Abrufen</button>`
          : `<button class="btn btn-outline" onclick="go('untis', {scpEdit:true})">SCP verbinden</button>`}
      </div>
    </div>

    ${todos.length ? `<h3 class="group-title">Noch zu tun</h3><div class="card tight">${todos.map(swTodoRow).join('')}</div>` : ''}

    <h3 class="group-title">Arbeiten</h3>
    ${p.add ? `
      <div class="card">
        <label class="field-label">Fach</label>
        <select id="swSubject">${getSubjects().map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select>
        <label class="field-label" style="margin-top:10px;">Name</label>
        <input type="text" id="swTitle" placeholder="z. B. 1. Klassenarbeit">
        <label class="field-label" style="margin-top:10px;">Geschrieben am</label>
        <input type="date" id="swDate" value="${todayStr()}">
        <div class="row-2" style="margin-top:12px;">
          <button class="btn btn-primary" onclick="swAdd()">Eintragen</button>
          <button class="btn btn-outline" onclick="go('schoolwork')">Abbrechen</button>
        </div>
      </div>` : `<button class="btn btn-outline" style="margin-bottom:14px;" onclick="go('schoolwork', {add:true})">${icon('plus', 16)} Arbeit von Hand eintragen</button>`}
    ${items.length ? items.map(it => swItemHtml(it, p.open === it.id)).join('')
      : `<div class="empty">${s.email ? 'Im SCP wurden noch keine Arbeiten gefunden. Du kannst sie oben von Hand eintragen.' : 'Verbinde das SCP oder trag Arbeiten von Hand ein.'}</div>`}
  `;
}

function swFind(id) {
  return schoolwork().find(x => x.id === id);
}

function swSet(id, field, value) {
  const it = swFind(id);
  if (!it) return;
  it[field] = value;
  if (field === 'needsFix' && value !== true) it.fixDone = false;
  if (field === 'file' && value !== true) it.filed = false;
  touch(it);
  saveData();
  schedulePushSoon();
  render();
}

function swDone(id, kind) {
  const it = swFind(id);
  if (!it) return;
  if (kind === 'fix') it.fixDone = true; else it.filed = true;
  touch(it);
  saveData();
  schedulePushSoon();
  toast(kind === 'fix' ? 'Verbesserung abgehakt.' : 'Abgeheftet.');
  render();
}

function swAdd() {
  const title = document.getElementById('swTitle').value.trim();
  if (!title) return toast('Name fehlt.');
  const now = new Date().toISOString();
  const it = {
    id: 'sw-' + uid(), fromScp: false, subject: document.getElementById('swSubject').value, title,
    date: document.getElementById('swDate').value, grade: '', info: '',
    needsFix: null, fixDue: '', fixDone: false, file: null, filed: false, createdAt: now, updatedAt: now
  };
  schoolwork().push(it);
  saveData();
  go('schoolwork', { open: it.id });
}

function swDelete(id) {
  if (!confirm('Arbeit aus der Liste entfernen?')) return;
  state.data.schoolwork = schoolwork().filter(x => x.id !== id);
  markDeleted(id);
  saveData();
  schedulePushSoon();
  go('schoolwork');
}

// Erinnerung am Abend vor der Abgabe einer Verbesserung
function schoolworkPushJobs() {
  return swTodos().filter(t => t.kind === 'fix' && t.it.fixDue).map(({ it }) => {
    const d = daysBetween(todayStr(), it.fixDue);
    if (d < 1 || d > 7) return null;
    return { t: new Date(`${todayStr(d - 1)}T18:00:00`).getTime(), title: 'Morgen Verbesserung abgeben', body: it.title + (it.subject ? ' (' + getSubject(it.subject).name + ')' : '') };
  }).filter(Boolean);
}
