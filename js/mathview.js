// Mathe: Themenübersicht, Übungsrunden mit Tipp und Lösungsweg, Aufgaben aus Fotos per KI.

function renderMathSubject(container, subject) {
  const exam = nextExam('mathe');
  const groups = [...new Set(MATH_TOPICS.map(t => t.group))];
  const topicRows = groups.map(g => `
    <h3 class="group-title">${esc(g)}</h3>
    ${MATH_TOPICS.filter(t => t.group === g).map(t => {
      const p = state.data.mathProgress[t.id] || { correct: 0, total: 0 };
      const pct = p.total ? Math.round(p.correct / p.total * 100) : 0;
      return `
        <div class="topic-row" onclick="startMathRun({ topics: ['${t.id}'] })">
          <div style="flex:1; min-width:0;">
            <div class="topic-name">${esc(t.name)}</div>
            <div class="bar small"><div style="width:${pct}%; background:${pct >= 75 ? 'var(--green)' : pct >= 40 ? '#d89a2b' : 'var(--red)'}"></div></div>
          </div>
          <span class="mono-muted">${p.total ? `${p.correct}/${p.total}` : 'neu'}</span>
          <span class="chev">›</span>
        </div>`;
    }).join('')}`).join('');

  const sets = state.data.mathSets.map(s => `
    <div class="deck-card" onclick="startMathRun({ setId: '${s.id}' })">
      <div class="deck-info" style="flex:1;"><h3>${esc(s.title)}</h3><p>${s.tasks.length} AUFGABEN · ${s.source === 'foto' ? 'AUS FOTO' : s.source === 'onenote' ? 'AUS ONENOTE' : 'PER KI'}</p></div>
      <div class="deck-actions" onclick="event.stopPropagation()">
        <button class="icon-btn" onclick="deleteMathSet('${s.id}')">🗑️</button>
      </div>
    </div>`).join('');

  container.innerHTML = `
    <div class="subject-head" style="--subject:${subject.color}">
      ${backBtn('subjects', {}, '← Fächer')}
      <h2>${subject.emoji} Mathe</h2>
      <span></span>
    </div>
    ${exam ? examBanner(exam) : ''}
    ${oneNoteBanner('mathe')}
    <div class="quick-grid">
      <button class="btn btn-primary" onclick="openMixModal()">🎲 Gemischt üben</button>
      <button class="btn btn-outline" onclick="go('examSetup', {subject:'mathe'})">📝 Probearbeit</button>
      <button class="btn btn-outline" onclick="openTutor('mathe')">💬 Nachhilfe</button>
    </div>
    <div class="card">
      <p class="note" style="margin-top:0;">Jede Aufgabe wird neu ausgewürfelt. Du bekommst Tipps und den kompletten Lösungsweg, auch ohne KI-Key.</p>
      ${topicRows}
    </div>
    <h3 class="group-title">Deine Aufgaben aus Fotos und KI</h3>
    ${sets || '<div class="empty">Fotografier ein Arbeitsblatt oder deine Hausaufgabe. Die KI löst alles mit Lösungsweg und macht dir ähnliche Übungsaufgaben.</div>'}
    <div class="action-grid">
      <input type="file" accept="image/*" id="mathScan" multiple hidden onchange="scanMath(event)">
      <button class="btn btn-primary" onclick="document.getElementById('mathScan').click()">📷 Arbeitsblatt fotografieren</button>
      <button class="btn btn-outline" onclick="openMathAiModal()">✨ Aufgaben per KI erstellen</button>
    </div>
  `;
}

function openMixModal() {
  const groups = [...new Set(MATH_TOPICS.map(t => t.group))];
  openModal(`
    <h3 class="modal-title">🎲 Gemischt üben</h3>
    <p class="note" style="margin-bottom:10px;">Wähle die Themen aus. Am besten genau das, was in der Arbeit drankommt.</p>
    <div class="check-list">
      ${groups.map(g => `<p class="mini-label" style="margin-top:8px;">${esc(g)}</p>` + MATH_TOPICS.filter(t => t.group === g).map(t => `
        <label class="check-row"><input type="checkbox" class="mixTopic" value="${t.id}" ${g === 'Lineare Gleichungssysteme' ? 'checked' : ''}> ${esc(t.name)}</label>`).join('')).join('')}
    </div>
    <label class="field-label" style="margin-top:12px;">Anzahl Aufgaben</label>
    <select id="mixCount"><option>5</option><option selected>10</option><option>15</option><option>20</option></select>
    <div class="row-2" style="margin-top:16px;">
      <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" onclick="startMix()">Starten</button>
    </div>
  `);
}

function startMix() {
  const topics = [...document.querySelectorAll('.mixTopic:checked')].map(i => i.value);
  if (!topics.length) return alert('Bitte mindestens ein Thema auswählen.');
  startMathRun({ topics, count: Number(document.getElementById('mixCount').value) });
}

function startMathRun({ topics = null, setId = null, count = 10 }) {
  let title, tasks = [], ref;
  if (setId) {
    const set = state.data.mathSets.find(s => s.id === setId);
    title = set.title;
    tasks = shuffle(set.tasks).map(t => taskFromAi(t, set.title));
    count = tasks.length;
    ref = { type: 'set', id: setId };
  } else {
    title = topics.length === 1 ? getMathTopic(topics[0]).name : 'Gemischte Aufgaben';
    ref = topics.length === 1 ? { type: 'topic', id: topics[0] } : { type: 'topic', id: null };
  }
  state.mathRun = {
    title, topics, setId, tasks, count, index: 0, correct: 0, wrong: 0, values: {},
    checked: false, ok: false, hint: 0, startedAt: Date.now(), ref, done: false
  };
  nextMathTask(true);
  go('mathRun');
}

function nextMathTask(first = false) {
  const run = state.mathRun;
  if (!first) run.index++;
  if (run.index >= run.count) { finishMathRun(); return; }
  if (!run.setId) run.tasks[run.index] = makeTask(pick(run.topics));
  run.values = {};
  run.checked = false;
  run.ok = false;
  run.hint = 0;
  run.revealed = false;
}

function renderTaskInputs(task, values, disabled, prefix = 'm') {
  if (task.choices) {
    return `<div class="choice-list">${task.choices.map((c, i) => {
      let cls = values.choice === i ? 'picked' : '';
      if (disabled) cls = i === task.answer ? 'right' : values.choice === i ? 'wrong' : 'dim';
      return `<button class="choice ${cls}" ${disabled ? 'disabled' : ''} onclick="setTaskChoice('${prefix}', ${i})">${esc(c)}</button>`;
    }).join('')}</div>`;
  }
  if (task.selfCheck) return '';
  return `<div class="answer-fields">${task.fields.map(f => `
    <label class="answer-field">
      <span>${f.label}</span>
      <input type="text" inputmode="decimal" autocomplete="off" id="${prefix}-${f.key}" value="${esc(values[f.key] || '')}" ${disabled ? 'disabled' : ''}
        oninput="taskValueChanged('${prefix}', '${f.key}', this.value)" onkeydown="if(event.key==='Enter') taskEnter('${prefix}')">
    </label>`).join('')}</div>`;
}

function taskValueChanged(prefix, key, value) {
  if (prefix === 'm') state.mathRun.values[key] = value;
  else state.exam.answers[state.exam.index][key] = value;
}

function setTaskChoice(prefix, i) {
  if (prefix === 'm') { state.mathRun.values.choice = i; checkMath(); }
  else { state.exam.answers[state.exam.index].choice = i; render(); }
}

function taskEnter(prefix) {
  if (prefix === 'm') checkMath();
  else examNext();
}

function stepsHtml(task, count = Infinity) {
  return `<ol class="solution-steps">${task.steps.slice(0, count).map(s => `<li>${s}</li>`).join('')}</ol>`;
}

function renderMathRun(container) {
  const run = state.mathRun;
  if (!run) return go('subject', { id: 'mathe' });
  if (run.done) return renderMathSummary(container);
  const task = run.tasks[run.index];
  const dots = Array.from({ length: run.count }, (_, i) => `<span class="${i < run.index ? (run.results?.[i] ? 'correct' : 'wrong') : i === run.index && run.checked ? (run.ok ? 'correct' : 'wrong') : ''}"></span>`).join('');

  let after = '';
  if (run.checked) {
    after = `
      <div class="feedback ${run.ok ? 'ok' : 'bad'}">${run.ok ? 'Richtig! 🎉' : `Noch nicht. Richtig ist: <b>${esc(answerText(task))}</b>`}</div>
      <details class="solution" ${run.ok ? '' : 'open'}><summary>📖 Lösungsweg</summary>${stepsHtml(task)}${task.plot ? plotSvg(task.plot) : ''}</details>
      <div class="row-2">
        <button class="btn btn-outline" onclick="explainMath()">🤖 Frag die KI</button>
        <button class="btn btn-primary" id="mathNext" onclick="nextMathTask(); render();">Weiter →</button>
      </div>`;
  } else if (task.selfCheck) {
    after = run.revealed ? `
      <div class="feedback">Lösung: <b>${esc(task.aiAnswer)}</b></div>
      ${stepsHtml(task)}
      <p class="note">Vergleiche mit deiner Rechnung im Heft:</p>
      <div class="row-2">
        <button class="btn btn-danger" onclick="selfCheckMath(false)">Hatte ich falsch</button>
        <button class="btn btn-success" onclick="selfCheckMath(true)">Hatte ich richtig</button>
      </div>` : `
      <p class="note">Rechne die Aufgabe im Heft und schau dann nach.</p>
      <button class="btn btn-primary" onclick="state.mathRun.revealed=true; render();">Lösung zeigen</button>`;
  } else {
    after = `
      ${run.hint ? `<div class="hint-box">💡 ${stepsHtml(task, run.hint)}</div>` : ''}
      <div class="row-2">
        <button class="btn btn-outline" ${run.hint >= task.steps.length - 1 ? 'disabled' : ''} onclick="state.mathRun.hint++; render();">💡 Tipp</button>
        ${task.choices ? '<span></span>' : `<button class="btn btn-primary" onclick="checkMath()">Prüfen</button>`}
      </div>`;
  }

  container.innerHTML = `
    <div class="practice-top">
      <button class="icon-btn" onclick="quitMathRun()">✕</button>
      <span class="mono-muted">${run.index + 1} / ${run.count} · ${run.correct} ✓</span>
    </div>
    <div class="progress-dashes">${dots}</div>
    <div class="card question-card math-card">
      <div class="mini-label">${esc(task.topicName)}</div>
      <div class="math-q">${task.q}</div>
      ${renderTaskInputs(task, run.values, run.checked, 'm')}
      ${after}
    </div>`;
  setTimeout(() => {
    if (run.checked) document.getElementById('mathNext')?.focus();
    else if (!task.choices && task.fields) document.getElementById('m-' + task.fields[0].key)?.focus();
  }, 30);
}

function checkMath() {
  const run = state.mathRun;
  const task = run.tasks[run.index];
  if (run.checked) return;
  if (task.choices && run.values.choice === undefined) return;
  if (task.fields && task.fields.some(f => !(run.values[f.key] || '').trim())) return toast('Bitte alle Felder ausfüllen.');
  scoreMath(checkTask(task, run.values));
}

function selfCheckMath(ok) {
  scoreMath(ok);
}

function scoreMath(ok) {
  const run = state.mathRun;
  const task = run.tasks[run.index];
  run.checked = true;
  run.ok = ok;
  run.results = run.results || [];
  run.results[run.index] = ok;
  if (ok) run.correct++; else run.wrong++;
  const key = task.topicId === 'ki' ? 'ki' : task.topicId;
  const p = state.data.mathProgress[key] || { correct: 0, total: 0 };
  p.total++;
  if (ok) p.correct++;
  p.last = todayStr();
  state.data.mathProgress[key] = p;
  // Mit Tipps gibt es etwas weniger XP
  addXp(ok ? Math.max(5, 15 - run.hint * 4) : 3);
  saveData();
  render();
}

function quitMathRun() {
  const run = state.mathRun;
  if (run.index > 0 && !confirm('Runde beenden?')) return;
  state.mathRun = null;
  go('subject', { id: 'mathe' });
}

function finishMathRun() {
  const run = state.mathRun;
  run.done = true;
  run.index = run.count - 1;
  recordSession({
    kind: 'mathe', subject: 'mathe', name: run.title, total: run.count, correct: run.correct, wrong: run.wrong,
    seconds: (Date.now() - run.startedAt) / 1000, ref: run.ref
  });
  render();
}

function renderMathSummary(container) {
  const run = state.mathRun;
  const pct = Math.round(run.correct / run.count * 100);
  container.innerHTML = `
    <div class="card center" style="padding:32px 20px;">
      <div style="font-size:46px;">${pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 40 ? '💪' : '🌱'}</div>
      <h2 class="mono">${run.correct} von ${run.count} richtig</h2>
      <p class="note">${esc(run.title)}</p>
      <div class="bar" style="margin:18px 0;"><div style="width:${pct}%"></div></div>
      ${pct < 70 ? '<p class="note" style="margin-bottom:14px;">Tipp: Schau dir die Lösungswege nochmal an und mach direkt noch eine Runde. Wiederholung macht den Unterschied.</p>' : ''}
      <button class="btn btn-primary" style="margin-bottom:12px;" onclick="startMathRun({ topics: state.mathRun.topics, setId: state.mathRun.setId, count: state.mathRun.count })">🔁 Noch eine Runde</button>
      <button class="btn btn-outline" onclick="state.mathRun=null; go('subject', {id:'mathe'})">Zurück zu Mathe</button>
    </div>`;
}

function explainMath() {
  const run = state.mathRun;
  const task = run.tasks[run.index];
  const typed = task.choices ? task.choices[run.values.choice] : task.fields ? task.fields.map(f => `${f.label.replace(/<[^>]+>/g, '')} ${run.values[f.key] || '?'}`).join(', ') : '';
  const text = `Ich übe gerade Mathe (${task.topicName}). Aufgabe:\n${htmlToText(task.q)}\nMeine Antwort: ${typed || '(keine)'}\nRichtige Lösung: ${task.aiAnswer || answerText(task)}\nLösungsweg aus der App:\n${task.steps.map((s, i) => `${i + 1}. ${htmlToText(s)}`).join('\n')}\n${run.ok ? 'Erklär mir bitte, warum man das so rechnet.' : 'Erklär mir bitte, wo mein Fehler liegen könnte und wie man so eine Aufgabe sicher löst.'}`;
  explainWithTutor(text, 'mathe', ['mathRun', {}]);
}

function htmlToText(html) {
  const div = document.createElement('div');
  div.innerHTML = String(html).replace(/<sup>(.*?)<\/sup>/g, '^$1').replace(/<br\s*\/?>/g, '\n').replace(/<\/div>/g, '\n');
  return div.textContent.replace(/\n{2,}/g, '\n').trim();
}

// ---------- Aufgaben per KI ----------

const MATH_TASK_FORMAT = `Für jede Aufgabe: "question" (vollständiger Aufgabentext, der alleine verständlich ist), "answer" (nur das Endergebnis, kurz, z. B. "x = 2; y = 3" oder "12,5"), "answerType" ("number", wenn das Ergebnis aus 1 bis 3 Zahlen besteht, sonst "text"), "steps" (Lösungsweg als Liste kurzer Schritte). Rechne jede Aufgabe sorgfältig und prüfe das Ergebnis mit einer Probe.
JSON: {"title":"kurzer Titel","tasks":[{"question":"...","answer":"...","answerType":"number","steps":["...","..."]}]}`;

function cleanMathTasks(list) {
  return (Array.isArray(list) ? list : []).filter(t => t && t.question)
    .map(t => ({ question: String(t.question), answer: String(t.answer ?? ''), answerType: t.answerType === 'text' ? 'text' : 'number', steps: (t.steps || []).map(String) }));
}

async function scanMath(e) {
  const files = Array.from(e.target.files || []);
  e.target.value = '';
  if (!files.length || !requireAi()) return;
  const tasks = [];
  let title = '', error = '';
  for (let i = 0; i < files.length; i++) {
    renderLoading(`Foto ${i + 1} von ${files.length}: Die KI rechnet`);
    try {
      const img = await compressImage(files[i], 1600);
      const res = await aiAsk(`${SCHOOL_CONTEXT} Das Foto zeigt Mathe-Aufgaben (Arbeitsblatt, Buch oder Heft). Übernimm jede erkennbare Aufgabe, bei Teilaufgaben a), b), c) jede einzeln, und löse sie Schritt für Schritt. Erzeuge danach 3 ähnliche neue Übungsaufgaben mit anderen Zahlen. ${MATH_TASK_FORMAT}`, [img]);
      tasks.push(...cleanMathTasks(res.tasks));
      if (!title && res.title) title = String(res.title);
    } catch (err) {
      error = err.message;
    }
  }
  unlockBadge('scan');
  if (!tasks.length) {
    alert(error ? 'Das hat nicht geklappt: ' + error : 'Auf dem Foto wurden keine Aufgaben gefunden.');
    return go('subject', { id: 'mathe' });
  }
  saveMathSet(title || 'Aufgaben vom Foto', tasks, 'foto');
}

function openMathAiModal() {
  if (!requireAi()) return;
  openModal(`
    <h3 class="modal-title">✨ Aufgaben per KI</h3>
    <p class="note" style="margin-bottom:10px;">Welche Aufgaben brauchst du? Je genauer, desto besser.</p>
    <textarea id="mathAiTopic" rows="3" placeholder="z. B. Textaufgaben zu linearen Gleichungssystemen wie in der Klassenarbeit"></textarea>
    <label class="field-label" style="margin-top:12px;">Anzahl</label>
    <select id="mathAiCount"><option>5</option><option selected>8</option><option>12</option></select>
    <div class="row-2" style="margin-top:16px;">
      <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" onclick="createMathAi()">Erstellen</button>
    </div>
  `);
}

async function createMathAi() {
  const topic = document.getElementById('mathAiTopic').value.trim();
  const count = document.getElementById('mathAiCount').value;
  if (!topic) return;
  closeModal();
  renderLoading('Die KI erstellt deine Aufgaben');
  try {
    const res = await aiAsk(`${SCHOOL_CONTEXT} Erstelle ${count} Mathe-Übungsaufgaben zum Thema: "${topic}". Steigere den Schwierigkeitsgrad leicht. ${MATH_TASK_FORMAT}`);
    const tasks = cleanMathTasks(res.tasks);
    if (!tasks.length) throw new Error('Keine Aufgaben erhalten.');
    saveMathSet(res.title || topic, tasks, 'ki');
  } catch (err) {
    alert('Das hat nicht geklappt: ' + err.message);
    go('subject', { id: 'mathe' });
  }
}

function saveMathSet(title, tasks, source) {
  const set = { id: uid(), title, tasks, source, createdAt: new Date().toISOString() };
  state.data.mathSets.unshift(set);
  saveData();
  toast(`${tasks.length} Aufgaben gespeichert.`);
  startMathRun({ setId: set.id });
}

function deleteMathSet(id) {
  if (!confirm('Aufgaben löschen?')) return;
  state.data.mathSets = state.data.mathSets.filter(s => s.id !== id);
  saveData();
  render();
}
