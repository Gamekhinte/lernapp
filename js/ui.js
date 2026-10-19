// UI-Helfer: Navigation, Modale, Hinweise, Ladebildschirm mit Snake, Bild-Komprimierung.

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Text sicher in ein onclick-Attribut packen
function jsArg(str) {
  return esc(JSON.stringify(String(str ?? '')));
}

function applyTheme() {
  const theme = THEMES[state.data?.settings?.theme] || THEMES.classic;
  const root = document.documentElement.style;
  root.setProperty('--paper', theme.paper);
  root.setProperty('--paper-card', theme.card);
  root.setProperty('--ink', theme.ink);
  root.setProperty('--ink-muted', theme.muted);
  root.setProperty('--rule', theme.rule);
  root.setProperty('--accent', theme.button);
  root.setProperty('--button', theme.button);
  root.setProperty('--button-text', getContrastColor(theme.button));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.paper);
}

function getContrastColor(hex) {
  const value = (hex || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) return '#ffffff';
  const [r, g, b] = [0, 2, 4].map(i => parseInt(value.slice(i, i + 2), 16));
  return (r * 0.299 + g * 0.587 + b * 0.114) > 160 ? '#1a1816' : '#ffffff';
}

function openModal(html) {
  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" role="dialog" aria-modal="true">${html}</div>
    </div>`;
  setTimeout(() => document.querySelector('.modal input:not([type=checkbox]), .modal textarea')?.focus(), 50);
}

function closeModal(e) {
  if (!e || e.target.classList.contains('modal-overlay')) {
    document.getElementById('modalContainer').innerHTML = '';
  }
}

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

// ---------- Navigation ----------

const NAV = [
  { screen: 'home',     icon: 'home', label: 'Heute' },
  { screen: 'subjects', icon: 'books', label: 'Fächer' },
  { screen: 'plan',     icon: 'calendar', label: 'Plan' },
  { screen: 'tutor',    icon: 'chat', label: 'Fragen' },
  { screen: 'profile',  icon: 'user', label: 'Profil' }
];

// Bildschirme, in denen die Leiste unten stört
const FOCUS_SCREENS = ['auth', 'practice', 'mathRun', 'exam', 'loading'];

function go(screen, params = {}) {
  state.screen = screen;
  state.params = params;
  closeModal();
  render();
  window.scrollTo(0, 0);
}

function renderNav() {
  const nav = document.getElementById('bottomNav');
  if (!nav) return;
  if (FOCUS_SCREENS.includes(state.screen)) { nav.innerHTML = ''; nav.hidden = true; return; }
  nav.hidden = false;
  const active = {
    subject: 'subjects', deckEdit: 'subjects', deckSetup: 'subjects', summary: 'home', mathTopic: 'subjects',
    examSetup: 'home', examResult: 'home', onenote: 'home', untis: 'profile', examEdit: 'plan', examPlan: 'plan', history: 'profile'
  }[state.screen] || state.screen;
  nav.innerHTML = NAV.map(n => `
    <button class="nav-btn ${active === n.screen ? 'active' : ''}" onclick="go('${n.screen}')" aria-label="${n.label}">
      <span class="nav-icon">${icon(n.icon, 22)}</span><span class="nav-label">${n.label}</span>
    </button>`).join('');
}

function renderHeader() {
  const s = state.data?.stats;
  const chip = document.getElementById('streakChip');
  if (chip) {
    chip.hidden = !s || state.screen === 'auth';
    if (s) chip.innerHTML = `${icon('flame', 14)} ${currentStreak()} <span class="chip-sep"></span> ${s.daily[todayStr()] || 0} XP`;
  }
}

function backBtn(screen, params = {}, label = 'Zurück') {
  return `<button class="icon-btn" onclick='go(${JSON.stringify(screen)}, ${esc(JSON.stringify(params))})'>${icon('back', 16)} ${label}</button>`;
}

// ---------- Ladebildschirm ----------

function renderLoading(label, sub = 'Dauert bis zu einer Minute. Solange: Snake.') {
  state.screen = 'loading';
  renderNav();
  document.getElementById('app').innerHTML = `
    <div class="card" style="text-align:center; padding:34px 20px;">
      <span class="spinner"></span>
      <p style="margin-top:16px; font-family:'Space Mono',monospace; font-size:13px;">${esc(label)}</p>
      <p class="note">${esc(sub)}</p>
      <div class="snake-game">
        <canvas id="snakeCanvas" width="240" height="240" aria-label="Snake-Spiel"></canvas>
        <div class="snake-hud"><span id="snakeScore">SNAKE · 0</span><span>↔ WISCHEN</span></div>
      </div>
    </div>`;
  startSnakeGame();
}

// Mini-Markdown für KI-Antworten: fett, kursiv, Listen, Absätze
function mdToHtml(text) {
  const lines = esc(text || '').split('\n');
  let html = '', inList = false;
  lines.forEach(line => {
    const li = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)/);
    if (li) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inlineMd(li[1])}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (line.trim() === '') html += '<br>';
      else if (/^#{1,4}\s/.test(line)) html += `<p><b>${inlineMd(line.replace(/^#+\s/, ''))}</b></p>`;
      else html += `<p>${inlineMd(line)}</p>`;
    }
  });
  if (inList) html += '</ul>';
  return html.replace(/(<br>){2,}/g, '<br>');
}

function inlineMd(s) {
  return s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code>$1</code>');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeAnswer(text) {
  return (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '').trim().replace(/^(to|the|a|an|der|die|das|ein|eine)\s+/i, '').replace(/[^\p{L}\p{N}]/gu, '');
}

// Eine Antwort gilt auch, wenn sie einer von mehreren Varianten ("Haus, Gebäude") entspricht
function answerMatches(actual, expected) {
  const a = normalizeAnswer(actual);
  if (!a) return false;
  const variants = String(expected).split(/[,;/]| oder /).map(normalizeAnswer).filter(Boolean);
  if (normalizeAnswer(expected) === a) return true;
  return variants.some(v => v === a || (v.length > 5 && calculateSimilarity(v, a) >= 0.88));
}

function speakWord(text, langCode) {
  if (!text || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = getLangConfig(langCode).tts;
  window.speechSynthesis.speak(u);
}

let snakeTimer = null;
let snakeFrame = null;
let snake = null;
function startSnakeGame() {
  clearInterval(snakeTimer);
  cancelAnimationFrame(snakeFrame);
  snake = { body: [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }], previousBody: [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }], dx: 1, dy: 0, food: { x: 15, y: 10 }, score: 0, lastMoveAt: performance.now() };
  drawSnake();
  const canvas = document.getElementById('snakeCanvas');
  if (canvas) {
    let startPoint = null;
    canvas.ontouchstart = (event) => {
      const touch = event.changedTouches[0];
      startPoint = { x: touch.clientX, y: touch.clientY };
    };
    canvas.ontouchend = (event) => {
      if (!startPoint) return;
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startPoint.x;
      const deltaY = touch.clientY - startPoint.y;
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 18) return;
      if (Math.abs(deltaX) > Math.abs(deltaY)) snakeTurn(Math.sign(deltaX), 0);
      else snakeTurn(0, Math.sign(deltaY));
      startPoint = null;
    };
  }
  snakeTimer = setInterval(tickSnake, 175);
  const animate = () => {
    if (!document.getElementById('snakeCanvas') || !snake) return;
    drawSnake(Math.min(1, (performance.now() - snake.lastMoveAt) / 175));
    snakeFrame = requestAnimationFrame(animate);
  };
  snakeFrame = requestAnimationFrame(animate);
}
function snakeTurn(dx, dy) {
  if (!snake || (dx === -snake.dx && dy === -snake.dy)) return;
  snake.dx = dx; snake.dy = dy;
}
function tickSnake() {
  const canvas = document.getElementById('snakeCanvas');
  if (!canvas || !snake) { clearInterval(snakeTimer); return; }
  snake.previousBody = snake.body.map(part => ({ ...part }));
  snake.lastMoveAt = performance.now();
  const head = { x: (snake.body[0].x + snake.dx + 20) % 20, y: (snake.body[0].y + snake.dy + 20) % 20 };
  if (snake.body.some(part => part.x === head.x && part.y === head.y)) return startSnakeGame();
  snake.body.unshift(head);
  if (head.x === snake.food.x && head.y === snake.food.y) {
    snake.score++;
    do { snake.food = { x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) }; } while (snake.body.some(part => part.x === snake.food.x && part.y === snake.food.y));
  } else snake.body.pop();
  drawSnake(0);
}
function drawSnake(progress = 1) {
  const canvas = document.getElementById('snakeCanvas');
  if (!canvas || !snake) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width / 20;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f4ead4'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(134, 172, 126, .16)';
  for (let x = 14; x < canvas.width; x += 34) for (let y = 14; y < canvas.height; y += 34) { ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill(); }
  const cx = (snake.food.x + .5) * size, cy = (snake.food.y + .5) * size;
  ctx.fillStyle = '#f36552'; ctx.beginPath(); ctx.arc(cx, cy + 1, size * .34, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5c7b4d'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy - size * .27); ctx.quadraticCurveTo(cx + 1, cy - size * .52, cx + 5, cy - size * .5); ctx.stroke();
  const smooth = snake.body.map((part, index) => {
    const previous = snake.previousBody[Math.max(0, index - 1)] || part;
    return { x: previous.x + (part.x - previous.x) * progress, y: previous.y + (part.y - previous.y) * progress };
  });
  for (let index = smooth.length - 1; index >= 0; index--) {
    const part = smooth[index];
    const radius = size * (index === 0 ? .42 : .37);
    const gradient = ctx.createRadialGradient((part.x + .35) * size, (part.y + .3) * size, 1, (part.x + .5) * size, (part.y + .5) * size, radius * 1.4);
    gradient.addColorStop(0, index === 0 ? '#b8df83' : '#93c86d'); gradient.addColorStop(1, index === 0 ? '#5ea85a' : '#70ad64');
    ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc((part.x + .5) * size, (part.y + .5) * size, radius, 0, Math.PI * 2); ctx.fill();
  }
  const head = smooth[0];
  const eyeX = (head.x + .5 + snake.dx * .14) * size, eyeY = (head.y + .5 + snake.dy * .14) * size;
  ctx.fillStyle = '#263529'; ctx.beginPath(); ctx.arc(eyeX, eyeY, size * .085, 0, Math.PI * 2); ctx.fill();
  const score = document.getElementById('snakeScore'); if (score) score.textContent = `SNAKE · ${snake.score}`;
}
document.addEventListener('keydown', (event) => {
  const directions = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  if (document.getElementById('snakeCanvas') && directions[event.key]) { event.preventDefault(); snakeTurn(...directions[event.key]); }
});

function compressImage(file, maxDimension = 1200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

function calculateSimilarity(s1, s2) {
  let longer = s1.length < s2.length ? s2 : s1;
  let shorter = s1.length < s2.length ? s1 : s2;
  let longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  let costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
