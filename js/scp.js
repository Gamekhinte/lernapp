// SCP (StudentControlPanel der Schule): Arbeiten und Termine von kreuzburg-it.de/scp.
// Abruf über die Supabase-Funktion "scp". Das Passwort bleibt nur auf diesem Gerät.

const SCP_FN = 'https://fgjtokbluxqnzotblnly.supabase.co/functions/v1/scp';
const SCP_PW_KEY = 'lernapp-scp-pw';
const EXAM_WORDS = /klassenarbeit|klausur|lernkontrolle|lzk|test|arbeit|\bka\b|prüfung|vokabeltest|referat/i;
const SUBJECT_WORDS = [
  [/mathe/i, 'mathe'], [/deutsch/i, 'deutsch'], [/englisch|english/i, 'englisch'], [/franz/i, 'franzoesisch'],
  [/chemie/i, 'chemie'], [/physik/i, 'physik'], [/powi|politik/i, 'powi'], [/reli|ethik/i, 'religion'],
  [/geschichte/i, 'geschichte'], [/bio/i, 'biologie'], [/erdkunde|geograf|geograph/i, 'erdkunde']
];

// Alles von einer Seite wie "Arbeiten" oder "Klausurplan" ist eine Arbeit, auch ohne das Wort im Text
function isScpExam(e) {
  return EXAM_WORDS.test(e.text) || EXAM_WORDS.test(e.source || '');
}

function scpData() {
  if (!state.data.scp) state.data.scp = {};
  const s = state.data.scp;
  s.entries = s.entries || [];
  return s;
}

function scpPassword() {
  try { return localStorage.getItem(SCP_PW_KEY) || ''; } catch (e) { return ''; }
}

function scpSubject(text) {
  const hit = SUBJECT_WORDS.find(([re]) => re.test(text));
  if (hit) return hit[1];
  // Kürzel wie "M", "Ch", "PoWi" als eigenes Wort
  const words = text.split(/[^A-Za-zÄÖÜäöü]+/).filter(w => w.length >= 1 && w.length <= 4);
  for (const w of words) {
    const key = w.toLowerCase();
    if (UNTIS_SHORT[key] && (w.length >= 2 || /^[MDEF]$/.test(w))) return UNTIS_SHORT[key];
  }
  return null;
}

async function syncScp({ silent = false } = {}) {
  const s = scpData();
  if (!s.email || !scpPassword()) return false;
  try {
    const res = await fetch(SCP_FN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + UNTIS_FN_KEY },
      body: JSON.stringify({ email: s.email, password: scpPassword() })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) throw new Error(data.error || 'Fehler ' + res.status);
    s.entries = data.entries || [];
    s.menu = data.menu || [];
    s.pages = data.pages || [];
    s.lastSync = new Date().toISOString();
    s.lastError = null;
    const added = importScpExams();
    saveData();
    if (added) toast(`${added} Arbeit${added > 1 ? 'en' : ''} aus dem SCP eingetragen`);
    else if (!silent) toast('SCP ist aktuell.');
    return true;
  } catch (err) {
    s.lastError = err.message;
    saveData();
    if (!silent) toast('SCP: ' + err.message);
    return false;
  } finally {
    if (['home', 'untis', 'plan'].includes(state.screen)) render();
  }
}

// Termine, die nach Arbeit klingen, als Arbeit mit Lernplan eintragen
function importScpExams() {
  const s = scpData();
  const today = todayStr();
  const ignored = untisData().ignoredExams;
  let added = 0;
  s.entries.forEach(e => {
    if (e.date < today || !isScpExam(e)) return;
    const subjectId = scpSubject(e.text);
    if (!subjectId) return;
    const id = 'scp-' + e.date + '-' + subjectId;
    if (ignored.includes(id) || state.data.exams.some(x => x.scpId === id)) return;
    // Schon aus Untis oder von Hand eingetragen? Dann nur den Text ergänzen
    const twin = state.data.exams.find(x => x.subject === subjectId && Math.abs(daysBetween(x.date, e.date)) <= 1);
    if (twin) {
      if (!twin.note) twin.note = e.text;
      twin.scpId = id;
      return;
    }
    const kind = (e.text.match(EXAM_WORDS) || ['Arbeit'])[0].replace(/^ka$/i, 'Klassenarbeit');
    const exam = {
      id: uid(), scpId: id, subject: subjectId, title: `${getSubject(subjectId).name}: ${kind[0].toUpperCase() + kind.slice(1)}`,
      date: e.date, note: e.text, sources: defaultSourcesFor(subjectId), createdAt: new Date().toISOString()
    };
    exam.tasks = generatePlan(exam);
    state.data.exams.push(exam);
    added++;
  });
  return added;
}

function scpCardHtml() {
  const s = scpData();
  const p = state.params;
  if (!s.email || p.scpEdit) {
    return `
      <div class="card">
        <p class="note" style="margin-top:0;">Holt Arbeiten und Termine aus kreuzburg-it.de/scp.</p>
        <label class="field-label">Schul-E-Mail</label>
        <input type="email" id="scpEmail" autocomplete="username" autocapitalize="off" value="${esc(s.email || '')}" placeholder="nachname.vorname@fgk-schueler.de">
        <label class="field-label" style="margin-top:10px;">Passwort</label>
        <input type="password" id="scpPw" autocomplete="current-password" placeholder="wie im SCP">
        <p class="note">Das Passwort bleibt nur auf diesem Gerät.</p>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="connectScp()">Verbinden</button>
      </div>`;
  }
  const upcoming = s.entries.filter(e => e.date >= todayStr()).sort((a, b) => a.date.localeCompare(b.date));
  const exams = upcoming.filter(isScpExam);
  const lastSync = s.lastSync ? new Date(s.lastSync).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'noch nie';
  return `
    <div class="card">
      <div class="school-pick"><div><b>${esc(s.email)}</b><small>zuletzt ${esc(lastSync)}</small></div></div>
      ${!scpPassword() ? '<p class="note" style="color:var(--red)">Auf diesem Gerät fehlt noch das Passwort.</p>' : ''}
      ${s.lastError ? `<p class="status-line bad">${icon('close', 15)} ${esc(s.lastError)}</p>` : s.lastSync ? `<p class="status-line ok">${icon('check', 15)} Verbunden, Anmeldung hat geklappt</p>` : ''}
      ${s.lastSync && !s.lastError ? `<div class="sync-list">
        <div class="sync-row"><span>${icon('check', 14)} Termine mit Datum</span><span class="mono-muted">${upcoming.length} demnächst</span></div>
        <div class="sync-row"><span>${icon('check', 14)} Davon Arbeiten und Tests</span><span class="mono-muted">${exams.length}</span></div>
      </div>` : ''}
      <div class="row-2" style="margin-top:12px;">
        ${scpPassword() ? `<button class="btn btn-primary" onclick="syncScp()">${icon('refresh', 16)} Jetzt abrufen</button>` : `<button class="btn btn-primary" onclick="go('untis', {scpEdit:true})">Passwort eingeben</button>`}
        <button class="btn btn-outline" onclick="disconnectScp()">Trennen</button>
      </div>
      ${upcoming.length ? `<div style="margin-top:12px;">${upcoming.slice(0, 15).map(e => {
        const subj = scpSubject(e.text);
        return `<div class="task-row"><div class="task-text"><span>${esc(e.text)}</span><small>${dateLabel(e.date)}${isScpExam(e) ? ' · Arbeit' : ''}${subj ? ' · ' + esc(getSubject(subj).name) : ''}</small></div></div>`;
      }).join('')}</div>` : ''}
      ${s.lastSync ? `<details class="solution"><summary>Gefundene Seiten im SCP</summary><p class="note">Durchsucht: ${esc((s.pages || []).join(', ') || 'nur die Startseite')}</p><p class="note">Menü: ${esc((s.menu || []).join(', '))}</p></details>` : ''}
    </div>`;
}

async function connectScp() {
  const s = scpData();
  const email = document.getElementById('scpEmail').value.trim();
  const pw = document.getElementById('scpPw').value;
  if (!email || !pw) return toast('E-Mail und Passwort fehlen.');
  s.email = email.includes('@') ? email : email + '@fgk-schueler.de';
  localStorage.setItem(SCP_PW_KEY, pw);
  renderLoading('Verbindung zum SCP', 'Arbeiten und Termine werden geholt.');
  const ok = await syncScp({ silent: true });
  if (!ok) {
    localStorage.removeItem(SCP_PW_KEY);
    toast('Anmeldung fehlgeschlagen: ' + (s.lastError || ''));
  } else {
    toast('Verbunden.');
  }
  go('untis', ok ? {} : { scpEdit: true });
}

function disconnectScp() {
  if (!confirm('SCP trennen? Eingetragene Arbeiten bleiben im Lernplan.')) return;
  localStorage.removeItem(SCP_PW_KEY);
  Object.assign(scpData(), { email: '', entries: [], menu: [], pages: [], lastSync: null, lastError: null });
  saveData();
  go('untis');
}
