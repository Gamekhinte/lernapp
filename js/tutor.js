// KI-Nachhilfe: ein Chat pro Fach, mit Foto, und Sprung aus jeder Übung heraus.

const TUTOR_KEY = 'lernapp-tutor-v1';

const TUTOR_IDEAS = {
  mathe: ['Erklär mir das Additionsverfahren mit einem Beispiel', 'Wann hat ein LGS keine Lösung?', 'Wie funktioniert die pq-Formel?', 'Gib mir eine schwere Textaufgabe zu LGS'],
  englisch: ['Wann nehme ich present perfect statt simple past?', 'Korrigier meinen Text und erklär die Fehler', 'Frag mich 10 Vokabeln zu Australia ab', 'Wie schreibe ich einen guten Blog-Eintrag?'],
  franzoesisch: ['Wann bildet man das passé composé mit être?', 'Erklär mir die Teilungsartikel', 'Frag mich 10 Vokabeln ab', 'Korrigier meinen Text'],
  geschichte: ['Erklär mir die Ursachen des Ersten Weltkriegs einfach', 'Mach mir 5 Testfragen zum aktuellen Thema', 'Wie analysiere ich eine Quelle?', 'Wie schreibe ich eine gute Antwort auf "Erläutere …"?'],
  erdkunde: ['Erklär mir die Klimazonen der Erde', 'Wie lese ich ein Klimadiagramm?', 'Mach mir 5 Testfragen', 'Was ist Plattentektonik?'],
  biologie: ['Erklär mir den Aufbau einer Zelle', 'Wie funktioniert die Fotosynthese?', 'Mach mir 5 Testfragen', 'Erklär mir die Mendelschen Regeln']
};

function loadTutorChats() {
  try { return JSON.parse(localStorage.getItem(TUTOR_KEY) || '{}'); } catch (e) { return {}; }
}

function saveTutorChat() {
  const t = state.tutor;
  if (!t) return;
  const chats = loadTutorChats();
  chats[t.subject] = t.messages.slice(-40).map(m => ({ role: m.role, text: m.text, hadImage: !!m.image || m.hadImage }));
  try { localStorage.setItem(TUTOR_KEY, JSON.stringify(chats)); } catch (e) {}
}

function ensureTutor(subjectId) {
  if (!state.tutor || state.tutor.subject !== subjectId) {
    state.tutor = { subject: subjectId, messages: loadTutorChats()[subjectId] || [], busy: false, image: null, returnTo: null };
  }
}

function openTutor(subjectId) {
  ensureTutor(subjectId || state.tutor?.subject || 'mathe');
  state.tutor.returnTo = null;
  go('tutor');
}

function explainWithTutor(text, subjectId, returnTo) {
  ensureTutor(subjectId || 'mathe');
  state.tutor.returnTo = returnTo;
  go('tutor');
  sendTutor(text);
}

function tutorSystem(subject) {
  const lang = subject.kind === 'sprache' ? ` Erkläre auf Deutsch, Beispiele auf ${getLangConfig(subject.lang).name}.` : '';
  return `Du bist eine geduldige, freundliche Nachhilfelehrkraft für das Fach ${subject.name}. ${SCHOOL_CONTEXT}${lang}
Erkläre Schritt für Schritt mit einfachen Worten und konkreten Beispielen. Halte Antworten eher kurz (meist unter 150 Wörtern), außer es wird mehr gewünscht.
Bei Hausaufgaben: nicht sofort die fertige Lösung hinschreiben, sondern zum Lösen anleiten. Wenn ausdrücklich nach der Lösung gefragt wird oder ein eigener Versuch gezeigt wurde, zeig sie vollständig mit Rechenweg.
Wenn ein Fehler erklärt werden soll: sag genau, wo der Denkfehler liegt, und gib einen Merksatz.
Stell am Ende oft eine kurze Kontrollfrage, damit der Stoff hängen bleibt. Nutze Markdown sparsam (fett, Listen). Bleib beim Schulstoff.`;
}

function renderTutor(container) {
  ensureTutor(state.params.subject || state.tutor?.subject || 'mathe');
  const t = state.tutor;
  const subject = getSubject(t.subject);
  const chips = getSubjects().map(s => `<button class="chip ${s.id === t.subject ? 'active' : ''}" onclick="switchTutor('${s.id}')">${s.emoji} ${esc(s.name)}</button>`).join('');

  if (!hasAiKey()) {
    container.innerHTML = `
      <h2 class="page-title">💬 Nachhilfe</h2>
      <div class="card center">
        <div style="font-size:42px;">🤖</div>
        <p style="margin:10px 0 16px;">Für die Nachhilfe brauchst du einen KI-Key. Mit Google Gemini ist das kostenlos und dauert zwei Minuten.</p>
        <button class="btn btn-primary" onclick="setApiKey()">🔑 KI einrichten</button>
      </div>`;
    return;
  }

  const ideas = TUTOR_IDEAS[t.subject] || ['Erklär mir das aktuelle Thema einfach', 'Mach mir 5 Testfragen', 'Wie lerne ich am besten für die Arbeit?'];
  const msgs = t.messages.length ? t.messages.map(m => `
    <div class="msg ${m.role}">
      ${m.image ? `<img src="data:image/jpeg;base64,${m.image}" alt="Foto">` : m.hadImage ? '<div class="note">📷 Foto</div>' : ''}
      ${m.role === 'assistant' ? mdToHtml(m.text) : `<p>${esc(m.text).replace(/\n/g, '<br>')}</p>`}
    </div>`).join('') : `
    <div class="tutor-empty">
      <div style="font-size:38px;">${subject.emoji}</div>
      <p>Frag mich alles zu ${esc(subject.name)}. Du kannst auch ein Foto von einer Aufgabe schicken.</p>
      <div class="idea-list">${ideas.map(i => `<button class="idea" onclick='sendTutor(${jsArg(i)})'>${esc(i)}</button>`).join('')}</div>
    </div>`;

  container.innerHTML = `
    <div class="tutor-head">
      ${t.returnTo ? `<button class="icon-btn" onclick="tutorBack()">← Zurück</button>` : `<h2 class="page-title" style="margin:0;">💬 Nachhilfe</h2>`}
      ${t.messages.length ? `<button class="icon-btn" onclick="clearTutor()" title="Neuer Chat">🧹 Neu</button>` : ''}
    </div>
    <div class="chip-row">${chips}</div>
    <div class="chat" id="chat">
      ${msgs}
      ${t.busy ? '<div class="msg assistant"><span class="typing"><i></i><i></i><i></i></span></div>' : ''}
    </div>
    <div class="chat-input">
      ${t.image ? `<div class="attach-preview"><img src="data:image/jpeg;base64,${t.image}" alt=""><button onclick="state.tutor.image=null; render();">✕</button></div>` : ''}
      <div class="chat-row">
        <input type="file" accept="image/*" id="tutorPhoto" hidden onchange="attachTutorPhoto(event)">
        <button class="icon-btn" onclick="document.getElementById('tutorPhoto').click()" title="Foto anhängen">📷</button>
        <textarea id="tutorInput" rows="1" placeholder="Deine Frage …" onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); sendTutor();}" oninput="this.style.height='auto'; this.style.height=Math.min(this.scrollHeight,140)+'px'"></textarea>
        <button class="btn btn-primary send-btn" ${t.busy ? 'disabled' : ''} onclick="sendTutor()">➤</button>
      </div>
    </div>`;
  const chat = document.getElementById('chat');
  if (chat) setTimeout(() => chat.lastElementChild?.scrollIntoView({ block: 'end' }), 20);
}

function switchTutor(subjectId) {
  saveTutorChat();
  state.tutor = null;
  ensureTutor(subjectId);
  state.params = { subject: subjectId };
  render();
}

function tutorBack() {
  const [screen, params] = state.tutor.returnTo;
  state.tutor.returnTo = null;
  go(screen, params);
}

function clearTutor() {
  if (!confirm('Chat leeren und neu anfangen?')) return;
  state.tutor.messages = [];
  saveTutorChat();
  render();
}

async function attachTutorPhoto(e) {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file) return;
  state.tutor.image = await compressImage(file, 1400);
  render();
}

async function sendTutor(preset) {
  const t = state.tutor;
  if (!t || t.busy) return;
  const input = document.getElementById('tutorInput');
  const text = (preset ?? input?.value ?? '').trim();
  if (!text && !t.image) return;
  if (!requireAi()) return;
  t.messages.push({ role: 'user', text: text || 'Hilf mir bitte bei dieser Aufgabe.', image: t.image || null });
  t.image = null;
  t.busy = true;
  unlockBadge('tutor');
  render();
  try {
    const history = t.messages.slice(-16).map((m, i, arr) => ({
      role: m.role,
      text: m.text,
      images: m.image && i >= arr.length - 4 ? [m.image] : []
    }));
    const reply = await aiCall({ system: tutorSystem(getSubject(t.subject)), messages: history });
    t.messages.push({ role: 'assistant', text: reply || 'Hm, dazu habe ich gerade keine Antwort. Frag bitte nochmal anders.' });
    addXp(3);
    saveData();
  } catch (err) {
    t.messages.push({ role: 'assistant', text: '⚠️ Das hat nicht geklappt: ' + err.message });
  }
  t.busy = false;
  saveTutorChat();
  if (state.screen === 'tutor') render();
}
