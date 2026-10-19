// XP, Level, Streak, Abzeichen und das Protokoll aller Lernrunden.

const LEVEL_TITLES = ['Neuling', 'Anfänger', 'Lernender', 'Fleißig', 'Wissbegierig', 'Kluger Kopf', 'Ass', 'Streber', 'Profi', 'Experte', 'Meister', 'Genie', 'Legende'];

const BADGES = [
  { id: 'first',    icon: 'check', name: 'Erste Runde',      desc: 'Die erste Lernrunde geschafft' },
  { id: 'streak3',  icon: 'flame', name: '3 Tage am Stück',  desc: 'Drei Tage in Folge gelernt' },
  { id: 'streak7',  icon: 'flame', name: 'Wochen-Streak',    desc: 'Sieben Tage in Folge gelernt' },
  { id: 'streak30', icon: 'flame', name: 'Monats-Streak',    desc: '30 Tage in Folge gelernt' },
  { id: 'goal',     icon: 'target', name: 'Tagesziel',        desc: 'Das Tagesziel erreicht' },
  { id: 'xp1000',   icon: 'bolt', name: '1000 XP',          desc: '1000 XP gesammelt' },
  { id: 'exam',     icon: 'pen', name: 'Probearbeit',      desc: 'Die erste Probearbeit geschrieben' },
  { id: 'grade1',   icon: 'medal', name: 'Glatte Eins',      desc: 'Eine Probearbeit mit Note 1' },
  { id: 'math50',   icon: 'dice', name: 'Rechenkünstler',   desc: '50 Matheaufgaben richtig' },
  { id: 'cards100', icon: 'layers', name: 'Gedächtnis',       desc: '100 Karten sicher gelernt' },
  { id: 'scan',     icon: 'camera', name: 'Scanner',          desc: 'Zum ersten Mal ein Foto gescannt' },
  { id: 'tutor',    icon: 'chat', name: 'Neugierig',        desc: 'Zum ersten Mal eine Frage gestellt' }
];

function levelInfo(xp = state.data.stats.xp) {
  const level = Math.floor(Math.sqrt(xp / 40)) + 1;
  const from = 40 * (level - 1) ** 2, to = 40 * level ** 2;
  return {
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    progress: Math.round((xp - from) / (to - from) * 100),
    toNext: to - xp
  };
}

function currentStreak() {
  const daily = state.data.stats.daily || {};
  let streak = 0;
  // Heute zählt mit, wenn schon gelernt. Sonst ab gestern zählen, damit der Streak morgens nicht 0 zeigt.
  let offset = daily[todayStr()] ? 0 : -1;
  while (daily[todayStr(offset)]) { streak++; offset--; }
  return streak;
}

function addXp(amount) {
  const s = state.data.stats;
  const today = todayStr();
  const before = s.daily[today] || 0;
  const oldLevel = levelInfo(s.xp).level;
  s.xp += amount;
  s.daily[today] = before + amount;
  if (before < s.dailyGoal && s.daily[today] >= s.dailyGoal) {
    toast('Tagesziel erreicht.');
    unlockBadge('goal');
  }
  const lvl = levelInfo(s.xp);
  if (lvl.level > oldLevel) setTimeout(() => toast(`Level ${lvl.level}: ${lvl.title}`), 900);
  const streak = currentStreak();
  s.streak = streak;
  s.best = Math.max(s.best || 0, streak);
  // Alte Tage aufräumen, damit die Daten klein bleiben
  const keys = Object.keys(s.daily).sort();
  if (keys.length > 120) keys.slice(0, keys.length - 120).forEach(k => delete s.daily[k]);
  renderHeader();
}

function unlockBadge(id) {
  const s = state.data.stats;
  if (s.badges.includes(id)) return;
  s.badges.push(id);
  const b = BADGES.find(x => x.id === id);
  if (b) setTimeout(() => toast(`Neues Abzeichen: ${b.name}`), 1400);
}

function checkBadges() {
  const s = state.data.stats;
  const streak = currentStreak();
  if (state.data.learningHistory.length) unlockBadge('first');
  if (streak >= 3) unlockBadge('streak3');
  if (streak >= 7) unlockBadge('streak7');
  if (streak >= 30) unlockBadge('streak30');
  if (s.xp >= 1000) unlockBadge('xp1000');
  if (state.data.examResults.length) unlockBadge('exam');
  if (state.data.examResults.some(r => r.grade === 1)) unlockBadge('grade1');
  const mathCorrect = Object.values(state.data.mathProgress).reduce((sum, p) => sum + (p.correct || 0), 0);
  if (mathCorrect >= 50) unlockBadge('math50');
  const mastered = state.data.decks.reduce((sum, d) => sum + d.cards.filter(c => (c.box || 0) >= 3).length, 0);
  if (mastered >= 100) unlockBadge('cards100');
}

// Eine fertige Lernrunde eintragen. ref verknüpft sie mit Aufgaben im Lernplan.
function recordSession({ kind, subject, name, total, correct, wrong, seconds, grade = null, ref = null }) {
  state.data.learningHistory.unshift({
    finishedAt: new Date().toISOString(),
    deckName: name,
    subject,
    kind,
    total,
    correct,
    wrong,
    durationSeconds: Math.max(1, Math.round(seconds)),
    grade
  });
  state.data.learningHistory = state.data.learningHistory.slice(0, 200);
  addXp(20);
  if (ref) markPlanDone(ref, subject);
  checkBadges();
  saveData();
}

// Hakt passende Aufgaben im Lernplan ab (heute oder überfällig)
function markPlanDone(ref, subject) {
  const today = todayStr();
  let count = 0;
  state.data.exams.forEach(exam => {
    if (exam.date < today) return;
    (exam.tasks || []).forEach(task => {
      if (task.done || task.date > today || !task.ref) return;
      const r = task.ref;
      const hit =
        (r.type === ref.type && r.id && r.id === ref.id) ||
        (r.type === 'exam' && ref.type === 'exam' && exam.subject === subject) ||
        (r.type === 'review' && ref.type === 'review' && (!r.subject || !subject || r.subject === subject)) ||
        (r.type === 'review' && ref.type === 'deck' && exam.subject === subject) ||
        (r.type === 'mix' && (ref.type === 'topic' || ref.type === 'set') && exam.subject === subject);
      if (hit) { task.done = true; count++; }
    });
  });
  if (count) setTimeout(() => toast(`Lernplan: ${count} Aufgabe${count > 1 ? 'n' : ''} abgehakt`), 500);
}

function xpBar(compact = false) {
  const s = state.data.stats;
  const today = s.daily[todayStr()] || 0;
  const pct = Math.min(100, Math.round(today / s.dailyGoal * 100));
  return `
    <div class="xp-box ${compact ? 'compact' : ''}">
      <div class="xp-row"><span>Tagesziel</span><span>${today} / ${s.dailyGoal} XP</span></div>
      <div class="bar"><div style="width:${pct}%"></div></div>
    </div>`;
}
