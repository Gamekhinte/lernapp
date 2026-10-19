// Probearbeit: Aufgaben mischen, mit Timer schreiben, auswerten und benoten.

function gradeFor(pct) {
  const bands = [[92, 100, 1], [81, 92, 2], [67, 81, 3], [50, 67, 4], [30, 50, 5], [0, 30, 6]];
  const [lo, hi, grade] = bands.find(([lo]) => pct >= lo);
  if (grade === 6) return { grade, label: '6' };
  const third = (pos => pos > 2 / 3 ? '+' : pos < 1 / 3 ? '−' : '')((pct - lo) / (hi - lo || 1));
  if (grade === 1 && third === '−') return { grade, label: '1−' };
  return { grade, label: grade + third };
}

// ---------- Vorbereitung ----------

function renderExamSetup(container) {
  const p = state.params;
  const subjects = getSubjects();
  if (!p.subject) p.subject = subjects[0].id;
  const subject = getSubject(p.subject);
  if (!p.srcs || p.srcsFor !== p.subject) {
    p.srcsFor = p.subject;
    const exam = p.examId ? state.data.exams.find(e => e.id === p.examId) : null;
    if (exam?.sources?.length) p.srcs = exam.sources.map(s => s.type + ':' + s.id);
    else if (subject.kind === 'mathe') p.srcs = MATH_TOPICS.filter(t => t.group === 'Lineare Gleichungssysteme').map(t => 'topic:' + t.id);
    else p.srcs = state.data.decks.filter(d => d.subject === p.subject).map(d => 'deck:' + d.id);
  }
  if (!p.count) p.count = 12;
  if (p.minutes === undefined) p.minutes = 30;
  if (p.open === undefined) p.open = hasAiKey() && subject.kind !== 'mathe';

  const checked = id => p.srcs.includes(id) ? 'checked' : '';
  let sources;
  if (subject.kind === 'mathe') {
    const groups = [...new Set(MATH_TOPICS.map(t => t.group))];
    sources = groups.map(g => `<p class="mini-label" style="margin-top:8px;">${esc(g)}</p>` + MATH_TOPICS.filter(t => t.group === g).map(t =>
      `<label class="check-row"><input type="checkbox" ${checked('topic:' + t.id)} onchange="toggleExamSrc('topic:${t.id}', this.checked)"> ${esc(t.name)}</label>`).join('')).join('')
      + (state.data.mathSets.length ? `<p class="mini-label" style="margin-top:8px;">Deine Aufgaben</p>` + state.data.mathSets.map(s =>
      `<label class="check-row"><input type="checkbox" ${checked('set:' + s.id)} onchange="toggleExamSrc('set:${s.id}', this.checked)"> ${esc(s.title)}</label>`).join('') : '');
  } else {
    const decks = state.data.decks.filter(d => d.subject === p.subject);
    sources = decks.length ? decks.map(d =>
      `<label class="check-row"><input type="checkbox" ${checked('deck:' + d.id)} onchange="toggleExamSrc('deck:${d.id}', this.checked)"> ${esc(d.name)} <span class="mono-muted">(${d.cards.length})</span></label>`).join('')
      : `<div class="empty">In ${esc(subject.name)} gibt es noch keine Karteien. Scanne zuerst deinen Stoff, dann kann die App daraus eine Probearbeit machen.</div>`;
  }

  container.innerHTML = `
    <div class="card">
      <div class="setup-header">
        ${backBtn(p.examId ? 'examPlan' : 'subject', p.examId ? { id: p.examId } : { id: p.subject })}
        <h3>📝 Probearbeit</h3>
        <span></span>
      </div>
      <p class="note" style="margin-bottom:14px;">Wie eine echte Arbeit: Aufgaben werden gemischt, die Lösungen siehst du erst nach dem Abgeben. Am Ende gibt es eine Note.</p>
      <label class="field-label">Fach</label>
      <select onchange="state.params.subject=this.value; render();">
        ${subjects.map(s => `<option value="${s.id}" ${s.id === p.subject ? 'selected' : ''}>${s.emoji} ${esc(s.name)}</option>`).join('')}
      </select>
      <label class="field-label" style="margin-top:14px;">Was kommt dran?</label>
      <div class="check-list">${sources}</div>
      <div class="row-2" style="margin-top:14px;">
        <div><label class="field-label">Aufgaben</label>
          <select onchange="state.params.count=Number(this.value)">${[6, 8, 12, 16, 20].map(n => `<option ${n === p.count ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        <div><label class="field-label">Zeit</label>
          <select onchange="state.params.minutes=Number(this.value)">${[[0, 'ohne'], [15, '15 Min'], [30, '30 Min'], [45, '45 Min'], [60, '60 Min'], [90, '90 Min']].map(([v, l]) => `<option value="${v}" ${v === p.minutes ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      </div>
      ${subject.kind !== 'mathe' ? `
        <label class="check-row" style="margin-top:14px;">
          <input type="checkbox" ${p.open ? 'checked' : ''} onchange="state.params.open=this.checked; if(this.checked && !hasAiKey()){ this.checked=false; state.params.open=false; setApiKey(); }">
          Offene Fragen mit KI-Korrektur (Erkläre, Beschreibe, Nenne …)
        </label>` : ''}
      <button class="btn btn-primary" style="margin-top:18px;" onclick="startExam()">▶ Probearbeit starten</button>
    </div>`;
}

function toggleExamSrc(id, on) {
  const p = state.params;
  p.srcs = p.srcs.filter(x => x !== id);
  if (on) p.srcs.push(id);
}

async function startExam() {
  const p = state.params;
  const subject = getSubject(p.subject);
  if (!p.srcs.length) return alert('Bitte wähle aus, was drankommen soll.');
  const items = [];

  if (subject.kind === 'mathe') {
    const sources = shuffle(p.srcs);
    for (let i = 0; i < p.count; i++) {
      const [type, id] = sources[i % sources.length].split(':');
      if (type === 'topic') {
        const task = makeTask(id);
        items.push({ type: 'math', task, points: task.choices ? 2 : 2 + (task.fields.length > 1 ? 1 : 0) });
      } else {
        const set = state.data.mathSets.find(s => s.id === id);
        const usable = (set?.tasks || []).map(t => taskFromAi(t, set.title)).filter(t => !t.selfCheck);
        if (usable.length) items.push({ type: 'math', task: pick(usable), points: 3 });
        else { const task = makeTask(pick(MATH_TOPICS).id); items.push({ type: 'math', task, points: 2 }); }
      }
    }
  } else {
    const decks = p.srcs.map(s => state.data.decks.find(d => 'deck:' + d.id === s)).filter(Boolean);
    const pool = [];
    decks.forEach(d => {
      d.cards.forEach(c => pool.push({ deck: d, card: c }));
      d.quiz.forEach(q => pool.push({ deck: d, quiz: q }));
    });
    if (!pool.length) return alert('In den gewählten Karteien sind keine Karten.');
    const openCount = p.open ? (p.count >= 12 ? 3 : 2) : 0;
    const closedCount = p.count - openCount;
    // Schwache Karten kommen bevorzugt dran
    const sorted = shuffle(pool).sort((a, b) => (b.card?.needsPractice ? 1 : 0) - (a.card?.needsPractice ? 1 : 0));
    sorted.slice(0, closedCount).forEach(({ deck, card, quiz }) => {
      if (quiz) {
        items.push({ type: 'mc', prompt: quiz.q, options: quiz.options, correct: quiz.correct, explain: quiz.explain, points: 1 });
      } else if (deck.type === 'vocab' && (Math.random() < 0.6 || deck.cards.length < 4)) {
        items.push({ type: 'write', prompt: card.translation, expected: card.term, lang: deck.sourceLang, points: 1, cardRef: [deck.id, card.id] });
      } else if (deck.cards.length >= 4) {
        const mc = buildMc({ kind: 'card', card, deckId: deck.id }, deck.type === 'vocab' ? 'target-source' : 'source-target');
        items.push({ type: 'mc', prompt: mc.prompt, options: mc.options, correct: mc.correct, points: 1, cardRef: [deck.id, card.id] });
      } else {
        items.push({ type: 'write', prompt: card.term, expected: card.translation, points: 1, cardRef: [deck.id, card.id] });
      }
    });
    if (p.open) {
      renderLoading('Die KI stellt offene Fragen zusammen', 'Gleich geht es los.');
      try {
        const material = decks.flatMap(d => d.cards.map(c => `${c.term}: ${c.translation}`)).slice(0, 80).join('\n');
        const res = await aiAsk(`${SCHOOL_CONTEXT} Fach: ${subject.name}. Erstelle ${openCount} offene Fragen wie in einer Klassenarbeit (Operatoren wie Nenne, Beschreibe, Erkläre, Begründe${subject.kind === 'sprache' ? ', oder kurze Schreibaufgaben in der Fremdsprache' : ''}), die sich auf diesen Lernstoff beziehen:\n${material}\nGib zu jeder Frage einen Erwartungshorizont (was in einer vollen Antwort stehen muss) und 4 Punkte.\nJSON: {"questions":[{"q":"...","expected":"...","points":4}]}`);
        (res.questions || []).slice(0, openCount).forEach(q => {
          if (q.q) items.push({ type: 'open', prompt: String(q.q), expected: String(q.expected || ''), points: Number(q.points) || 4 });
        });
      } catch (err) {
        toast('Offene Fragen konnten nicht erstellt werden. Es geht ohne weiter.');
      }
    }
  }

  const title = `Probearbeit ${subject.name}`;
  state.exam = {
    subject: subject.id, title, items, answers: items.map(() => ({})), index: 0, startedAt: Date.now(),
    endsAt: p.minutes ? Date.now() + p.minutes * 60000 : null, submitted: false, examId: p.examId || null
  };
  go('exam');
  startExamTimer();
}

let examTimer = null;
function startExamTimer() {
  clearInterval(examTimer);
  examTimer = setInterval(() => {
    const ex = state.exam;
    if (!ex || ex.submitted) return clearInterval(examTimer);
    const el = document.getElementById('examTimer');
    if (ex.endsAt) {
      const left = Math.max(0, Math.round((ex.endsAt - Date.now()) / 1000));
      if (el) {
        el.textContent = `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
        el.classList.toggle('urgent', left < 120);
      }
      if (left === 0) { clearInterval(examTimer); toast('Die Zeit ist um!'); submitExam(true); }
    } else if (el) {
      const used = Math.round((Date.now() - ex.startedAt) / 1000);
      el.textContent = `⏱ ${Math.floor(used / 60)}:${String(used % 60).padStart(2, '0')}`;
    }
  }, 1000);
}

// ---------- Schreiben ----------

function isAnswered(item, a) {
  if (item.type === 'math') return item.task.choices ? a.choice !== undefined : item.task.fields.some(f => (a[f.key] || '').trim());
  if (item.type === 'mc') return a.choice !== undefined;
  return !!(a.text || '').trim();
}

function renderExam(container) {
  const ex = state.exam;
  if (!ex) return go('home');
  if (ex.submitted) return renderExamResult(container);
  const item = ex.items[ex.index];
  const a = ex.answers[ex.index];
  let body;
  if (item.type === 'math') {
    body = `<div class="math-q">${item.task.q}</div>${renderTaskInputs(item.task, a, false, 'e')}`;
  } else if (item.type === 'mc') {
    body = `<div class="question-text">${esc(item.prompt)}</div>
      <div class="choice-list">${item.options.map((o, i) => `<button class="choice ${a.choice === i ? 'picked' : ''}" onclick="state.exam.answers[state.exam.index].choice=${i}; render();">${esc(o)}</button>`).join('')}</div>`;
  } else if (item.type === 'write') {
    body = `<div class="mini-label">${item.lang ? 'Übersetze auf ' + esc(getLangConfig(item.lang).name) : 'Erkläre kurz'}</div>
      <div class="question-text big">${esc(item.prompt)}</div>
      <input type="text" id="examText" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(a.text || '')}" oninput="state.exam.answers[state.exam.index].text=this.value" onkeydown="if(event.key==='Enter') examNext()">`;
  } else {
    body = `<div class="mini-label">Offene Frage · ${item.points} Punkte</div>
      <div class="question-text">${esc(item.prompt)}</div>
      <textarea id="examText" rows="7" placeholder="Deine Antwort in ganzen Sätzen" oninput="state.exam.answers[state.exam.index].text=this.value">${esc(a.text || '')}</textarea>`;
  }
  const dots = ex.items.map((it, i) => `<button class="q-dot ${i === ex.index ? 'current' : ''} ${isAnswered(it, ex.answers[i]) ? 'done' : ''}" onclick="state.exam.index=${i}; render();">${i + 1}</button>`).join('');
  container.innerHTML = `
    <div class="practice-top">
      <button class="icon-btn" onclick="quitExam()">✕</button>
      <span class="timer" id="examTimer">⏱ ${ex.endsAt ? Math.ceil((ex.endsAt - Date.now()) / 60000) + ':00' : '0:00'}</span>
      <button class="btn btn-primary btn-sm" style="width:auto;" onclick="submitExam()">Abgeben</button>
    </div>
    <div class="q-dots">${dots}</div>
    <div class="card question-card">
      <div class="exam-q-head"><span class="mini-label">Aufgabe ${ex.index + 1} von ${ex.items.length}</span><span class="mini-label">${item.points} P.</span></div>
      ${body}
    </div>
    <div class="row-2">
      <button class="btn btn-outline" ${ex.index === 0 ? 'disabled' : ''} onclick="state.exam.index--; render();">← Zurück</button>
      ${ex.index < ex.items.length - 1 ? `<button class="btn btn-primary" onclick="examNext()">Weiter →</button>` : `<button class="btn btn-success" onclick="submitExam()">✓ Abgeben</button>`}
    </div>`;
  setTimeout(() => {
    const first = item.type === 'math' && item.task.fields ? document.getElementById('e-' + item.task.fields[0].key) : document.getElementById('examText');
    first?.focus();
  }, 30);
}

function examNext() {
  const ex = state.exam;
  if (ex.index < ex.items.length - 1) { ex.index++; render(); }
}

function quitExam() {
  if (!confirm('Probearbeit abbrechen? Sie wird nicht gewertet.')) return;
  clearInterval(examTimer);
  const subject = state.exam.subject;
  state.exam = null;
  go('subject', { id: subject });
}

async function submitExam(timeUp = false) {
  const ex = state.exam;
  if (ex.submitted) return;
  const open = ex.items.filter((it, i) => !isAnswered(it, ex.answers[i])).length;
  if (!timeUp && open && !confirm(`${open} Aufgabe${open > 1 ? 'n sind' : ' ist'} noch leer. Trotzdem abgeben?`)) return;
  clearInterval(examTimer);
  ex.finishedAt = Date.now();

  ex.results = ex.items.map((item, i) => {
    const a = ex.answers[i];
    if (item.type === 'math') {
      if (item.task.choices) return { points: a.choice === item.task.answer ? item.points : 0 };
      const okFields = item.task.fields.filter(f => checkTask({ ...item.task, fields: [f] }, a)).length;
      return { points: Math.round(item.points * okFields / item.task.fields.length * 2) / 2 };
    }
    if (item.type === 'mc') return { points: a.choice === item.correct ? item.points : 0 };
    if (item.type === 'write') return { points: answerMatches(a.text, item.expected) ? item.points : 0 };
    return { points: 0, pending: true };
  });

  const openItems = ex.items.map((it, i) => ({ it, i })).filter(x => x.it.type === 'open');
  if (openItems.length) {
    const answered = openItems.filter(x => (ex.answers[x.i].text || '').trim());
    openItems.forEach(x => { ex.results[x.i] = { points: 0, feedback: 'Keine Antwort abgegeben.' }; });
    if (answered.length) {
      renderLoading('Die KI korrigiert deine offenen Antworten', 'Gleich siehst du deine Note.');
      try {
        const res = await aiAsk(`${SCHOOL_CONTEXT} Du bist eine faire, aber genaue Lehrkraft und korrigierst Antworten einer Probearbeit im Fach ${getSubject(ex.subject).name}. Vergib für jede Antwort Punkte (halbe Punkte erlaubt) anhand des Erwartungshorizonts und schreibe 1 bis 3 Sätze Feedback direkt an den Schüler: was gut war, was gefehlt hat.\n\n${answered.map((x, n) => `Antwort ${n + 1}\nFrage: ${x.it.prompt}\nErwartungshorizont: ${x.it.expected}\nMaximal: ${x.it.points} Punkte\nAntwort des Schülers: ${ex.answers[x.i].text}`).join('\n\n')}\n\nJSON: {"results":[{"points":2.5,"feedback":"..."}]} in derselben Reihenfolge.`);
        (res.results || []).forEach((r, n) => {
          const x = answered[n];
          if (!x) return;
          ex.results[x.i] = { points: Math.max(0, Math.min(x.it.points, Number(r.points) || 0)), feedback: String(r.feedback || '') };
        });
      } catch (err) {
        answered.forEach(x => { ex.results[x.i] = { points: 0, feedback: 'Die KI-Korrektur hat nicht geklappt: ' + err.message + ' Vergleiche selbst mit dem Erwartungshorizont.' }; });
      }
    }
  }

  // Karten aus der Arbeit in den Lernkasten übernehmen
  ex.items.forEach((item, i) => {
    if (item.cardRef) updateCard(item.cardRef[0], item.cardRef[1], ex.results[i].points >= item.points);
  });

  ex.points = ex.results.reduce((s, r) => s + r.points, 0);
  ex.max = ex.items.reduce((s, it) => s + it.points, 0);
  ex.pct = ex.max ? Math.round(ex.points / ex.max * 1000) / 10 : 0;
  const g = gradeFor(ex.pct);
  ex.grade = g.grade;
  ex.gradeLabel = g.label;
  ex.submitted = true;

  state.data.examResults.unshift({
    id: uid(), subject: ex.subject, title: ex.title, date: todayStr(), pct: ex.pct, grade: g.grade, gradeLabel: g.label, points: ex.points, max: ex.max
  });
  state.data.examResults = state.data.examResults.slice(0, 100);
  addXp(50 + ({ 1: 50, 2: 30, 3: 15 }[g.grade] || 0));
  const correctCount = ex.results.filter((r, i) => r.points >= ex.items[i].points).length;
  recordSession({
    kind: 'probearbeit', subject: ex.subject, name: ex.title, total: ex.items.length, correct: correctCount,
    wrong: ex.items.length - correctCount, seconds: (ex.finishedAt - ex.startedAt) / 1000, grade: g.grade, ref: { type: 'exam' }
  });
  state.screen = 'exam';
  render();
}

// ---------- Auswertung ----------

function renderExamResult(container) {
  const ex = state.exam;
  const minutes = Math.max(1, Math.round((ex.finishedAt - ex.startedAt) / 60000));
  const msg = { 1: 'Sehr gut! Du bist bereit. 🏆', 2: 'Gut! Nur noch Kleinigkeiten. 🎉', 3: 'Befriedigend. Schau dir die Fehler an. 💪', 4: 'Ausreichend. Da geht noch was, üb die falschen Aufgaben.', 5: 'Mangelhaft. Kein Stress: Genau dafür ist die Probe da.', 6: 'Ungenügend. Fang mit den Grundlagen an, dann wird das.' }[ex.grade];

  const list = ex.items.map((item, i) => {
    const r = ex.results[i];
    const a = ex.answers[i];
    const full = r.points >= item.points;
    const icon = full ? '✓' : r.points > 0 ? '◐' : '✕';
    let your = '', right = '', extra = '';
    if (item.type === 'math') {
      your = item.task.choices ? (item.task.choices[a.choice] ?? '–') : item.task.fields.map(f => `${f.label.replace(/<[^>]+>/g, '')} ${a[f.key] || '–'}`).join(', ');
      right = answerText(item.task);
      extra = `<details class="solution"><summary>📖 Lösungsweg</summary>${stepsHtml(item.task)}${item.task.plot ? plotSvg(item.task.plot) : ''}</details>`;
    } else if (item.type === 'mc') {
      your = item.options[a.choice] ?? '–';
      right = item.options[item.correct];
      if (item.explain) extra = `<p class="note">${esc(item.explain)}</p>`;
    } else if (item.type === 'write') {
      your = a.text || '–';
      right = item.expected;
    } else {
      your = a.text || '–';
      extra = `${r.feedback ? `<div class="feedback">${esc(r.feedback)}</div>` : ''}<details class="solution"><summary>Erwartungshorizont</summary><p>${esc(item.expected)}</p></details>`;
    }
    const q = item.type === 'math' ? item.task.q : esc(item.prompt);
    return `
      <div class="result-item ${full ? 'ok' : r.points > 0 ? 'half' : 'bad'}">
        <div class="result-head"><span class="result-icon">${icon}</span><span class="mini-label">Aufgabe ${i + 1}</span><span class="mono-muted">${fmtN(r.points)} / ${item.points} P.</span></div>
        <div class="result-q">${q}</div>
        <p class="result-a"><b>Deine Antwort:</b> ${esc(your)}</p>
        ${right && !full ? `<p class="result-a"><b>Richtig:</b> ${esc(right)}</p>` : ''}
        ${extra}
        ${!full ? `<button class="btn btn-outline btn-xs" onclick="explainExamItem(${i})">🤖 Erklär mir das</button>` : ''}
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="card center grade-card">
      <div class="mini-label">${esc(ex.title)}</div>
      <div class="grade-big grade-${ex.grade}">${ex.gradeLabel}</div>
      <p class="mono">${fmtN(ex.points)} von ${ex.max} Punkten · ${fmtN(ex.pct)} %</p>
      <p class="note">${minutes} Minute${minutes === 1 ? '' : 'n'} · ${msg}</p>
    </div>
    <h3 class="group-title">Deine Aufgaben</h3>
    ${list}
    <div class="action-grid">
      <button class="btn btn-primary" onclick="redoExam()">🔁 Neue Probearbeit</button>
      <button class="btn btn-outline" onclick="leaveExam()">Fertig</button>
    </div>
    <p class="note center">Hinweis: Notenschlüssel 92 / 81 / 67 / 50 / 30 %. Deine Lehrkraft nutzt vielleicht einen anderen.</p>`;
}

function explainExamItem(i) {
  const ex = state.exam;
  const item = ex.items[i];
  const a = ex.answers[i];
  let text;
  if (item.type === 'math') {
    const your = item.task.choices ? item.task.choices[a.choice] : item.task.fields.map(f => `${htmlToText(f.label)} ${a[f.key] || '?'}`).join(', ');
    text = `In meiner Probearbeit (Mathe) hatte ich diese Aufgabe falsch:\n${htmlToText(item.task.q)}\nMeine Antwort: ${your || '(leer)'}\nRichtig: ${answerText(item.task)}\nLösungsweg:\n${item.task.steps.map((s, n) => `${n + 1}. ${htmlToText(s)}`).join('\n')}\nErklär mir bitte, wo mein Fehler liegt und wie ich so eine Aufgabe sicher löse.`;
  } else if (item.type === 'open') {
    text = `In meiner Probearbeit (${getSubject(ex.subject).name}) war diese offene Frage:\n"${item.prompt}"\nMeine Antwort: ${a.text || '(leer)'}\nErwartungshorizont: ${item.expected}\nZeig mir bitte, wie eine volle Antwort aussehen würde und was mir gefehlt hat.`;
  } else {
    const right = item.type === 'mc' ? item.options[item.correct] : item.expected;
    const your = item.type === 'mc' ? item.options[a.choice] : a.text;
    text = `In meiner Probearbeit (${getSubject(ex.subject).name}) hatte ich das falsch:\nAufgabe: "${item.prompt}"\nMeine Antwort: ${your || '(leer)'}\nRichtig: ${right}\nErklär mir das bitte kurz mit einer Eselsbrücke.`;
  }
  explainWithTutor(text, ex.subject, ['exam', {}]);
}

function redoExam() {
  const ex = state.exam;
  state.exam = null;
  go('examSetup', { subject: ex.subject, examId: ex.examId || undefined });
}

function leaveExam() {
  const ex = state.exam;
  state.exam = null;
  if (ex.examId) go('examPlan', { id: ex.examId });
  else go('subject', { id: ex.subject });
}
