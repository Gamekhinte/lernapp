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

// Plant die Arbeit zusammen mit allen anderen auf die eingestellten Lernzeiten (siehe planner.js)
function generatePlan(exam, oldTasks = []) {
  if (oldTasks?.length && !exam.tasks?.length) exam.tasks = oldTasks;
  return rebuildAllPlans(exam) || exam.tasks || [];
}

// ---------- Übersicht ----------

// Arbeiten aus Untis und SCP, die (noch) nicht im Plan stehen, z. B. weil das Fach nicht erkannt wurde
function schoolPendingExams() {
  const today = todayStr();
  const ignored = untisData().ignoredExams;
  const list = [];
  untisData().exams.forEach(e => {
    if (e.date < today || ignored.includes(e.id) || state.data.exams.some(x => x.untisId === e.id)) return;
    list.push({ key: 'u:' + e.id, date: e.date, text: [e.subject, e.type || e.name, e.text].filter(Boolean).join(' · '), subject: untisSubject(e.subject), from: 'Untis' });
  });
  scpData().entries.forEach(e => {
    if (e.date < today || !isScpExam(e)) return;
    const subj = scpSubject(e.text);
    const id = 'scp-' + e.date + '-' + (subj || 'x');
    if (ignored.includes(id) || state.data.exams.some(x => x.scpId === id || (subj && x.subject === subj && Math.abs(daysBetween(x.date, e.date)) <= 1))) return;
    list.push({ key: 's:' + e.date + ':' + e.text.slice(0, 40), date: e.date, text: e.text, subject: subj, from: 'SCP' });
  });
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

function takeSchoolExam(key) {
  const item = schoolPendingExams().find(i => i.key === key);
  if (!item) return;
  const subjectId = document.getElementById('pend-' + btoa(unescape(encodeURIComponent(key))).replace(/[^a-z0-9]/gi, ''))?.value || item.subject;
  if (!subjectId) return toast('Bitte erst das Fach auswählen.');
  const exam = {
    id: uid(), subject: subjectId, title: `${getSubject(subjectId).name}: Arbeit`, date: item.date, note: item.text,
    sources: defaultSourcesFor(subjectId), createdAt: new Date().toISOString()
  };
  if (key.startsWith('u:')) exam.untisId = key.slice(2);
  else exam.scpId = 'scp-' + item.date + '-' + (item.subject || 'x');
  exam.tasks = generatePlan(exam);
  state.data.exams.push(exam);
  saveData();
  toast('In den Lernplan übernommen.');
  render();
}

function ignoreSchoolExam(key) {
  const item = schoolPendingExams().find(i => i.key === key);
  if (!item) return;
  untisData().ignoredExams.push(key.startsWith('u:') ? key.slice(2) : 'scp-' + item.date + '-' + (item.subject || 'x'));
  saveData();
  render();
}

function planTabs(view) {
  return `<div class="toggle-row">
    <div class="toggle-btn ${view === 'lern' ? 'active' : ''}" onclick="go('plan', {view:'lern'})">Lernplan</div>
    <div class="toggle-btn ${view === 'stunden' ? 'active' : ''}" onclick="go('plan', {view:'stunden'})">Stundenplan</div>
  </div>`;
}

function renderTimetable(container) {
  const u = untisData();
  const days = [...new Set(u.timetable.map(l => l.date))].filter(d => d >= todayStr()).slice(0, 10);
  if (!u.school || !days.length) {
    container.innerHTML = `${planTabs('stunden')}
      <div class="card center">
        <p style="margin:4px 0 6px;"><b>${u.school ? 'Noch kein Stundenplan abgerufen.' : 'Untis ist noch nicht verbunden.'}</b></p>
        <p class="note" style="margin-bottom:14px;">Der Stundenplan kommt aus Untis, mit Ausfall und Vertretung.</p>
        <button class="btn btn-primary" onclick="${u.school ? 'syncUntis()' : "go('untis')"}">${u.school ? 'Jetzt abrufen' : 'Untis verbinden'}</button>
      </div>`;
    return;
  }
  const day = days.includes(state.params.day) ? state.params.day : (untisDayToShow() && days.includes(untisDayToShow()) ? untisDayToShow() : days[0]);
  const hw = u.homework.filter(h => h.due === day && !h.done && !u.hwDone[h.id]);
  const exams = state.data.exams.filter(e => e.date === day);
  container.innerHTML = `${planTabs('stunden')}
    <div class="day-chips">${days.map(d => {
      const dt = new Date(d + 'T12:00:00');
      const cancel = u.timetable.some(l => l.date === d && l.cancelled);
      return `<button class="day-chip ${d === day ? 'active' : ''} ${cancel ? 'has-cancel' : ''}" onclick="go('plan', {view:'stunden', day:'${d}'})"><b>${WEEKDAYS[dt.getDay()]}</b><small>${dt.getDate()}.${dt.getMonth() + 1}.</small></button>`;
    }).join('')}</div>
    ${exams.map(e => `<div class="exam-banner soon" onclick="go('examPlan', {id:'${e.id}'})"><div style="flex:1;"><b>${esc(e.title)}</b><p class="note" style="margin:2px 0 0;">An diesem Tag</p></div><span class="chev">›</span></div>`).join('')}
    <div class="card tight"><p class="mini-label day-label">${dateLabel(day)}</p>${lessonRowsHtml(day)}</div>
    ${hw.length ? `<h3 class="group-title">Hausaufgaben bis dahin</h3><div class="card tight">${hw.map(h => `
      <div class="task-row">
        <button class="check-btn" onclick="toggleHomework('${esc(h.id)}')" aria-label="Erledigt"></button>
        <div class="task-text"><span>${esc(h.text)}</span><small>${esc(h.subject)}</small></div>
      </div>`).join('')}</div>` : ''}
    <p class="note center">Zuletzt abgerufen: ${u.lastSync ? new Date(u.lastSync).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'noch nie'}</p>`;
}

function renderPlan(container) {
  if (state.params.view === 'stunden') return renderTimetable(container);
  const today = todayStr();
  const pending = schoolPendingExams();
  const pendId = key => 'pend-' + btoa(unescape(encodeURIComponent(key))).replace(/[^a-z0-9]/gi, '');
  const upcoming = state.data.exams.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = state.data.exams.filter(e => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const todayTasks = upcoming.flatMap(e => (e.tasks || []).filter(t => t.date <= today && !t.done).map(t => ({ exam: e, task: t })));

  container.innerHTML = `
    ${planTabs('lern')}
    ${pending.length ? `
      <div class="card school-pending">
        <h3 class="card-title">Aus der Schule, noch nicht im Plan</h3>
        ${pending.map(i => `
          <div class="task-row">
            <div class="task-text"><span>${esc(i.text)}</span><small>${dateLabel(i.date)} · ${i.from}</small></div>
            <select id="${pendId(i.key)}"><option value="">Fach?</option>${getSubjects().map(s => `<option value="${s.id}" ${i.subject === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>
          </div>
          <div class="row-2" style="margin:2px 0 10px;">
            <button class="btn btn-outline btn-xs" style="width:100%;" onclick='ignoreSchoolExam(${jsArg(i.key)})'>Ignorieren</button>
            <button class="btn btn-primary btn-xs" style="width:100%;" onclick='takeSchoolExam(${jsArg(i.key)})'>Übernehmen</button>
          </div>`).join('')}
      </div>` : ''}
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
        <span>${task.time ? `<b class="task-time">${esc(task.time)}</b> ` : ''}${esc(task.label)}</span>
        <small>${esc(exam.title)}${task.minutes ? ` · ${task.minutes} Min` : ''}${task.date < todayStr() ? ' · überfällig' : ''}</small>
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
  } else if (r.type === 'note') {
    go('oneTopic', { key: r.id, examId: exam.id, taskId: task.id, back: [state.screen, { ...state.params }] });
  } else if (r.type === 'tutor') {
    // Ohne KI: selbst lernen und abhaken
    selfStudyTask(exam, task);
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
    Object.assign(exam, { subject: p.subject, title, date: p.date, sources, updatedAt: new Date().toISOString() });
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
  const ex = state.data.exams.find(e => e.id === id);
  // Aus Untis gelöschte Arbeiten nicht beim nächsten Abruf wieder anlegen
  if (ex?.untisId && state.data.untis) (state.data.untis.ignoredExams = state.data.untis.ignoredExams || []).push(ex.untisId);
  if (ex?.scpId) untisData().ignoredExams.push(ex.scpId);
  markDeleted(id);
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
      ${exam.note ? `<p class="note"><b>Info aus der Schule:</b> ${esc(exam.note)}</p>` : ''}
      ${results.length ? `<p class="note">Letzte Probearbeiten: ${results.map(r => `<b>${esc(r.gradeLabel)}</b>`).join(' · ')}</p>` : ''}
    </div>
    ${topicsCardHtml(exam)}
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

// ---------- Themen einer Arbeit ----------

function topicsCardHtml(exam) {
  ensureTopics(exam);
  const from = { ka: 'KI, aus der Klassenarbeits-Seite in OneNote', onenote: 'KI, aus den letzten OneNote-Themen', ki: 'von der KI geschätzt', 'ka-auto': 'aus der Klassenarbeits-Seite in OneNote', 'onenote-auto': 'aus deinen letzten OneNote-Themen' }[exam.topicsFrom] || 'aus deiner Auswahl';
  const total = exam.topics.reduce((s, t) => s + (t.minutes || 0), 0);
  return `
    <div class="card">
      <h3 class="card-title">Was drankommt</h3>
      <p class="note" style="margin-top:0;">${exam.topics.length} Themen, zusammen ca. ${total} Min Lernzeit · ${from}</p>
      ${exam.topics.map(t => `
        <div class="topic-edit">
          <div class="task-text"><span>${t.refs?.[0]?.type === 'note' ? `<a class="topic-link" onclick='go("oneTopic", {key: ${jsArg(t.refs[0].id)}, back: ["examPlan", {id: "${exam.id}"}]})'>${esc(t.title)}</a>` : esc(t.title)}</span>${t.summary ? `<small>${esc(t.summary)}</small>` : ''}</div>
          <select onchange="setTopicMinutes('${exam.id}', '${t.id}', Number(this.value))">${[10, 15, 20, 30, 45, 60, 90].map(v => `<option value="${v}" ${t.minutes === v ? 'selected' : ''}>${v} Min</option>`).join('')}</select>
          <button class="icon-btn small" onclick="removeTopic('${exam.id}', '${t.id}')" aria-label="Entfernen">${icon('close', 14)}</button>
        </div>`).join('') || '<p class="note">Noch keine Themen.</p>'}
      <div class="row-2" style="margin-top:12px;">
        <button class="btn btn-outline btn-sm" onclick="addTopic('${exam.id}')">${icon('plus', 14)} Thema</button>
        <button class="btn btn-primary btn-sm" onclick="findTopicsNow('${exam.id}')">${icon('search', 14)} Stoff suchen</button>
      </div>
    </div>`;
}

async function findTopicsNow(examId) {
  const exam = state.data.exams.find(e => e.id === examId);
  if (!exam) return;
  if (!hasAiKey()) {
    // Ohne KI: Themen direkt aus OneNote und dem ausgewählten Stoff
    if (setTopicsWithoutAi(exam)) { rebuildAllPlans(); saveData(); toast(`${exam.topics.length} Themen aus OneNote, Plan steht.`); }
    else toast('In OneNote gibt es zu dem Fach noch nichts. Füg Themen von Hand hinzu.');
    return render();
  }
  renderLoading('Stoff wird gesucht', 'OneNote, Untis und SCP werden durchgesehen.');
  await findTopicsWithAi(exam);
  go('examPlan', { id: examId });
}

// Von Hand geändert: nicht mehr automatisch aus OneNote überschreiben
function lockTopics(exam) {
  if (!exam.topicsFrom || exam.topicsFrom === 'auswahl' || exam.topicsFrom.endsWith('-auto')) exam.topicsFrom = 'manuell';
}

function setTopicMinutes(examId, topicId, minutes) {
  const exam = state.data.exams.find(e => e.id === examId);
  const t = exam?.topics?.find(x => x.id === topicId);
  if (!t) return;
  t.minutes = minutes;
  lockTopics(exam);
  touch(exam);
  rebuildAllPlans();
  saveData();
  render();
}

function removeTopic(examId, topicId) {
  const exam = state.data.exams.find(e => e.id === examId);
  if (!exam) return;
  exam.topics = exam.topics.filter(t => t.id !== topicId);
  lockTopics(exam);
  touch(exam);
  rebuildAllPlans();
  saveData();
  render();
}

function addTopic(examId) {
  const exam = state.data.exams.find(e => e.id === examId);
  const title = prompt('Welches Thema?');
  if (!exam || !title?.trim()) return;
  ensureTopics(exam);
  exam.topics.push({ id: 'm' + uid().slice(0, 6), title: title.trim().slice(0, 80), minutes: 30, how: 'Verstehen', refs: [], summary: '' });
  lockTopics(exam);
  touch(exam);
  rebuildAllPlans();
  saveData();
  render();
}
