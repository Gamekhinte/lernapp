// OneNote-Import: liest die OneNote-Sicherungsdateien (.one) direkt im Browser.
// Bilder (Arbeitsblätter, Buchseiten) und Text werden herausgezogen, neue Seiten landen in "Neu aus OneNote".
// Am PC (Chrome/Edge) merkt sich die App den Ordner und prüft bei jedem Öffnen und alle 30 Minuten auf Neues.

const ONE_PNG = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
const ONE_PNG_END = [0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82];
const ONE_JPG = [0xFF, 0xD8, 0xFF];
const canPickFolder = typeof window.showDirectoryPicker === 'function';

// ---------- Zuordnung Notizbuch → Fach ----------

function guessSubject(notebook) {
  const n = notebook.toLowerCase();
  const rules = [
    [/mathe/, 'mathe'], [/englisch|english/, 'englisch'], [/franz|^\d{2}f\d|french/, 'franzoesisch'],
    [/deutsch/, 'deutsch'], [/chemie/, 'chemie'], [/physik/, 'physik'], [/powi|politik/, 'powi'],
    [/reli|rka|rev|ethik/, 'religion'], [/bio/, 'biologie'], [/geschichte|gesch/, 'geschichte'], [/erdkunde|geo/, 'erdkunde']
  ];
  const hit = rules.find(([re]) => re.test(n));
  return hit ? hit[1] : null;
}

function notebookLabel(name) {
  const subj = state.data.onenote.notebooks[name]?.subject;
  return subj ? getSubject(subj).name : name;
}

// ---------- Dateien sammeln ----------

async function collectOneFiles(source) {
  const files = [];
  if (source.kind === 'handle') {
    const walk = async (dir, parts) => {
      for await (const entry of dir.values()) {
        if (entry.kind === 'directory') {
          if (!/recyclebin/i.test(entry.name)) await walk(entry, [...parts, entry.name]);
        } else if (/\.one$/i.test(entry.name)) {
          const file = await entry.getFile();
          files.push({ parts: [...parts, entry.name], file });
        }
      }
    };
    await walk(source.handle, []);
  } else {
    source.files.forEach(file => {
      if (!/\.one$/i.test(file.name) || /recyclebin/i.test(file.webkitRelativePath)) return;
      // Erster Teil ist der gewählte Ordner selbst
      files.push({ parts: file.webkitRelativePath.split('/').slice(1), file });
    });
  }
  // Pro Abschnitt nur die neueste Sicherung nehmen
  const latest = {};
  files.forEach(({ parts, file }) => {
    const notebook = parts.length > 1 ? parts[0] : 'OneNote';
    const fileName = parts[parts.length - 1];
    const dm = fileName.match(/\(Am (\d{1,2})\.(\d{1,2})\.(\d{4})\)/);
    const date = dm ? `${dm[3]}-${dm[2].padStart(2, '0')}-${dm[1].padStart(2, '0')}` : new Date(file.lastModified).toISOString().slice(0, 10);
    const section = fileName.replace(/\.one$/i, '').replace(/\s*\(Am [^)]*\)$/, '').replace(/\.one$/i, '');
    if (/^(willkommen|welcome)$/i.test(section)) return;
    const middle = parts.slice(1, -1).join(' / ');
    const key = [notebook, middle, section].filter(Boolean).join(' / ');
    const prev = latest[key];
    if (!prev || date > prev.date || (date === prev.date && file.lastModified > prev.file.lastModified)) {
      latest[key] = { key, notebook, section, folder: middle, date, file };
    }
  });
  return Object.values(latest);
}

// ---------- .one-Datei auslesen ----------

function findSeq(u8, seq, from = 0, to = u8.length) {
  const first = seq[0], len = seq.length;
  for (let i = from; i <= to - len; i++) {
    if (u8[i] !== first) continue;
    let ok = true;
    for (let j = 1; j < len; j++) if (u8[i + j] !== seq[j]) { ok = false; break; }
    if (ok) return i;
  }
  return -1;
}

function extractImageCandidates(u8) {
  const out = [];
  let i = 0;
  while ((i = findSeq(u8, ONE_PNG, i)) !== -1) {
    const end = findSeq(u8, ONE_PNG_END, i + 8, Math.min(u8.length, i + 40e6));
    if (end === -1) break;
    out.push({ type: 'image/png', parts: [u8.subarray(i, end + 8)] });
    i = end + 8;
  }
  i = 0;
  while ((i = findSeq(u8, ONE_JPG, i)) !== -1) {
    if (u8[i + 3] < 0xE0 || u8[i + 3] > 0xEF) { i += 3; continue; }
    // JPEGs können ein Vorschaubild mit eigenem Ende enthalten, deshalb mehrere mögliche Enden probieren
    const ends = [];
    let e = i + 4;
    const limit = Math.min(u8.length, i + 15e6);
    while (ends.length < 4 && (e = findSeq(u8, [0xFF, 0xD9], e, limit)) !== -1) { ends.push(e + 2); e += 2; }
    if (ends.length) out.push({ type: 'image/jpeg', parts: ends.map(end => u8.subarray(i, end)) });
    i = (ends[ends.length - 1] || i + 3);
  }
  return out;
}

async function decodeCandidate(cand) {
  for (const bytes of cand.parts) {
    try {
      const bmp = await createImageBitmap(new Blob([bytes], { type: cand.type }));
      // Kleine Symbole und Linien ignorieren
      if (bmp.width < 220 || bmp.height < 100 || bmp.width * bmp.height < 70000) { bmp.close?.(); return { skip: true, bytes }; }
      const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
      bmp.close?.();
      return { b64: canvas.toDataURL('image/jpeg', 0.82).split(',')[1], bytes };
    } catch (e) { /* nächstes mögliches Ende probieren */ }
  }
  return null;
}

const ONE_TEXT_JUNK = /resolutionId|ifndf|HYPERLINK|file:|[A-Z]:\\|Exported|[<>{}]|Calibri|Aptos|PageTitle|PageDateTime|Class Notebook|\.(png|emf|jpg|docx|xlsx|pdf)\b|S::|@|SFUI|-apple-system|Unbenanntes Bild/i;

// Handschrift: OneNote speichert pro geschriebenem Wort bis zu 5 Erkennungs-Varianten direkt hintereinander.
// Die erste Variante ist die beste. Daraus wird die Mitschrift zurückgebaut.
const INK_PARSE_VERSION = 2;
function extractInk(u8) {
  const strs = [];
  let cur = '', start = -1;
  const flush = end => {
    const t = cur.trim();
    if (t.length >= 2) strs.push({ start, end, t });
    cur = ''; start = -1;
  };
  for (let i = 0; i + 1 < u8.length; i += 2) {
    const c = u8[i] | (u8[i + 1] << 8);
    if ((c >= 0x20 && c <= 0x7E) || (c >= 0xA0 && c <= 0xFF)) {
      if (start < 0) start = i;
      cur += String.fromCharCode(c);
    } else if (cur) {
      flush(i);
    }
  }
  flush(u8.length);
  const norm = s => s.toLowerCase().replace(/[^a-zäöüß0-9]/g, '');
  const similar = (a, b) => { a = norm(a); b = norm(b); return !a || !b ? a === b : a.slice(0, 2) === b.slice(0, 2) || a.slice(-3) === b.slice(-3); };
  const words = [];
  let cluster = [];
  const take = () => {
    if (cluster.length >= 3 && cluster.length <= 6) {
      const alts = cluster.map(x => x.t);
      const best = alts[0];
      const okAlts = alts.slice(1).filter(a => similar(best, a)).length >= alts.length - 2;
      if (best.length <= 40 && new Set(alts).size >= 3 && okAlts && (best.match(/[A-Za-zÄÖÜäöüß0-9]/g) || []).length >= 2 && alts.every(a => a.length <= 40)) {
        words.push({ pos: cluster[0].start, w: best });
      }
    }
    cluster = [];
  };
  strs.forEach(s => {
    if (cluster.length && s.start - cluster[cluster.length - 1].end > 4) take();
    cluster.push(s);
  });
  take();
  // Wörter zu Zeilen zusammensetzen, doppelte Zeilen (alte Versionen der Seite) weglassen
  const lines = [];
  let line = [], prev = null;
  words.forEach(({ pos, w }) => {
    if (prev !== null && pos - prev > 1200) { lines.push(line.join(' ')); line = []; }
    line.push(w);
    prev = pos;
  });
  if (line.length) lines.push(line.join(' '));
  const seen = new Set();
  return lines.map(l => l.trim()).filter(l => l.length >= 4 && !seen.has(l) && seen.add(l)).join('\n').slice(0, 5000);
}

function extractText(u8) {
  const seen = new Set(), lines = [];
  for (let start = 0; start < 2; start++) {
    let cur = '';
    const flush = () => {
      const t = cur.replace(/\s+/g, ' ').trim();
      cur = '';
      if (t.length < 8 || seen.has(t) || ONE_TEXT_JUNK.test(t)) return;
      const letters = (t.match(/[A-Za-zÄÖÜäöüß]/g) || []).length;
      const spaces = (t.match(/ /g) || []).length;
      if (letters / t.length < 0.55) return;
      if (spaces < 2 && !(t.length >= 10 && /^[A-ZÄÖÜ0-9]/.test(t) && spaces >= 1)) return;
      seen.add(t);
      lines.push(t);
    };
    for (let i = start; i + 1 < u8.length; i += 2) {
      const c = u8[i] | (u8[i + 1] << 8);
      if ((c >= 0x20 && c <= 0x7E) || (c >= 0xA0 && c <= 0x17F) || (c >= 0x2010 && c <= 0x2027) || c === 0x20AC || c === 0x2192) {
        cur += String.fromCharCode(c);
      } else if (c === 10 || c === 13 || c === 11) {
        cur += ' ';
        if (cur.length > 2) flush();
      } else if (cur) {
        flush();
      }
    }
    flush();
  }
  return lines.join('\n').slice(0, 4000);
}

// ---------- Einlesen ----------

async function scanOneNote(source, { interactive = false } = {}) {
  if (state.onenoteScanning) return 0;
  state.onenoteScanning = true;
  // Immer frisch nachschlagen: Während des Durchlaufs kann der Cloud-Abgleich state.data austauschen
  const on = () => state.data.onenote;
  let added = 0;
  const errors = [];
  state.onenoteProgress = { done: 0, total: 0, label: 'Dateien werden gesucht' };
  try {
    if (interactive) renderLoading('OneNote wird durchsucht', 'Beim ersten Mal kann das ein paar Minuten dauern.');
    const sections = await collectOneFiles(source);
    sections.forEach(s => {
      if (!on().notebooks[s.notebook]) {
        const subject = guessSubject(s.notebook);
        on().notebooks[s.notebook] = { subject, include: !!subject };
      }
    });
    if ((on().parseVersion || 1) < INK_PARSE_VERSION) { on().sections = {}; on().parseVersion = INK_PARSE_VERSION; }
    const todo = sections.filter(s => on().notebooks[s.notebook].include && on().sections[s.key] !== `${s.file.size}-${s.file.lastModified}`);
    state.onenoteProgress.total = todo.length;
    for (let n = 0; n < todo.length; n++) {
      const s = todo[n];
      const label = `${notebookLabel(s.notebook)}, ${s.section}`;
      state.onenoteProgress = { done: n, total: todo.length, label };
      if (interactive) setLoadingLabel(`Abschnitt ${n + 1} von ${todo.length}: ${label}`);
      else if (state.screen === 'onenote' && n % 3 === 0) render();
      // Ein kaputter Abschnitt soll den Rest nicht aufhalten
      try {
        const u8 = new Uint8Array(await s.file.arrayBuffer());
        const text = extractText(u8);
        if (text) on().texts[s.key] = text;
        const ink = extractInk(u8);
        on().notes = on().notes || {};
        if (ink) on().notes[s.key] = ink;
        on().sectionInfo = on().sectionInfo || {};
        on().sectionInfo[s.key] = { notebook: s.notebook, section: s.section, date: s.date, subject: on().notebooks[s.notebook].subject };
        for (const cand of extractImageCandidates(u8)) {
          const hash = await hashBytes(cand.parts[0].subarray(0, Math.min(cand.parts[0].length, 400000)));
          if (on().seen[hash]) continue;
          const img = await decodeCandidate(cand);
          on().seen[hash] = 1;
          if (!img || img.skip) continue;
          const imgId = await putImage(img.b64);
          if (on().items.some(it => it.imgId === imgId)) continue;
          on().items.push({
            id: uid(), imgId, key: s.key, notebook: s.notebook, section: s.section,
            subject: on().notebooks[s.notebook].subject, status: 'new', addedAt: todayStr(), date: s.date
          });
          added++;
        }
        on().sections[s.key] = `${s.file.size}-${s.file.lastModified}`;
      } catch (err) {
        console.error('OneNote-Abschnitt', s.key, err);
        errors.push(`${label}: ${err.message}`);
      }
      // Zwischendurch speichern, damit bei langen Läufen nichts verloren geht
      if (n % 5 === 4) saveData();
    }
  } catch (err) {
    console.error('OneNote-Import', err);
    errors.push(err.message);
    toast('OneNote konnte nicht gelesen werden: ' + err.message);
  } finally {
    on().lastScan = new Date().toISOString();
    on().lastErrors = errors.slice(0, 5);
    state.onenoteScanning = false;
    state.onenoteProgress = null;
    saveData();
  }
  if (added) {
    toast(`${added} neue Seite${added > 1 ? 'n' : ''} aus OneNote`);
    autoFindTopics();
  }
  return added;
}

function setLoadingLabel(text) {
  const el = document.querySelector('#app .card p');
  if (el) el.textContent = text;
}

async function connectOneNote() {
  if (!canPickFolder) return document.getElementById('oneFolderInput')?.click();
  let handle;
  try {
    handle = await window.showDirectoryPicker({ id: 'onenote', mode: 'read', startIn: 'documents' });
  } catch (err) {
    if (err.name !== 'AbortError') alert('Dieser Ordner kann nicht geöffnet werden. Leg die OneNote-Sicherung in deinen Dokumente-Ordner (Anleitung auf der OneNote-Seite).');
    return;
  }
  await idbSet('handles', 'onenote', handle);
  state.onenoteHandle = handle;
  state.onenoteNeedsPermission = false;
  state.data.onenote.folderName = handle.name;
  await scanOneNote({ kind: 'handle', handle }, { interactive: true });
  go('onenote');
}

async function scanFromInput(e) {
  const files = Array.from(e.target.files || []);
  e.target.value = '';
  if (!files.length) return;
  state.data.onenote.folderName = files[0].webkitRelativePath.split('/')[0];
  await scanOneNote({ kind: 'files', files }, { interactive: true });
  go('onenote');
}

async function recheckOneNote(interactive = true) {
  const handle = state.onenoteHandle;
  if (!handle) return connectOneNote();
  let perm = await handle.queryPermission({ mode: 'read' });
  if (perm !== 'granted' && interactive) perm = await handle.requestPermission({ mode: 'read' });
  if (perm !== 'granted') { state.onenoteNeedsPermission = true; return; }
  state.onenoteNeedsPermission = false;
  const added = await scanOneNote({ kind: 'handle', handle }, { interactive });
  if (interactive) go('onenote');
  else if (added && ['home', 'onenote'].includes(state.screen)) render();
}

// Beim Start und danach alle 30 Minuten still prüfen (nur am PC mit gemerktem Ordner)
async function initOneNote() {
  if (!canPickFolder) return;
  try {
    const handle = await idbGet('handles', 'onenote');
    if (!handle) return;
    state.onenoteHandle = handle;
    await recheckOneNote(false);
    if (['home', 'onenote'].includes(state.screen)) render();
    setInterval(() => recheckOneNote(false), 30 * 60000);
  } catch (e) {
    console.warn('OneNote-Prüfung nicht möglich', e);
  }
}

// ---------- Ansicht ----------

function newOneNoteItems(subjectId = null) {
  return state.data.onenote.items.filter(it => it.status === 'new' && it.subject && (!subjectId || it.subject === subjectId));
}

function oneNoteBanner(subjectId = null) {
  const n = newOneNoteItems(subjectId).length;
  if (state.onenoteNeedsPermission && !subjectId) {
    return `<div class="one-banner" onclick="recheckOneNote(true)"><span>${icon('note', 24)}</span><div><b>OneNote prüfen</b><small>Ordner wieder freigeben</small></div><span class="chev">›</span></div>`;
  }
  if (!n) return '';
  return `<div class="one-banner" onclick="go('onenote', ${subjectId ? `{subject:'${subjectId}'}` : '{}'})"><span>${icon('note', 24)}</span><div><b>${n} neue Seite${n > 1 ? 'n' : ''} aus OneNote</b><small>Aussuchen, was du lernen willst</small></div><span class="chev">›</span></div>`;
}

function renderOneNote(container) {
  const on = state.data.onenote;
  const p = state.params;
  if (!p.sel) p.sel = [];
  const filter = p.subject || null;
  const items = newOneNoteItems(filter).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const groups = {};
  items.forEach(it => (groups[it.key] = groups[it.key] || []).push(it));
  const subjectsWithItems = [...new Set(newOneNoteItems().map(it => it.subject))];
  const lastScan = on.lastScan ? new Date(on.lastScan).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'noch nie';

  const prog = state.onenoteProgress;
  const progress = state.onenoteScanning && prog ? `
    <div class="scan-progress">
      <div class="xp-row"><span>Wird durchsucht</span><span>${prog.done} von ${prog.total || '?'}</span></div>
      <div class="bar"><div style="width:${prog.total ? Math.round(prog.done / prog.total * 100) : 5}%"></div></div>
      <p class="note">${esc(prog.label || '')}</p>
    </div>` : '';
  const scanErrors = (on.lastErrors || []).length && !state.onenoteScanning
    ? `<p class="note" style="color:var(--red)">Nicht lesbar: ${esc(on.lastErrors.join('; '))}</p>` : '';
  const status = canPickFolder
    ? (state.onenoteHandle
      ? `<p class="note" style="margin-top:0;">Verbunden mit <b>${esc(on.folderName || state.onenoteHandle.name)}</b> · zuletzt geprüft ${esc(lastScan)}. Wird bei jedem Öffnen und alle 30 Minuten geprüft.</p>
         <div class="row-2"><button class="btn btn-primary" onclick="recheckOneNote(true)">${icon('refresh', 16)} Jetzt prüfen</button><button class="btn btn-outline" onclick="connectOneNote()">${icon('folder', 16)} Anderer Ordner</button></div>`
      : `<p class="note" style="margin-top:0;">Einmal den Ordner mit den OneNote-Sicherungen verbinden. Danach kommen neue Arbeitsblätter und Hefteinträge automatisch.</p>
         <button class="btn btn-primary" onclick="connectOneNote()">${icon('folder', 16)} Ordner verbinden</button>`)
    : `<p class="note" style="margin-top:0;">Zuletzt am PC geprüft: ${esc(lastScan)}. OneNote wird am PC eingelesen (Chrome oder Edge). Neue Seiten erscheinen dann hier und du kannst sie auch am Handy verarbeiten.</p>
       <p class="note">Die Bilder lädt dein Laptop in die Cloud. Wenn hier nur gestreifte Platzhalter sind: die Lernapp am Laptop öffnen, angemeldet lassen und kurz warten.</p>
       <button class="btn btn-outline btn-sm" onclick="document.getElementById('oneFolderInput').click()">${icon('folder', 15)} Ordner einmalig auswählen</button>`;

  const notebooks = Object.entries(on.notebooks).sort();
  const subjOptions = cur => `<option value="">Nicht importieren</option>` + getSubjects().map(s => `<option value="${s.id}" ${cur === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('');

  const groupHtml = Object.entries(groups).map(([key, list]) => {
    const first = list[0];
    const subj = getSubject(first.subject);
    return `
      <div class="card one-group">
        <div class="one-group-head">
          <div class="one-title">${subjectBadge(subj, 'sm')}<b>${esc(first.section)}</b><small>${esc(subj.name)} · ${esc(first.date ? dateLabel(first.date) : '')} · ${list.length} Bild${list.length > 1 ? 'er' : ''}</small></div>
          <div class="sel-btns">
            <button class="btn btn-outline btn-xs" onclick="selectOneGroup(${jsArg(key)})">Alle</button>
            <button class="btn btn-outline btn-xs" onclick="ignoreOneGroup(${jsArg(key)})">Ignorieren</button>
          </div>
        </div>
        <div class="one-grid">
          ${list.map(it => `
            <div class="one-item ${p.sel.includes(it.id) ? 'picked' : ''}" onclick="toggleOneItem('${it.id}')">
              ${imgTag(it.imgId, 'thumb', false)}
              <span class="one-check">${p.sel.includes(it.id) ? icon('check', 14) : ''}</span>
              <button class="one-zoom" onclick="event.stopPropagation(); openImage('${it.imgId}')" aria-label="Vergrößern">${icon('search', 14)}</button>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');

  const done = on.items.filter(it => it.status === 'done').length;
  container.innerHTML = `
    <input type="file" id="oneFolderInput" webkitdirectory multiple hidden onchange="scanFromInput(event)">
    <div class="setup-header">${backBtn('home')}<h3>OneNote</h3><span></span></div>
    <div class="card">${progress}${status}${scanErrors}
      ${state.imgUpload?.left ? `<p class="note" style="${state.imgUpload.error ? 'color:var(--red)' : ''}">${state.imgUpload.error ? `Bilder-Upload hängt: ${esc(state.imgUpload.error)}` : `Bilder für das Handy werden hochgeladen, noch ${state.imgUpload.left}.`}</p>` : ''}
      <details class="solution" style="margin-bottom:0;">
        <summary>So richtest du es ein</summary>
        <ol class="solution-steps">
          <li>OneNote am PC öffnen → <b>Datei → Optionen → Speichern und Sichern</b>.</li>
          <li><b>Sicherungsordner</b> auf <b>Dokumente\\OneNote-Sicherung</b> ändern (der normale Ordner in AppData ist für den Browser gesperrt).</li>
          <li><b>Automatische Sicherung</b> auf <b>1 Stunde</b> stellen und einmal <b>"Alle Notizbücher jetzt sichern"</b> klicken.</li>
          <li>Hier auf <b>"OneNote-Ordner verbinden"</b> tippen und den Ordner <b>OneNote-Sicherung</b> wählen.</li>
        </ol>
      </details>
    </div>
    ${p.result ? `<div class="card one-result"><h3 class="card-title">Fertig</h3>${p.result.map(r => `<div class="task-row"><div class="task-text"><span>${esc(r.name)}</span><small>${esc(getSubject(r.subject).name)} · ${r.count} ${r.kind === 'set' ? 'Aufgaben' : 'Karten'}</small></div><button class="btn btn-primary btn-xs" onclick="${r.kind === 'set' ? `startMathRun({ setId: '${r.id}' })` : `go('deckSetup', {deckId:'${r.id}'})`}">Lernen</button></div>`).join('')}</div>` : ''}
    ${subjectsWithItems.length > 1 ? `<div class="chip-row"><button class="chip ${!filter ? 'active' : ''}" onclick="go('onenote', {})">Alle</button>${subjectsWithItems.map(id => `<button class="chip ${filter === id ? 'active' : ''}" onclick="go('onenote', {subject:'${id}'})">${esc(getSubject(id).name)}</button>`).join('')}</div>` : ''}
    <h3 class="group-title">Neu aus OneNote (${items.length})</h3>
    ${notesCardHtml(filter)}
    ${groupHtml || `<div class="empty">${on.lastScan ? 'Alles erledigt. Neue Arbeitsblätter tauchen hier auf, sobald OneNote sie sichert.' : 'Noch nichts eingelesen.'}</div>`}
    ${done ? `<p class="note center">${done} Bilder schon verarbeitet.</p>` : ''}
    ${notebooks.length ? `
      <details class="card one-settings">
        <summary class="card-title" style="margin:0;">Notizbücher zuordnen</summary>
        ${notebooks.map(([name, nb]) => `
          <div class="nb-row"><span>${esc(name)}</span>
            <select onchange="setNotebookSubject(${jsArg(name)}, this.value)">${subjOptions(nb.include ? nb.subject : '')}</select>
          </div>`).join('')}
        <p class="note">Nach einer Änderung einmal "Jetzt prüfen" tippen.</p>
      </details>` : ''}
    ${p.sel.length ? `<div class="one-action"><button class="btn btn-primary" onclick="processOneNote()">${p.sel.length} Bild${p.sel.length > 1 ? 'er' : ''} verarbeiten</button></div>` : ''}
  `;
}

function toggleOneItem(id) {
  const sel = state.params.sel || (state.params.sel = []);
  const i = sel.indexOf(id);
  if (i === -1) sel.push(id); else sel.splice(i, 1);
  render();
}

function selectOneGroup(key) {
  const sel = state.params.sel || (state.params.sel = []);
  const ids = newOneNoteItems().filter(it => it.key === key).map(it => it.id);
  const all = ids.every(id => sel.includes(id));
  state.params.sel = all ? sel.filter(id => !ids.includes(id)) : [...new Set([...sel, ...ids])];
  render();
}

function ignoreOneGroup(key) {
  state.data.onenote.items.forEach(it => { if (it.key === key && it.status === 'new') it.status = 'ignored'; });
  state.params.sel = (state.params.sel || []).filter(id => state.data.onenote.items.find(it => it.id === id)?.status === 'new');
  saveData();
  render();
}

function setNotebookSubject(name, subjectId) {
  const on = state.data.onenote;
  on.notebooks[name] = { subject: subjectId || null, include: !!subjectId };
  // Abschnitte neu einlesen lassen und Fach bei offenen Bildern anpassen
  Object.keys(on.sections).forEach(k => { if (k.startsWith(name + ' / ')) delete on.sections[k]; });
  on.items.forEach(it => { if (it.notebook === name && it.status === 'new') it.subject = subjectId || null; });
  saveData();
  render();
}

// ---------- Verarbeiten ----------

async function processOneNote() {
  if (!requireAi()) return;
  const on = state.data.onenote;
  const chosen = on.items.filter(it => (state.params.sel || []).includes(it.id) && it.status === 'new');
  if (!chosen.length) return;
  const groups = {};
  chosen.forEach(it => (groups[it.key] = groups[it.key] || []).push(it));
  const result = [];
  let step = 0, errors = 0;
  const totalCalls = Object.values(groups).reduce((n, g) => n + Math.ceil(g.length / 3), 0);
  renderLoading('OneNote-Seiten werden gelesen', 'Ein paar Sekunden pro Bild.');

  for (const [key, list] of Object.entries(groups)) {
    const subject = getSubject(list[0].subject);
    const context = on.texts[key] || '';
    let cards = [], quiz = [], tasks = [], lang = null, typeHint = null;
    // Bis zu 3 Bilder pro Anfrage, das spart Anfragen
    for (let i = 0; i < list.length; i += 3) {
      const batch = list.slice(i, i + 3);
      setLoadingLabel(`Schritt ${++step} von ${totalCalls}: ${subject.name}, ${list[0].section}`);
      const images = (await Promise.all(batch.map(it => getImageBase64(it.imgId)))).filter(Boolean);
      if (!images.length) continue;
      try {
        if (subject.kind === 'mathe') {
          const ctx = context ? `\nText aus dem OneNote-Abschnitt (nur als Hilfe):\n${context.slice(0, 2000)}` : '';
          const res = await aiAsk(`${SCHOOL_CONTEXT} Die Bilder zeigen Mathe-Aufgaben oder Merkkästen aus dem Unterricht. Übernimm jede erkennbare Aufgabe (Teilaufgaben einzeln) und löse sie Schritt für Schritt. Erzeuge zu jedem Thema 2 ähnliche neue Übungsaufgaben mit anderen Zahlen. Merkkästen ohne Aufgabe: mach daraus eine passende Übungsaufgabe.${ctx}\n${MATH_TASK_FORMAT}`, images);
          tasks.push(...cleanMathTasks(res.tasks));
        } else {
          const res = await aiAsk(cardsPrompt(subject, subject.kind === 'sprache', context), images);
          cards.push(...cleanCards(res.cards));
          quiz.push(...cleanQuiz(res.quiz));
          if (res.detectedLang && !lang) lang = res.detectedLang;
          if (res.type === 'facts') typeHint = 'facts';
        }
      } catch (err) {
        console.error('OneNote-KI', err);
        errors++;
      }
    }
    const pages = list.map(it => it.imgId);
    // Doppelte Karten aus mehreren Bildern zusammenfassen
    const seenTerms = new Set();
    cards = cards.filter(c => { const k = c.term.toLowerCase(); if (seenTerms.has(k)) return false; seenTerms.add(k); return true; });
    if (subject.kind === 'mathe' && tasks.length) {
      let set = state.data.mathSets.find(s => s.onenoteKey === key);
      if (set) set.tasks.push(...tasks);
      else {
        set = { id: uid(), title: list[0].section, tasks, source: 'onenote', onenoteKey: key, pages, createdAt: new Date().toISOString() };
        state.data.mathSets.unshift(set);
      }
      result.push({ kind: 'set', id: set.id, name: set.title, subject: subject.id, count: tasks.length });
    } else if (cards.length) {
      let deck = state.data.decks.find(d => d.onenoteKey === key);
      if (deck) {
        const known = new Set(deck.cards.map(c => c.term.toLowerCase()));
        deck.cards.push(...cards.filter(c => !known.has(c.term.toLowerCase())));
        deck.quiz.push(...quiz);
        deck.pages = [...new Set([...(deck.pages || []), ...pages])];
        touch(deck);
      } else {
        deck = {
          id: uid(), name: list[0].section, subject: subject.id,
          type: subject.kind === 'sprache' && typeHint !== 'facts' ? 'vocab' : 'facts',
          sourceLang: (lang && LANGUAGES.some(l => l.code === lang)) ? lang : subject.lang || 'en', targetLang: 'de',
          folderId: null, cards, quiz, pages, onenoteKey: key, createdAt: new Date().toISOString()
        };
        state.data.decks.unshift(deck);
      }
      result.push({ kind: 'deck', id: deck.id, name: deck.name, subject: subject.id, count: cards.length });
    }
    // Auch ohne Ergebnis als erledigt markieren (z. B. Deko-Bilder)
    if (!errors || cards.length || tasks.length) list.forEach(it => { it.status = 'done'; });
    saveData();
  }

  if (errors) toast(`${errors} Anfrage${errors > 1 ? 'n' : ''} hat nicht geklappt. Die Bilder bleiben in der Liste.`);
  else if (!result.length) toast('Auf den Bildern war kein Lernstoff. Sie wurden als erledigt markiert.');
  addXp(5 * result.length);
  go('onenote', { subject: state.params.subject, result: result.length ? result : null });
}

// ---------- Mitschriften (getippter Text und Handschrift) ----------

function sectionNotes(key) {
  const on = state.data.onenote || {};
  const typed = cleanOneText(on.texts?.[key] || '');
  const ink = on.notes?.[key] || '';
  return { typed, ink, length: typed.length + ink.length };
}

function notesList(subjectId = null) {
  const on = state.data.onenote || {};
  return Object.entries(on.sectionInfo || {})
    .filter(([key, info]) => info.subject && (!subjectId || info.subject === subjectId) && sectionNotes(key).length >= 120)
    .map(([key, info]) => ({ key, ...info, done: (on.notesDone || {})[key] }))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function notesCardHtml(subjectId) {
  const list = notesList(subjectId).slice(0, 12);
  if (!list.length) return '';
  return `
    <h3 class="group-title">Mitschriften</h3>
    <div class="card tight">
      ${list.map(n => `
        <div class="task-row ${n.done ? 'done' : ''}">
          ${subjectBadge(getSubject(n.subject), 'sm')}
          <div class="task-text"><span>${esc(n.section)}</span><small>${esc(getSubject(n.subject).name)}${n.date ? ' · ' + dateLabel(n.date) : ''}${n.done ? ' · schon gelernt' : ''}</small></div>
          <button class="btn btn-outline btn-xs" onclick='openNotes(${jsArg(n.key)})'>Ansehen</button>
        </div>`).join('')}
    </div>`;
}

function openNotes(key) {
  const info = state.data.onenote.sectionInfo?.[key] || {};
  const n = sectionNotes(key);
  openModal(`
    <h3 class="modal-title">${esc(info.section || 'Mitschrift')}</h3>
    <p class="note" style="margin-top:0;">${esc(getSubject(info.subject).name)}${info.date ? ' · Stand ' + dateLabel(info.date) : ''}. Handschrift wird automatisch erkannt, einzelne Wörter können falsch sein.</p>
    ${n.ink ? `<p class="mini-label">Handschrift</p><div class="notes-box">${esc(n.ink).replace(/\n/g, '<br>')}</div>` : ''}
    ${n.typed ? `<p class="mini-label" style="margin-top:10px;">Getippt und Arbeitsblätter</p><div class="notes-box">${esc(n.typed).replace(/\n/g, '<br>')}</div>` : ''}
    <div class="row-2" style="margin-top:14px;">
      <button class="btn btn-outline" onclick="closeModal()">Schließen</button>
      <button class="btn btn-primary" onclick='learnFromNotes(${jsArg(key)})'>${getSubject(info.subject).kind === 'mathe' ? 'Aufgaben daraus' : 'Lernkarten daraus'}</button>
    </div>`);
}

async function learnFromNotes(key) {
  if (!requireAi()) return;
  const on = state.data.onenote;
  const info = on.sectionInfo?.[key] || {};
  const subject = getSubject(info.subject);
  const n = sectionNotes(key);
  const material = `${n.ink ? 'Handschriftliche Mitschrift (automatisch erkannt, kann Fehler enthalten):\n' + n.ink + '\n\n' : ''}${n.typed ? 'Getippter Text und Arbeitsblätter:\n' + n.typed : ''}`.slice(0, 7000);
  closeModal();
  renderLoading('Mitschrift wird verarbeitet', 'Gleich fertig.');
  try {
    if (subject.kind === 'mathe') {
      const res = await aiAsk(`${SCHOOL_CONTEXT} Das ist meine Mitschrift aus dem Mathe-Unterricht zum Abschnitt "${info.section}":\n${material}\n\nErstelle daraus Übungsaufgaben zu genau diesen Themen (6 bis 10 Stück), mit Lösungsweg. ${MATH_TASK_FORMAT}`);
      const tasks = cleanMathTasks(res.tasks);
      if (!tasks.length) throw new Error('Keine Aufgaben erhalten.');
      let set = state.data.mathSets.find(s => s.onenoteKey === key);
      if (set) set.tasks.push(...tasks);
      else { set = { id: uid(), title: info.section, tasks, source: 'onenote', onenoteKey: key, createdAt: new Date().toISOString() }; state.data.mathSets.unshift(set); }
      on.notesDone = { ...(on.notesDone || {}), [key]: true };
      saveData();
      toast(`${tasks.length} Aufgaben aus der Mitschrift.`);
      return startMathRun({ setId: set.id });
    }
    const res = await aiAsk(`${SCHOOL_CONTEXT} Fach: ${subject.name}. Das ist meine Mitschrift aus dem Unterricht zum Abschnitt "${info.section}":\n${material}\n\nErstelle daraus Lernkarten zu den wichtigsten Begriffen, Regeln, Daten und Zusammenhängen (6 bis 20 Karten). "term" ist ein Begriff oder eine kurze Frage, "translation" die Erklärung in höchstens zwei Sätzen. Erkennungsfehler in der Handschrift sinnvoll korrigieren. Dazu 4 bis 8 Multiple-Choice-Fragen mit je 4 Antworten, genau eine richtig, mit kurzer Erklärung.${subject.kind === 'sprache' ? ' Vokabeln als term in der Fremdsprache, translation auf Deutsch, und "type":"vocab" setzen, sonst "type":"facts".' : ''}
JSON: {"type":"facts","cards":[{"term":"...","translation":"..."}],"quiz":[{"q":"...","options":["A","B","C","D"],"correct":0,"explain":"..."}]}`);
    const cards = cleanCards(res.cards);
    if (!cards.length) throw new Error('Keine Karten erhalten.');
    let deck = state.data.decks.find(d => d.onenoteKey === key);
    if (deck) {
      const known = new Set(deck.cards.map(c => c.term.toLowerCase()));
      deck.cards.push(...cards.filter(c => !known.has(c.term.toLowerCase())));
      deck.quiz.push(...cleanQuiz(res.quiz));
      touch(deck);
    } else {
      deck = {
        id: uid(), name: info.section, subject: subject.id, type: subject.kind === 'sprache' && res.type === 'vocab' ? 'vocab' : 'facts',
        sourceLang: subject.lang || 'en', targetLang: 'de', folderId: null, cards, quiz: cleanQuiz(res.quiz), pages: [],
        onenoteKey: key, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      state.data.decks.unshift(deck);
    }
    on.notesDone = { ...(on.notesDone || {}), [key]: true };
    saveData();
    toast(`${cards.length} Karten aus der Mitschrift.`);
    go('deckSetup', { deckId: deck.id });
  } catch (err) {
    toast('Das hat nicht geklappt: ' + err.message);
    go('onenote');
  }
}
