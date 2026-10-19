// WebUntis: Arbeiten, Hausaufgaben, Stundenplan und Ausfall übernehmen.
// Der Abruf läuft über die Supabase-Funktion "untis", weil Untis keine direkten Browser-Anfragen erlaubt.
// Das Passwort bleibt nur auf diesem Gerät (localStorage) und wird nur für den Abruf mitgeschickt.

const UNTIS_FN = 'https://fgjtokbluxqnzotblnly.supabase.co/functions/v1/untis';
// Öffentlicher Anon-Key des Projekts (darf im Browser stehen)
const UNTIS_FN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnanRva2JsdXhxbnpvdGJsbmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0MDQ1NTEsImV4cCI6MjEwNjk4MDU1MX0.pDD_2szeVPLCj9e0e-aUUnOg_4zryKODeNgP3cj4AKM';
const UNTIS_PW_KEY = 'lernapp-untis-pw';

function untisData() {
  if (!state.data.untis) state.data.untis = {};
  const u = state.data.untis;
  u.mapping = u.mapping || {};
  u.timetable = u.timetable || [];
  u.exams = u.exams || [];
  u.homework = u.homework || [];
  u.hwDone = u.hwDone || {};
  u.ignoredExams = u.ignoredExams || [];
  return u;
}

function untisPassword() {
  try { return localStorage.getItem(UNTIS_PW_KEY) || ''; } catch (e) { return ''; }
}

function untisReady() {
  const u = untisData();
  return !!(u.school && u.user && untisPassword());
}

async function untisCall(body) {
  const res = await fetch(UNTIS_FN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + UNTIS_FN_KEY },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(friendlyUntisError(data.error || 'Fehler ' + res.status));
  return data;
}

function friendlyUntisError(msg) {
  if (/bad credentials|invalid|fehlgeschlagen|-8504/i.test(msg)) return 'Benutzername oder Passwort stimmt nicht.';
  if (/too many/i.test(msg)) return 'Zu viele Versuche. Bitte später nochmal.';
  return msg;
}

// ---------- Fächer zuordnen ----------

const UNTIS_SHORT = {
  m: 'mathe', ma: 'mathe', d: 'deutsch', de: 'deutsch', e: 'englisch', en: 'englisch', f: 'franzoesisch', fr: 'franzoesisch',
  g: 'geschichte', ge: 'geschichte', gs: 'geschichte', ek: 'erdkunde', erd: 'erdkunde', geo: 'erdkunde',
  b: 'biologie', bi: 'biologie', bio: 'biologie', ch: 'chemie', c: 'chemie', ph: 'physik', p: 'physik',
  pw: 'powi', powi: 'powi', pol: 'powi', rel: 'religion', kr: 'religion', er: 'religion', rk: 'religion', ev: 'religion', ka: 'religion', eth: 'religion', rka: 'religion', rev: 'religion'
};

function untisSubject(short, long = '') {
  const u = untisData();
  if (short in u.mapping) return u.mapping[short] || null;
  const key = String(short || '').toLowerCase().replace(/[^a-zäöü]/g, '');
  return UNTIS_SHORT[key] || guessSubject(long || short || '') || null;
}

function untisSubjectNames() {
  const u = untisData();
  const names = {};
  u.timetable.forEach(l => { if (l.subject) names[l.subject] = l.subjectLong || names[l.subject] || ''; });
  u.exams.forEach(e => { if (e.subject && !(e.subject in names)) names[e.subject] = ''; });
  u.homework.forEach(h => { if (h.subject && !(h.subject in names)) names[h.subject] = ''; });
  return names;
}

// ---------- Abruf ----------

let untisSyncing = false;
async function syncUntis({ silent = false } = {}) {
  if (untisSyncing || !untisReady()) return false;
  untisSyncing = true;
  const u = untisData();
  const before = new Set(cancelledSoon().map(l => l.date + l.start + l.subject));
  try {
    const res = await untisCall({ action: 'sync', server: u.school.server, school: u.school.loginName, user: u.user, password: untisPassword() });
    u.timetable = res.timetable || [];
    u.exams = res.exams || [];
    u.homework = res.homework || [];
    u.warnings = res.warnings || [];
    u.lastSync = new Date().toISOString();
    u.lastError = null;
    const added = importUntisExams();
    saveData();
    const fresh = cancelledSoon().filter(l => !before.has(l.date + l.start + l.subject));
    if (fresh.length && silent) toast(`${dateLabel(fresh[0].date)} fällt ${fresh[0].subjectLong || fresh[0].subject} aus`);
    else if (added) toast(`${added} Arbeit${added > 1 ? 'en' : ''} aus Untis eingetragen`);
    else if (!silent) toast('Untis ist aktuell.');
    return true;
  } catch (err) {
    u.lastError = err.message;
    saveData();
    if (!silent) toast('Untis: ' + err.message);
    return false;
  } finally {
    untisSyncing = false;
    if (['home', 'untis', 'plan'].includes(state.screen)) render();
  }
}

function defaultSourcesFor(subjectId) {
  const subject = getSubject(subjectId);
  if (subject.kind === 'mathe') {
    const recent = MATH_TOPICS.filter(t => {
      const p = state.data.mathProgress[t.id];
      return p?.last && daysBetween(p.last, todayStr()) <= 45;
    });
    const list = recent.length ? recent : MATH_TOPICS.filter(t => t.group === 'Lineare Gleichungssysteme');
    return list.map(t => ({ type: 'topic', id: t.id }));
  }
  return state.data.decks.filter(d => d.subject === subjectId)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 8).map(d => ({ type: 'deck', id: d.id }));
}

// Arbeiten aus Untis als Arbeit mit Lernplan eintragen oder aktualisieren
function importUntisExams() {
  const u = untisData();
  const today = todayStr();
  let added = 0;
  u.exams.forEach(e => {
    if (e.date < today || u.ignoredExams.includes(e.id)) return;
    const subjectId = untisSubject(e.subject);
    if (!subjectId) return;
    const kind = e.type || e.name || 'Arbeit';
    const title = `${getSubject(subjectId).name}: ${kind}`;
    const existing = state.data.exams.find(x => x.untisId === e.id);
    if (existing) {
      const changed = existing.date !== e.date;
      Object.assign(existing, { date: e.date, note: e.text || existing.note || '' });
      if (changed) existing.tasks = generatePlan(existing, existing.tasks);
      return;
    }
    const exam = {
      id: uid(), untisId: e.id, subject: subjectId, title, date: e.date, note: e.text || '',
      sources: defaultSourcesFor(subjectId), createdAt: new Date().toISOString()
    };
    exam.tasks = generatePlan(exam);
    state.data.exams.push(exam);
    added++;
  });
  return added;
}

async function initUntis() {
  if (!untisReady()) return;
  const u = untisData();
  const age = u.lastSync ? (Date.now() - new Date(u.lastSync)) / 60000 : Infinity;
  if (age > 60) await syncUntis({ silent: true });
  setInterval(() => syncUntis({ silent: true }), 60 * 60000);
}

// ---------- Daten für die Startseite ----------

function cancelledSoon() {
  const u = untisData();
  const today = todayStr(), tomorrow = todayStr(1);
  return u.timetable.filter(l => l.cancelled && (l.date === today || l.date === tomorrow));
}

function untisDayToShow() {
  const u = untisData();
  const now = new Date();
  const nowStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const today = todayStr();
  const todayLeft = u.timetable.filter(l => l.date === today && l.end > nowStr);
  if (todayLeft.length) return today;
  return u.timetable.map(l => l.date).find(d => d > today) || null;
}

function homeworkOpen() {
  const u = untisData();
  const today = todayStr();
  return u.homework.filter(h => h.due >= today && !h.done && !u.hwDone[h.id]).sort((a, b) => a.due.localeCompare(b.due));
}

function untisHomeCards() {
  const u = untisData();
  if (!u.school || !u.lastSync) return '';
  let html = '';
  const day = untisDayToShow();
  if (day) {
    html += `
      <div class="card">
        <h3 class="card-title">Stundenplan · ${dateLabel(day)}</h3>
        ${lessonRowsHtml(day)}
      </div>`;
  }
  const hw = homeworkOpen().slice(0, 6);
  if (hw.length) {
    html += `
      <div class="card">
        <h3 class="card-title">Hausaufgaben</h3>
        ${hw.map(h => `
          <div class="task-row">
            <button class="check-btn" onclick="toggleHomework('${esc(h.id)}')" aria-label="Erledigt"></button>
            <div class="task-text"><span>${esc(h.text)}</span><small>${esc(h.subject)} · bis ${dateLabel(h.due)}${h.remark ? ' · ' + esc(h.remark) : ''}</small></div>
          </div>`).join('')}
      </div>`;
  }
  return html;
}

function lessonRowsHtml(day) {
  const u = untisData();
  // Mehrere Einträge pro Stunde (z. B. Kurse) zusammenfassen
  const seen = new Set();
  const rows = u.timetable.filter(l => l.date === day).filter(l => {
    const k = l.start + l.subject;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return rows.map(l => {
    const subjId = untisSubject(l.subject, l.subjectLong);
    const s = subjId ? getSubject(subjId) : { name: l.subjectLong || l.subject || 'Stunde', abbr: (l.subject || '?').slice(0, 3), color: '#8a8a8a' };
    return `
      <div class="lesson-row ${l.cancelled ? 'cancelled' : ''} ${l.irregular ? 'irregular' : ''}" ${subjId ? `onclick="go('subject', {id:'${subjId}'})"` : ''}>
        <span class="lesson-time">${esc(l.start)}</span>
        ${subjectBadge(s, 'sm')}
        <div class="lesson-text"><span>${esc(l.subjectLong || s.name)}</span>${l.cancelled ? '<small class="lesson-flag">fällt aus</small>' : l.irregular ? '<small class="lesson-flag">Vertretung</small>' : ''}${l.info ? `<small>${esc(l.info)}</small>` : ''}</div>
        <span class="mono-muted">${esc(l.room)}</span>
      </div>`;
  }).join('');
}

function toggleHomework(id) {
  const u = untisData();
  u.hwDone[id] = !u.hwDone[id];
  if (u.hwDone[id]) addXp(5);
  saveData();
  render();
}

// ---------- Seite ----------

function renderUntis(container) {
  const u = untisData();
  const p = state.params;
  const connected = !!(u.school && u.user);
  const lastSync = u.lastSync ? new Date(u.lastSync).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'noch nie';

  let top;
  if (!connected || p.edit) {
    const school = p.school || u.school;
    top = `
      <div class="card">
        <label class="field-label">Schule</label>
        ${school ? `<div class="school-pick"><div><b>${esc(school.displayName)}</b><small>${esc(school.address || school.server)}</small></div><button class="icon-btn small" onclick="state.params.school=null; state.params.forceSearch=true; render();">Ändern</button></div>` : ''}
        ${!school || p.forceSearch ? `
          <input type="text" id="untisSchoolQ" placeholder="Name der Schule und Ort" value="${esc(p.q || '')}" oninput="searchUntisSchool(this.value)">
          <div id="untisSchoolResults" class="school-results"></div>` : ''}
        <label class="field-label" style="margin-top:14px;">Benutzername</label>
        <input type="text" id="untisUser" autocomplete="username" autocapitalize="off" value="${esc(u.user || '')}" placeholder="wie in der Untis-App">
        <label class="field-label" style="margin-top:10px;">Passwort</label>
        <input type="password" id="untisPw" autocomplete="current-password" placeholder="wie in der Untis-App">
        <p class="note">Das Passwort bleibt nur auf diesem Gerät gespeichert und wird nur für den Abruf an Untis geschickt.</p>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="connectUntis()">Verbinden</button>
      </div>`;
  } else {
    top = `
      <div class="card">
        <div class="school-pick"><div><b>${esc(u.school.displayName)}</b><small>${esc(u.user)} · zuletzt ${esc(lastSync)}</small></div></div>
        ${!untisPassword() ? '<p class="note" style="color:var(--red)">Auf diesem Gerät fehlt noch das Passwort.</p>' : ''}
        ${u.lastError ? `<p class="status-line bad">${icon('close', 15)} Abruf fehlgeschlagen: ${esc(u.lastError)}</p>` : u.lastSync ? `<p class="status-line ok">${icon('check', 15)} Verbunden, Anmeldung hat geklappt</p>` : ''}
        ${u.lastSync && !u.lastError ? `
          <div class="sync-list">
            ${syncRow('Stundenplan', u.timetable.length, `Stunden an ${new Set(u.timetable.map(l => l.date)).size} Tagen`, 'Stundenplan')}
            ${syncRow('Arbeiten und Tests', u.exams.filter(e => e.date >= todayStr()).length, 'demnächst', 'Arbeiten')}
            ${syncRow('Hausaufgaben', homeworkOpen().length, 'offen', 'Hausaufgaben')}
          </div>` : ''}
        <div class="row-2" style="margin-top:12px;">
          ${untisPassword() ? `<button class="btn btn-primary" onclick="syncUntis()">${icon('refresh', 16)} Jetzt abrufen</button>` : `<button class="btn btn-primary" onclick="go('untis', {edit:true})">Passwort eingeben</button>`}
          <button class="btn btn-outline" onclick="disconnectUntis()">Trennen</button>
        </div>
      </div>`;
  }

  const names = untisSubjectNames();
  const days = [...new Set(u.timetable.map(l => l.date))].filter(d => d >= todayStr()).slice(0, 5);
  const hw = homeworkOpen();
  const upcoming = u.exams.filter(e => e.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date));
  container.innerHTML = `
    <div class="setup-header">${backBtn('profile')}<h3>Untis</h3><span></span></div>
    ${top}
    ${days.length ? `
      <h3 class="group-title">Stundenplan</h3>
      ${days.map(d => `<div class="card tight"><p class="mini-label day-label">${dateLabel(d)}</p>${lessonRowsHtml(d)}</div>`).join('')}` : ''}
    ${hw.length ? `
      <h3 class="group-title">Hausaufgaben</h3>
      <div class="card tight">${hw.map(h => `
        <div class="task-row">
          <button class="check-btn" onclick="toggleHomework('${esc(h.id)}')" aria-label="Erledigt"></button>
          <div class="task-text"><span>${esc(h.text)}</span><small>${esc(h.subject)} · bis ${dateLabel(h.due)}</small></div>
        </div>`).join('')}</div>` : ''}
    ${upcoming.length ? `
      <h3 class="group-title">Arbeiten und Tests</h3>
      <div class="card tight">${upcoming.map(e => {
        const subjId = untisSubject(e.subject);
        const ex = state.data.exams.find(x => x.untisId === e.id);
        return `<div class="task-row">
          <div class="task-text"><span>${esc(e.subject)} · ${esc(e.type || e.name || 'Arbeit')}</span><small>${dateLabel(e.date)}${e.start ? ' · ' + esc(e.start) : ''}${e.text ? ' · ' + esc(e.text) : ''}${!subjId ? ' · Fach zuordnen' : ''}</small></div>
          ${ex ? `<button class="btn btn-outline btn-xs" onclick="go('examPlan', {id:'${ex.id}'})">Plan</button>` : ''}
        </div>`;
      }).join('')}</div>` : ''}
    ${Object.keys(names).length ? `
      <details class="card one-settings" ${p.edit ? '' : ''}>
        <summary class="card-title" style="margin:0;">Fächer zuordnen</summary>
        ${Object.entries(names).sort().map(([short, long]) => {
          const cur = untisSubject(short, long);
          return `<div class="nb-row"><span>${esc(short)}${long ? ` <small class="mono-muted">${esc(long)}</small>` : ''}</span>
            <select onchange="setUntisMapping(${jsArg(short)}, this.value)">
              <option value="">Ignorieren</option>
              ${getSubjects().map(s => `<option value="${s.id}" ${cur === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
            </select></div>`;
        }).join('')}
      </details>` : ''}
    <p class="note center">Arbeiten aus Untis landen automatisch im Lernplan. Abgerufen wird beim Öffnen und jede Stunde.</p>
  `;
}

// Eine Zeile pro Datenart: Anzahl oder Grund, warum nichts kam
function syncRow(label, count, unit, warnKey) {
  const u = untisData();
  const warn = (u.warnings || []).find(w => w.startsWith(warnKey));
  const blocked = warn && !count;
  return `<div class="sync-row ${blocked ? 'bad' : ''}">
    <span>${blocked ? icon('close', 14) : icon('check', 14)} ${esc(label)}</span>
    <span class="mono-muted">${blocked ? 'von der Schule gesperrt' : `${count}${unit ? ' ' + esc(unit) : ''}`}</span>
  </div>`;
}

let schoolSearchTimer = null;
function searchUntisSchool(q) {
  state.params.q = q;
  clearTimeout(schoolSearchTimer);
  if (q.trim().length < 3) return;
  schoolSearchTimer = setTimeout(async () => {
    const box = document.getElementById('untisSchoolResults');
    if (box) box.innerHTML = '<p class="note">Suche …</p>';
    try {
      const { schools } = await untisCall({ action: 'search', query: q.trim() });
      state.params.results = schools;
      const el = document.getElementById('untisSchoolResults');
      if (!el) return;
      el.innerHTML = schools.length ? schools.map((s, i) => `
        <button class="school-result" onclick="pickUntisSchool(${i})"><b>${esc(s.displayName)}</b><small>${esc(s.address || '')}</small></button>`).join('')
        : '<p class="note">Keine Schule gefunden. Ort mit eingeben hilft.</p>';
    } catch (err) {
      const el = document.getElementById('untisSchoolResults');
      if (el) el.innerHTML = `<p class="note" style="color:var(--red)">${esc(err.message)}</p>`;
    }
  }, 400);
}

function pickUntisSchool(i) {
  const s = state.params.results?.[i];
  if (!s) return;
  const user = document.getElementById('untisUser')?.value || '';
  state.params.school = s;
  state.params.forceSearch = false;
  untisData().user = user || untisData().user;
  render();
}

async function connectUntis() {
  const u = untisData();
  const school = state.params.school || u.school;
  const user = document.getElementById('untisUser').value.trim();
  const pw = document.getElementById('untisPw').value;
  if (!school) return toast('Bitte zuerst die Schule auswählen.');
  if (!user || !pw) return toast('Benutzername und Passwort fehlen.');
  u.school = school;
  u.user = user;
  localStorage.setItem(UNTIS_PW_KEY, pw);
  renderLoading('Verbindung zu Untis', 'Stundenplan, Arbeiten und Hausaufgaben werden geholt.');
  const ok = await syncUntis({ silent: true });
  if (!ok) {
    localStorage.removeItem(UNTIS_PW_KEY);
    toast('Anmeldung fehlgeschlagen: ' + (u.lastError || 'unbekannter Fehler'));
  } else {
    toast('Verbunden.');
  }
  go('untis', ok ? {} : { edit: true, school });
}

function disconnectUntis() {
  if (!confirm('Untis trennen? Eingetragene Arbeiten bleiben im Lernplan.')) return;
  localStorage.removeItem(UNTIS_PW_KEY);
  const u = untisData();
  Object.assign(u, { school: null, user: '', lastSync: null, timetable: [], homework: [], exams: [], warnings: [], lastError: null });
  saveData();
  go('untis');
}

function setUntisMapping(short, subjectId) {
  untisData().mapping[short] = subjectId;
  importUntisExams();
  saveData();
  render();
}
