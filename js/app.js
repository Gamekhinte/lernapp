// Startseite, Profil, Einstellungen, Login und der Router.

const SCREENS = {
  auth: renderAuth,
  home: renderHome,
  subjects: renderSubjects,
  subject: renderSubject,
  deckEdit: renderDeckEdit,
  deckSetup: renderDeckSetup,
  practice: renderPractice,
  summary: renderSummary,
  mathRun: renderMathRun,
  examSetup: renderExamSetup,
  exam: renderExam,
  tutor: renderTutor,
  plan: renderPlan,
  examEdit: renderExamEdit,
  examPlan: renderExamPlan,
  profile: renderProfile,
  history: renderHistory,
  onenote: renderOneNote,
  untis: renderUntis
};

function render() {
  const container = document.getElementById('app');
  if (!container) return;
  if (state.screen === 'loading') return;
  renderNav();
  renderHeader();
  try {
    (SCREENS[state.screen] || renderHome)(container);
    hydrateImages(container);
  } catch (err) {
    console.error('Render-Fehler:', err);
    container.innerHTML = `<div class="card"><p style="color:var(--red);">Da ist etwas schiefgelaufen.</p><p class="note">${esc(err.message)}</p><button class="btn btn-primary" style="margin-top:12px;" onclick="go('home')">Zur Startseite</button></div>`;
  }
  document.body.classList.toggle('focus-mode', FOCUS_SCREENS.includes(state.screen));
}

// ---------- Startseite ----------

function todayHeading() {
  return new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}

function renderHome(container) {
  const s = state.data.stats;
  const lvl = levelInfo();
  const streak = currentStreak();
  const today = todayStr();
  const learnedToday = !!s.daily[today];
  const due = allDueCards().length;
  const exams = state.data.exams.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const tasks = exams.flatMap(e => (e.tasks || []).filter(t => t.date <= today && !t.done).map(t => ({ exam: e, task: t })))
    .sort((a, b) => (a.task.date + (a.task.time || '')).localeCompare(b.task.date + (b.task.time || ''))).slice(0, 8);
  const isNew = !state.data.decks.length && !state.data.learningHistory.length;

  const onboarding = isNew ? `
    <div class="card">
      <h3 class="card-title">Erste Schritte</h3>
      <div class="onb ${hasAiKey() ? 'done' : ''}" onclick="setApiKey()"><span>1</span><div><b>Key eintragen</b><small>Gemini-Key, kostenlos. Braucht man für Fotos und Fragen.</small></div></div>
      <div class="onb" onclick="go('subjects')"><span>2</span><div><b>Stoff reinholen</b><small>Vokabelliste oder Buchseite fotografieren. Mathe ist schon drin.</small></div></div>
      <div class="onb" onclick="go('examEdit', {})"><span>3</span><div><b>Nächste Arbeit eintragen</b><small>Dann gibt es einen Plan bis dahin.</small></div></div>
    </div>` : '';

  container.innerHTML = `
    <div class="hello">
      <h2>${esc(todayHeading())}</h2>
      ${!learnedToday && streak ? `<p class="note">Heute noch nichts gelernt. Streak: ${streak} ${streak === 1 ? 'Tag' : 'Tage'}.</p>` : ''}
    </div>
    <div class="stat-row">
      <div class="stat-tile"><span class="big">${icon('flame', 17)} ${streak}</span><small>Streak</small></div>
      <div class="stat-tile" onclick="go('profile')"><span class="big">Lv ${lvl.level}</span><small>${esc(lvl.title)}</small></div>
      <div class="stat-tile"><span class="big">${s.xp}</span><small>XP gesamt</small></div>
    </div>
    ${xpBar()}
    ${oneNoteBanner()}
    ${onboarding}
    ${exams.slice(0, 2).map(examBanner).join('')}
    ${untisHomeCards()}
    ${tasks.length ? `<div class="card"><h3 class="card-title">Heute dran</h3>${tasks.map(({ exam, task }) => taskRow(exam, task)).join('')}</div>` : ''}
    ${due ? `<button class="btn btn-primary big-btn" onclick="startDueReview()">${icon('repeat')} ${due} Karte${due > 1 ? 'n' : ''} wiederholen</button>` : ''}
    <h3 class="group-title">Fächer</h3>
    <div class="tile-grid">
      ${getSubjects().map(sub => `
        <button class="subject-tile" style="--subject:${sub.color}" onclick="go('subject', {id:'${sub.id}'})">
          ${subjectBadge(sub, 'lg')}<span>${esc(sub.name)}</span>
          ${sub.kind !== 'mathe' && allDueCards(sub.id).length ? `<i class="tile-badge">${allDueCards(sub.id).length}</i>` : ''}
        </button>`).join('')}
    </div>
    <div class="quick-grid two" style="margin-top:14px;">
      <button class="btn btn-outline" onclick="go('examSetup', {})">${icon('pen')} Probearbeit</button>
      <button class="btn btn-outline" onclick="openTutor()">${icon('chat')} Frage stellen</button>
    </div>
  `;
}

// ---------- Profil und Einstellungen ----------

function renderProfile(container) {
  const s = state.data.stats;
  const lvl = levelInfo();
  const hist = state.data.learningHistory;
  const minutes = Math.round(hist.reduce((n, h) => n + (h.durationSeconds || 0), 0) / 60);
  const exams = state.data.examResults;
  const avg = exams.length ? (exams.reduce((n, r) => n + r.grade, 0) / exams.length).toFixed(1).replace('.', ',') : '–';
  const week = Array.from({ length: 7 }, (_, i) => todayStr(i - 6));
  const maxDay = Math.max(s.dailyGoal, ...week.map(d => s.daily[d] || 0));

  container.innerHTML = `
    <h2 class="page-title">Profil</h2>
    <div class="card center">
      <div class="level-badge">${lvl.level}</div>
      <h3 class="mono">${esc(lvl.title)}</h3>
      <div class="bar" style="margin:12px 0 6px;"><div style="width:${lvl.progress}%"></div></div>
      <p class="note">Noch ${lvl.toNext} XP bis Level ${lvl.level + 1}</p>
      <div class="stat-grid">
        <div><strong>${currentStreak()}</strong><small>Streak</small></div>
        <div><strong>${s.best || 0}</strong><small>Bester Streak</small></div>
        <div><strong>${s.xp}</strong><small>XP</small></div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">Diese Woche</h3>
      <div class="week-chart">
        ${week.map(d => {
          const v = s.daily[d] || 0;
          return `<div class="week-col"><div class="week-bar ${v >= s.dailyGoal ? 'goal' : ''}" style="height:${Math.max(4, Math.round(v / maxDay * 100))}%" title="${v} XP"></div><small>${WEEKDAYS[new Date(d + 'T12:00:00').getDay()]}</small></div>`;
        }).join('')}
      </div>
      <div class="stat-grid">
        <div><strong>${minutes}</strong><small>Minuten gelernt</small></div>
        <div><strong>${hist.length}</strong><small>Lernrunden</small></div>
        <div><strong>${avg}</strong><small>Ø Probearbeit</small></div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="go('history')">${icon('chart', 15)} Verlauf</button>
    </div>

    <div class="card">
      <h3 class="card-title">Abzeichen (${s.badges.length}/${BADGES.length})</h3>
      <div class="badge-grid">
        ${BADGES.map(b => `<div class="badge-item ${s.badges.includes(b.id) ? 'on' : ''}" title="${esc(b.desc)}"><span>${icon(b.icon, 22)}</span><small>${esc(b.name)}</small></div>`).join('')}
      </div>
    </div>

    ${studySettingsHtml()}

    <div class="card">
      <h3 class="card-title">Untis und SCP</h3>
      <p class="note" style="margin:0 0 10px;">${untisData().school ? `${esc(untisData().school.displayName)} · ${untisData().lastSync ? 'zuletzt ' + new Date(untisData().lastSync).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'noch nicht abgerufen'}` : 'Stundenplan, Ausfall, Hausaufgaben und Arbeiten aus WebUntis übernehmen.'}</p>
      <button class="btn btn-outline" onclick="go('untis')">${icon('calendar')} Schule verbinden</button>
    </div>

    <div class="card">
      <h3 class="card-title">OneNote</h3>
      <p class="note" style="margin:0 0 10px;">${state.data.onenote.lastScan ? `Zuletzt geprüft: ${new Date(state.data.onenote.lastScan).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })} · ${newOneNoteItems().length} neue Seiten` : 'Arbeitsblätter und Hefteinträge aus OneNote übernehmen.'}</p>
      <button class="btn btn-outline" onclick="go('onenote')">${icon('note')} OneNote</button>
      ${state.imgUpload?.left ? `<p class="note">${state.imgUpload.error ? `Bilder-Upload hängt (${esc(state.imgUpload.error)}), noch ${state.imgUpload.left} offen.` : `Bilder werden in die Cloud geladen, noch ${state.imgUpload.left}.`}</p>` : ''}
    </div>

    <div class="card">
      <h3 class="card-title">Einstellungen</h3>
      <label class="field-label">Tagesziel</label>
      <select onchange="state.data.stats.dailyGoal=Number(this.value); saveData(); render();">
        ${[[50, 'Locker (50 XP, ca. 5 Min)'], [100, 'Normal (100 XP, ca. 10 Min)'], [200, 'Ehrgeizig (200 XP, ca. 20 Min)'], [300, 'Hardcore (300 XP)']].map(([v, l]) => `<option value="${v}" ${s.dailyGoal === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select>

      <label class="field-label" style="margin-top:16px;">KI-Key</label>
      <button class="btn btn-outline" onclick="setApiKey()">${icon('key')} ${hasAiKey() ? PROVIDER_NAMES[state.provider] + ' (ändern)' : 'Key eintragen'}</button>

      <label class="field-label" style="margin-top:16px;">Design</label>
      <div class="theme-grid">
        ${Object.entries(THEMES).map(([id, t]) => `<button class="theme-option ${state.data.settings.theme === id ? 'active' : ''}" style="background:${t.paper}; color:${t.ink};" onclick="state.data.settings.theme='${id}'; applyTheme(); saveData(); render();"><i style="background:${t.button}"></i>${t.name}</button>`).join('')}
      </div>

      <label class="field-label" style="margin-top:16px;">Konto</label>
      ${state.authUser
        ? `<p class="note" style="margin:0 0 8px;">Angemeldet als ${esc(state.authUser.email)}.</p>${syncStatusHtml()}<button class="btn btn-outline" onclick="logout()">Abmelden</button>`
        : `<p class="note" style="margin:0 0 8px; color:var(--red);">Nicht angemeldet: Deine Daten bleiben nur auf diesem Gerät und kommen nicht auf andere Geräte.</p><button class="btn btn-outline" onclick="go('auth')">Anmelden / Konto erstellen</button>`}

      <label class="field-label" style="margin-top:16px;">Backup</label>
      <div class="row-2">
        <button class="btn btn-outline btn-sm" onclick="exportBackup()">${icon('download', 15)} Sichern</button>
        <input type="file" accept="application/json,.json" id="backupInput" hidden onchange="importBackup(event)">
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('backupInput').click()">${icon('upload', 15)} Laden</button>
      </div>
      <p class="note">Installieren: im Browser-Menü "Zum Startbildschirm hinzufügen".</p>
      <p class="note center" style="margin-top:14px;">made by Liam</p>
    </div>
  `;
}

function renderHistory(container) {
  const sessions = state.data.learningHistory;
  const kinds = { karten: 'Karten', quiz: 'Quiz', mathe: 'Mathe', probearbeit: 'Probearbeit' };
  container.innerHTML = `
    <div class="card">
      <div class="setup-header">${backBtn('profile')}<h3>Verlauf</h3><span></span></div>
      ${sessions.length ? sessions.map(h => {
        const date = new Date(h.finishedAt).toLocaleDateString('de-DE');
        const mins = Math.max(1, Math.round(h.durationSeconds / 60));
        const sub = h.subject ? getSubject(h.subject).name + ' · ' : '';
        return `<div class="history-item">
          <strong>${esc(h.deckName)}</strong>
          <p class="mono-muted">${esc(sub)}${kinds[h.kind] || 'Karten'} · ${date} · ${mins} min · ${h.correct} richtig, ${h.wrong} falsch${h.grade ? ' · Note ' + h.grade : ''}</p>
        </div>`;
      }).join('') : '<div class="empty">Noch keine Lernrunden.</div>'}
    </div>`;
}

// ---------- Login ----------

function renderAuth(container) {
  const register = state.authMode === 'register';
  container.innerHTML = `
    <div class="auth-hero">
      <img class="auth-logo" src="icons/icon-192.png" alt="">
      <h2>Liams Lernapp</h2>
      <p class="note">Vokabeln, Mathe und alle anderen Fächer. Mit Probearbeiten und Lernplan.</p>
    </div>
    <div class="card" style="max-width:460px; margin:0 auto;">
      <h3 class="card-title">${register ? 'Konto erstellen' : 'Anmelden'}</h3>
      <p class="note" style="margin:0 0 14px;">${register ? 'Damit sind die Daten auf allen Geräten gleich.' : 'Das Konto vom Voc-Trainer funktioniert hier auch, die Vokabeln sind dann schon da.'}</p>
      <label class="field-label">E-Mail</label>
      <input id="authEmail" type="email" autocomplete="email" placeholder="name@email.de">
      <label class="field-label" style="margin-top:10px;">Passwort</label>
      <input id="authPassword" type="password" autocomplete="${register ? 'new-password' : 'current-password'}" placeholder="Mindestens 6 Zeichen" onkeydown="if(event.key==='Enter' && state.authMode==='login') submitAuth()">
      ${register ? `<label class="field-label" style="margin-top:10px;">Passwort wiederholen</label><input id="authPasswordConfirm" type="password" autocomplete="new-password">` : ''}
      ${state.authMessage ? `<p class="auth-msg ${state.authMessageType === 'success' ? 'ok' : ''}">${esc(state.authMessage)}</p>` : ''}
      ${state.pendingEmail && !register ? `<button class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="resendConfirmation()">Mail nochmal schicken</button>` : ''}
      <button class="btn btn-primary" style="margin-top:16px;" onclick="submitAuth()">${register ? 'Registrieren' : 'Anmelden'}</button>
      <button class="btn btn-outline" style="margin-top:10px;" onclick="toggleAuthMode()">${register ? 'Schon ein Konto? Anmelden' : 'Neu hier? Konto erstellen'}</button>
      <button class="btn btn-outline" style="margin-top:10px;" onclick="startGuestMode()">Ohne Konto loslegen</button>
    </div>`;
}

function toggleAuthMode() {
  state.authMode = state.authMode === 'login' ? 'register' : 'login';
  state.authMessage = '';
  render();
}

function startGuestMode() {
  state.isGuest = true;
  localStorage.setItem('guest-mode', 'true');
  go('home');
}

async function logout() {
  if (!confirm('Abmelden? Deine Daten bleiben in der Cloud gespeichert.')) return;
  await supabaseClient?.auth.signOut();
  state.authUser = null;
  state.cloudReady = false;
  state.cloudBase = null;
  state.isGuest = false;
  localStorage.removeItem('guest-mode');
  state.authMode = 'login';
  state.authMessage = '';
  go('auth');
}

async function submitAuth() {
  if (!supabaseClient) {
    state.authMessage = 'Die Verbindung zum Server konnte nicht geladen werden.';
    return render();
  }
  const email = document.getElementById('authEmail')?.value.trim();
  state.pendingEmail = null;
  const password = document.getElementById('authPassword')?.value;
  const confirmation = document.getElementById('authPasswordConfirm')?.value;
  state.authMessageType = '';
  if (!email || !password) { state.authMessage = 'Bitte E-Mail und Passwort eingeben.'; return render(); }
  if (state.authMode === 'register' && password !== confirmation) { state.authMessage = 'Die Passwörter stimmen nicht überein.'; return render(); }
  if (state.authMode === 'register' && password.length < 6) { state.authMessage = 'Das Passwort muss mindestens 6 Zeichen haben.'; return render(); }

  const confirmPage = new URL(window.location.href);
  confirmPage.search = '?confirmed=1';
  const emailRedirectTo = /^https?:$/.test(location.protocol) ? confirmPage.toString() : undefined;
  const result = state.authMode === 'register'
    ? await supabaseClient.auth.signUp({ email, password, options: emailRedirectTo ? { emailRedirectTo } : undefined })
    : await supabaseClient.auth.signInWithPassword({ email, password });
  if (result.error) {
    const m = result.error.message || '';
    state.authMessage = /invalid login credentials/i.test(m)
      ? 'E-Mail oder Passwort stimmen nicht. Wenn du das Konto gerade erstellt hast, öffne zuerst den Link in der Bestätigungs-Mail.'
      : /email not confirmed/i.test(m) ? 'Deine E-Mail ist noch nicht bestätigt. Öffne den Link in deinem Postfach und melde dich dann an.' : m;
    return render();
  }
  if (!result.data.session) {
    state.authMode = 'login';
    state.pendingEmail = email;
    // Supabase meldet bei schon vorhandenen Konten Erfolg, schickt aber keine Mail (identities ist dann leer)
    if (result.data.user && Array.isArray(result.data.user.identities) && result.data.user.identities.length === 0) {
      state.authMessageType = '';
      state.authMessage = 'Mit dieser E-Mail gibt es schon ein Konto, zum Beispiel vom Voc-Trainer. Einfach hier mit dem alten Passwort anmelden.';
      state.pendingEmail = null;
    } else {
      state.authMessageType = 'success';
      state.authMessage = 'Bestätigungs-Mail ist unterwegs. Link öffnen, dann hier anmelden. Auch im Spam nachschauen.';
    }
    return render();
  }
  state.authUser = result.data.user;
  state.isGuest = false;
  localStorage.removeItem('guest-mode');
  await loadCloudData();
  uploadPendingImages();
  go('home');
}

async function resendConfirmation() {
  const email = state.pendingEmail;
  if (!email || !supabaseClient) return;
  const confirmPage = new URL(window.location.href);
  confirmPage.search = '?confirmed=1';
  const { error } = await supabaseClient.auth.resend({ type: 'signup', email, options: { emailRedirectTo: confirmPage.toString() } });
  state.authMessageType = error ? '' : 'success';
  state.authMessage = error
    ? (/rate|seconds/i.test(error.message) ? 'Gerade wurden zu viele Mails verschickt. In ein paar Minuten nochmal probieren.' : error.message)
    : 'Mail nochmal geschickt an ' + email + '.';
  render();
}

async function initAuth() {
  if (!supabaseClient) { if (state.screen === 'auth') startGuestMode(); return; }
  if (new URLSearchParams(location.search).get('confirmed') === '1') {
    state.authMode = 'login';
    state.authMessageType = 'success';
    state.authMessage = 'E-Mail bestätigt. Jetzt kannst du dich anmelden.';
    history.replaceState({}, document.title, location.pathname);
  }
  const { data } = await supabaseClient.auth.getSession();
  if (data.session?.user) {
    state.authUser = data.session.user;
    state.isGuest = false;
    await loadCloudData();
    uploadPendingImages();
    if (state.screen === 'auth') state.screen = 'home';
  } else if (state.isGuest && state.screen === 'auth') {
    state.screen = 'home';
  }
  render();
}

// ---------- Start ----------

loadLocalData();
applyTheme();
// Mit gespeicherter Sitzung direkt zur Startseite, ohne kurz den Login zu zeigen
const hasSession = !!localStorage.getItem('sb-jxkcxfmutaxmhifgbufv-auth-token');
state.screen = state.isGuest || hasSession ? 'home' : 'auth';
render();
// Erst Cloud-Stand holen, dann OneNote und Schule abrufen, sonst überschreiben sie sich gegenseitig
initAuth().then(async () => {
  rebuildAllPlans();
  saveData();
  await Promise.all([initUntis(), initOneNote()]);
  autoFindTopics();
  schedulePush();
});

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
