// Arbeiten eintragen und den Stoff automatisch auf die Tage bis dahin verteilen.

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function nextExam(subjectId = null) {
  const today = todayStr();
  return state.data.exams
    .filter(e => e.date >= today && (!subjectId || e.subject === subjectId))
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}

function countdownText(date) {
  const d = daysBetween(todayStr(), date);
  return d <= 0 ? 'heute' : d === 1 ? 'morgen' : d + ' Tagen';
}

function dateLabel(date) {
  const d = daysBetween(todayStr(), date);
  if (d === 0) return 'Heute';
  if (d === 1) return 'Morgen';
  if (d === -1) return 'Gestern';
  const dt = new Date(date + 'T12:00:00');
  return `${WEEKDAYS[dt.getDay()]}, ${dt.getDate()}.${dt.getMonth() + 1}.`;
}

function examBanner(exam) {
  const open = (exam.tasks || []).filter(t => !t.done && t.date <= todayStr()).length;
  const days = daysBetween(todayStr(), exam.date);
  return `
    <div class="exam-banner ${days <= 2 ? 'soon' : ''}" onclick="go('examPlan', {id:'${exam.id}'})">
      <div class="exam-count"><strong>${Math.max(0, days)}</strong><small>${days === 1 ? 'Tag' : 'Tage'}</small></div>
      <div style="flex:1;">
        <b>${esc(exam.title)}</b>
        <p class="note" style="margin:2px 0 0;">${dateLabel(exam.date)} · ${open ? `${open} Aufgabe${open > 1 ? 'n' : ''} für heute` : 'Heute erledigt'}</p>
      </div>
      <span class="chev">›</span>
    </div>`;
}

function sourceName(src) {
  if (src.type === 'topic') return getMathTopic(src.id)?.name || 'Thema';
  if (src.type === 'set') return state.data.mathSets.find(s => s.id === src.id)?.title || 'Aufgaben';
  return state.data.decks.find(d => d.id === src.id)?.name || 'Kartei';
}

// Verteilt die Quellen auf die Tage bis zur Arbeit
function generatePlan(exam, oldTasks = []) {
  const today = todayStr();
  const n = Math.max(0, daysBetween(today, exam.date));
  const days = Array.from({ length: n }, (_, i) => todayStr(i));
  const tasks = [];
  const add = (date, label, ref) => tasks.push({ id: uid(), date, label, ref, done: false });
  const isMath = getSubject(exam.subject).kind === 'mathe';
  const srcs = exam.sources || [];
  const learnLabel = s => isMath ? `Üben: ${sourceName(s)}` : `Lernen: ${sourceName(s)}`;
  const refOf = s => ({ type: s.type === 'deck' ? 'deck' : s.type, id: s.id });

  if (!days.length) {
    add(today, 'Letzte Probearbeit schreiben', { type: 'exam' });
    return tasks;
  }
  const learnDays = days.length >= 3 ? days.length - 1 : days.length;
  // 1. Runde: jeden Stoff einmal lernen
  srcs.forEach((s, i) => add(days[Math.floor(i * learnDays / srcs.length)], learnLabel(s), refOf(s)));
  // 2. Runde: in der zweiten Hälfte nochmal wiederholen
  if (days.length >= 4) {
    const start = Math.floor(days.length / 2);
    const span = Math.max(1, days.length - start);
    srcs.forEach((s, i) => add(days[start + Math.floor(i * span / srcs.length)], (isMath ? 'Nochmal üben: ' : 'Wiederholen: ') + sourceName(s), refOf(s)));
  }
  // Tägliche Wiederholung ab Tag 2
  days.slice(1).filter(d => tasks.filter(t => t.date === d).length < 3).forEach(d => add(d, isMath ? 'Gemischte Aufgaben (10 Stück)' : 'Fällige Karten wiederholen', isMath ? { type: 'mix' } : { type: 'review', subject: exam.subject }));
  // Probearbeiten
  if (days.length >= 5) add(days[Math.floor(days.length / 2)], 'Probearbeit zur Halbzeit', { type: 'exam' });
  add(days[days.length - 1], 'Probearbeit am Tag vor der Arbeit', { type: 'exam' });

  // Erledigte Aufgaben behalten, wenn der Plan neu erstellt wird
  tasks.forEach(t => { if (oldTasks.some(o => o.done && o.date === t.date && o.label === t.label)) t.done = true; });
  return tasks.sort((a, b) => a.date.localeCompare(b.date));
}

// ---------- Übersicht ----------

function renderPlan(container) {
  const today = todayStr();
  const upcoming = state.data.exams.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = state.data.exams.filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const todayTasks = upcoming.flatMap(e => (e.tasks || []).filter(t => t.date <= today && !t.done).map(t => ({ exam: e, task: t })));

  container.innerHTML = `
    <h2 class="page-title">Lernplan</h2>
    ${todayTasks.length ? `
      <div class="card">
        <h3 class="card-title">Heute dran</h3>
        ${todayTasks.map(({ exam, task }) => taskRow(exam, task)).join('')}
      </div>` : ''}
    ${upcoming.map(examBanner).join('') || `
      <div class="card center">
        <p style="margin:4px 0;"><b>Noch keine Arbeit eingetragen.</b></p>
        <p class="note">Datum und Stoff eintragen. Der Stoff wird auf die Tage bis dahin verteilt, mit Wiederholungen und Probearbeiten.</p>
      </div>`}
    <button class="btn btn-primary" onclick="go('examEdit', {})">+ Arbeit eintragen</button>
    ${past.length ? `
      <h3 class="group-title" style="margin-top:24px;">Vergangene Arbeiten</h3>
      ${past.map(e => `
        <div class="deck-card" onclick="enterRealGrade('${e.id}')">
          <div class="deck-info" style="flex:1;"><h3>${esc(e.title)}</h3><p>${dateLabel(e.date).toUpperCase()}${e.realGrade ? ' · NOTE ' + esc(e.realGrade) : ' · NOTE EINTRAGEN'}</p></div>
          <span class="chev">${icon('edit', 16)}</span>
        </div>`).join('')}` : ''}
  `;
}

function taskRow(exam, task) {
  return `
    <div class="task-row ${task.done ? 'done' : ''}">
      <button class="check-btn ${task.done ? 'on' : ''}" onclick="togglePlanTask('${exam.id}', '${task.id}')" aria-label="Erledigt">${task.done ? icon('check', 16) : ''}</button>
      <div class="task-text">
        <span>${esc(task.label)}</span>
        <small>${esc(exam.title)}${task.date < todayStr() ? ' · überfällig' : ''}</small>
      </div>
      ${task.done ? '' : `<button class="btn btn-primary btn-xs" onclick="startPlanTask('${exam.id}', '${task.id}')">Los</button>`}
    </div>`;
}

function togglePlanTask(examId, taskId) {
  const task = state.data.exams.find(e => e.id === examId)?.tasks.find(t => t.id === taskId);
  if (!task) return;
  task.done = !task.done;
  if (task.done) addXp(5);
  saveData();
  render();
}

function startPlanTask(examId, taskId) {
  const exam = state.data.exams.find(e => e.id === examId);
  const task = exam?.tasks.find(t => t.id === taskId);
  if (!task) return;
  const r = task.ref;
  if (r.type === 'deck') {
    if (!state.data.decks.some(d => d.id === r.id)) return toast('Diese Kartei gibt es nicht mehr.');
    go('deckSetup', { deckId: r.id, mode: 'classic' });
  } else if (r.type === 'topic') {
    startMathRun({ topics: [r.id] });
  } else if (r.type === 'set') {
    if (!state.data.mathSets.some(s => s.id === r.id)) return toast('Diese Aufgaben gibt es nicht mehr.');
    startMathRun({ setId: r.id });
  } else if (r.type === 'mix') {
    const topics = exam.sources.filter(s => s.type === 'topic').map(s => s.id);
    startMathRun({ topics: topics.length ? topics : MATH_TOPICS.slice(0, 7).map(t => t.id), count: 10 });
  } else if (r.type === 'review') {
    if (allDueCards(exam.subject).length) return startDueReview(exam.subject);
    // Nichts fällig: einfach den Stoff der Arbeit gemischt abfragen
    const items = exam.sources.filter(s => s.type === 'deck').flatMap(s => {
      const d = state.data.decks.find(x => x.id === s.id);
      return d ? d.cards.map(c => ({ kind: 'card', card: c, deckId: d.id })) : [];
    });
    if (!items.length) { task.done = true; saveData(); return render(); }
    startPractice({
      title: 'Wiederholung ' + exam.title, subject: exam.subject, mode: 'classic', dir: 'source-target', shuffle: true,
      items: shuffle(items).slice(0, 25), ref: { type: 'review' }, returnTo: ['examPlan', { id: exam.id }]
    });
  } else if (r.type === 'exam') {
    go('examSetup', { subject: exam.subject, examId: exam.id });
  }
}

function enterRealGrade(id) {
  const exam = state.data.exams.find(e => e.id === id);
  openModal(`
    <h3 class="modal-title">${esc(exam.title)}</h3>
    <label class="field-label">Welche Note hast du bekommen?</label>
    <input type="text" id="realGrade" value="${esc(exam.realGrade || '')}" placeholder="z. B. 2+">
    <div class="row-2" style="margin-top:16px;">
      <button class="btn btn-danger" onclick="deleteExam('${id}')">Löschen</button>
      <button class="btn btn-primary" onclick="state.data.exams.find(e=>e.id==='${id}').realGrade=document.getElementById('realGrade').value.trim(); saveData(); closeModal(); render();">Speichern</button>
    </div>`);
}

// ---------- Arbeit eintragen ----------

function renderExamEdit(container) {
  const p = state.params;
  const existing = p.id ? state.data.exams.find(e => e.id === p.id) : null;
  if (!p.init) {
    p.init = true;
    p.subject = existing?.subject || p.subject || 'mathe';
    p.title = existing?.title || '';
    p.date = existing?.date || todayStr(7);
    p.srcs = existing ? existing.sources.map(s => s.type + ':' + s.id) : null;
  }
  const subject = getSubject(p.subject);
  if (!p.srcs) {
    p.srcs = subject.kind === 'mathe' ? [] : state.data.decks.filter(d => d.subject === p.subject).map(d => 'deck:' + d.id);
  }
  const checked = id => p.srcs.includes(id) ? 'checked' : '';
  let sources;
  if (subject.kind === 'mathe') {
    const groups = [...new Set(MATH_TOPICS.map(t => t.group))];
    sources = groups.map(g => `<p class="mini-label" style="margin-top:8px;">${esc(g)}</p>` + MATH_TOPICS.filter(t => t.group === g).map(t =>
      `<label class="check-row"><input type="checkbox" ${checked('topic:' + t.id)} onchange="toggleEditSrc('topic:${t.id}', this.checked)"> ${esc(t.name)}</label>`).join('')).join('')
      + state.data.mathSets.map(s => `<label class="check-row"><input type="checkbox" ${checked('set:' + s.id)} onchange="toggleEditSrc('set:${s.id}', this.checked)"> ${esc(s.title)}</label>`).join('');
  } else {
    const decks = state.data.decks.filter(d => d.subject === p.subject);
    sources = decks.map(d => `<label class="check-row"><input type="checkbox" ${checked('deck:' + d.id)} onchange="toggleEditSrc('deck:${d.id}', this.checked)"> ${esc(d.name)}</label>`).join('')
      || `<p class="note">Noch keine Karteien in ${esc(subject.name)}. Du kannst die Arbeit trotzdem eintragen und den Stoff später scannen. Dann einfach den Plan neu erstellen.</p>`;
  }

  container.innerHTML = `
    <div class="card">
      <div class="setup-header">
        ${backBtn(existing ? 'examPlan' : 'plan', existing ? { id: existing.id } : {})}
        <h3>${existing ? 'Arbeit bearbeiten' : 'Neue Arbeit'}</h3>
        <span></span>
      </div>
      <label class="field-label">Fach</label>
      <select onchange="state.params.subject=this.value; state.params.srcs=null; render();">
        ${getSubjects().map(s => `<option value="${s.id}" ${s.id === p.subject ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
      </select>
      <label class="field-label" style="margin-top:12px;">Name</label>
      <input type="text" value="${esc(p.title)}" placeholder="${esc(subject.name)}-Arbeit" oninput="state.params.title=this.value">
      <label class="field-label" style="margin-top:12px;">Datum</label>
      <input type="date" value="${p.date}" min="${todayStr()}" onchange="state.params.date=this.value">
      <label class="field-label" style="margin-top:14px;">Was kommt dran?</label>
      <div class="check-list">${sources}</div>
      <button class="btn btn-primary" style="margin-top:18px;" onclick="saveExamPlan()">${existing ? 'Speichern und Plan neu verteilen' : 'Lernplan erstellen'}</button>
    </div>`;
}

function toggleEditSrc(id, on) {
  const p = state.params;
  p.srcs = p.srcs.filter(x => x !== id);
  if (on) p.srcs.push(id);
}

function saveExamPlan() {
  const p = state.params;
  if (!p.date) return alert('Bitte ein Datum wählen.');
  const sources = p.srcs.map(s => { const [type, ...rest] = s.split(':'); return { type, id: rest.join(':') }; });
  let exam = p.id ? state.data.exams.find(e => e.id === p.id) : null;
  const title = p.title.trim() || getSubject(p.subject).name + '-Arbeit';
  if (exam) {
    Object.assign(exam, { subject: p.subject, title, date: p.date, sources });
    exam.tasks = generatePlan(exam, exam.tasks);
  } else {
    exam = { id: uid(), subject: p.subject, title, date: p.date, sources, createdAt: new Date().toISOString() };
    exam.tasks = generatePlan(exam);
    state.data.exams.push(exam);
  }
  saveData();
  toast('Lernplan erstellt.');
  go('examPlan', { id: exam.id });
}

function deleteExam(id) {
  if (!confirm('Arbeit und Lernplan löschen?')) return;
  state.data.exams = state.data.exams.filter(e => e.id !== id);
  saveData();
  go('plan');
}

// ---------- Plan einer Arbeit ----------

function renderExamPlan(container) {
  const exam = state.data.exams.find(e => e.id === state.params.id);
  if (!exam) return go('plan');
  const subject = getSubject(exam.subject);
  const total = exam.tasks.length, done = exam.tasks.filter(t => t.done).length;
  const byDate = {};
  exam.tasks.forEach(t => (byDate[t.date] = byDate[t.date] || []).push(t));
  const results = state.data.examResults.filter(r => r.subject === exam.subject).slice(0, 3);

  container.innerHTML = `
    <div class="subject-head" style="--subject:${subject.color}">
      ${backBtn('plan', {}, 'Plan')}
      <h2>${esc(exam.title)}</h2>
      <button class="icon-btn" onclick="go('examEdit', {id:'${exam.id}'})" title="Bearbeiten">${icon('edit', 16)}</button>
    </div>
    <div class="card center">
      <div class="countdown-big">${Math.max(0, daysBetween(todayStr(), exam.date))}</div>
      <p class="mono">${daysBetween(todayStr(), exam.date) === 1 ? 'Tag' : 'Tage'} bis zur Arbeit · ${dateLabel(exam.date)}</p>
      <div class="bar" style="margin:14px 0 6px;"><div style="width:${total ? Math.round(done / total * 100) : 0}%"></div></div>
      <p class="note">${done} von ${total} Aufgaben erledigt</p>
      ${results.length ? `<p class="note">Letzte Probearbeiten: ${results.map(r => `<b>${esc(r.gradeLabel)}</b>`).join(' · ')}</p>` : ''}
    </div>
    <div class="quick-grid two">
      <button class="btn btn-primary" onclick="go('examSetup', {subject:'${exam.subject}', examId:'${exam.id}'})">${icon('pen')} Probearbeit</button>
      <button class="btn btn-outline" onclick="openTutor('${exam.subject}')">${icon('chat')} Frage stellen</button>
    </div>
    ${!exam.sources.length ? `<div class="card"><p class="note" style="margin:0;">Für diese Arbeit ist noch kein Stoff ausgewählt. Oben auf Bearbeiten tippen und Themen oder Karteien auswählen.</p></div>` : ''}
    ${Object.entries(byDate).map(([date, tasks]) => `
      <h3 class="group-title ${date === todayStr() ? 'today' : ''}">${dateLabel(date)}</h3>
      <div class="card tight">${tasks.map(t => taskRow(exam, t)).join('')}</div>`).join('')}
  `;
}
