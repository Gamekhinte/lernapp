// KI-Anbindung mit dem eigenen Key: Google Gemini, OpenAI oder Anthropic Claude.
// messages: [{ role: 'user' | 'assistant', text, images: [base64Jpeg] }]

const GEMINI_MODEL = 'gemini-3.8-flash';
const OPENAI_MODEL = 'gpt-4o-mini';
const CLAUDE_MODEL = 'claude-opus-5-5';

const PROVIDER_NAMES = {
  gemini: 'Google Gemini',
  openai: 'OpenAI (ChatGPT)',
  claude: 'Anthropic Claude'
};

function hasAiKey() {
  return !!state.apiKeys[state.provider];
}

async function aiCall({ system = '', messages, json = false }) {
  const key = state.apiKeys[state.provider];
  if (!key) throw new Error('Kein API-Key eingetragen.');
  let text;
  if (state.provider === 'openai') text = await callOpenAI(key, system, messages, json);
  else if (state.provider === 'claude') text = await callClaude(key, system, messages, json);
  else text = await callGemini(key, system, messages, json);
  return json ? parseAiJson(text) : text;
}

// Kurzform für eine Frage mit optionalen Bildern
function aiAsk(prompt, images = [], json = true, system = '') {
  return aiCall({ system, json, messages: [{ role: 'user', text: prompt, images }] });
}

async function callGemini(key, system, messages, json) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  const body = {
    contents: messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [
        ...(m.images || []).map(img => ({ inline_data: { mime_type: 'image/jpeg', data: img } })),
        { text: m.text || ' ' }
      ]
    })),
    generationConfig: { temperature: json ? 0.2 : 0.6, ...(json ? { responseMimeType: 'application/json' } : {}) }
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  let res, data;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    data = await res.json().catch(() => ({}));
    if (res.ok || ![429, 500, 503].includes(res.status) || attempt === 2) break;
    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
  }
  if (!res.ok) throw new Error(data.error?.message || 'Gemini Fehler ' + res.status);
  return data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
}

async function callOpenAI(key, system, messages, json) {
  const msgs = [];
  if (system) msgs.push({ role: 'system', content: system });
  messages.forEach(m => {
    if (m.images?.length) {
      msgs.push({ role: m.role, content: [
        { type: 'text', text: m.text || ' ' },
        ...m.images.map(img => ({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + img } }))
      ] });
    } else {
      msgs.push({ role: m.role, content: m.text || ' ' });
    }
  });
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, messages: msgs, ...(json ? { response_format: { type: 'json_object' } } : {}) })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI Fehler ' + res.status);
  return data.choices?.[0]?.message?.content || '';
}

async function callClaude(key, system, messages, json) {
  const body = {
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    output_config: { effort: 'low' },
    fallbacks: 'default',
    messages: messages.map(m => ({
      role: m.role,
      content: [
        ...(m.images || []).map(img => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: img } })),
        { type: 'text', text: m.text || ' ' }
      ]
    }))
  };
  const sys = [system, json ? 'Antworte ausschließlich mit gültigem JSON, ohne Markdown.' : ''].filter(Boolean).join('\n\n');
  if (sys) body.system = sys;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'server-side-fallback-2026-07-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || 'Claude Fehler ' + res.status);
  if (data.stop_reason === 'refusal') throw new Error('Claude hat diese Anfrage abgelehnt. Formuliere sie bitte anders.');
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
}

function parseAiJson(rawText) {
  const cleaned = (rawText || '').replace(/```json|```/gi, '').trim();
  const objectStart = cleaned.indexOf('{');
  const arrayStart = cleaned.indexOf('[');
  const start = objectStart === -1 ? arrayStart : arrayStart === -1 ? objectStart : Math.min(objectStart, arrayStart);
  if (start === -1) throw new Error('Die KI hat keine lesbare Antwort geliefert. Bitte nochmal versuchen.');
  const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (end < start) throw new Error('Die KI-Antwort war unvollständig. Bitte nochmal versuchen.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

// Gemeinsamer Hintergrund für alle Schul-Prompts
const SCHOOL_CONTEXT = 'Der Lernende geht in die 9. Klasse eines Gymnasiums in Hessen (G9). Schreibe auf Deutsch, kurz und verständlich. Verwende kein LaTeX, sondern normale Zeichen wie x², √, ·, ≤.';

// ---------- API-Key-Dialog ----------

function setApiKey() {
  const steps = {
    gemini: `<li>Öffne <b>aistudio.google.com</b> und melde dich mit Google an.</li>
             <li>Klicke auf <b>"Get API key"</b> und dann auf <b>"Create API key"</b>.</li>
             <li>Kopiere den Schlüssel und füge ihn unten ein. Gemini ist kostenlos nutzbar.</li>`,
    openai: `<li>Öffne <b>platform.openai.com</b> und logge dich ein.</li>
             <li>Gehe zu <b>API Keys</b> und klicke auf <b>"Create new secret key"</b>.</li>
             <li>Kopiere den Schlüssel und füge ihn unten ein.</li>`,
    claude: `<li>Öffne <b>console.anthropic.com</b> und logge dich ein.</li>
             <li>Gehe zu <b>API Keys</b> und klicke auf <b>"Create Key"</b>.</li>
             <li>Kopiere den Schlüssel und füge ihn unten ein.</li>`
  };
  openModal(`
    <h3 class="modal-title">🔑 KI einrichten</h3>
    <label class="field-label">Anbieter</label>
    <select id="providerSelect" onchange="state.provider=this.value; localStorage.setItem('ai-provider', this.value); setApiKey();">
      ${Object.entries(PROVIDER_NAMES).map(([id, name]) => `<option value="${id}" ${state.provider === id ? 'selected' : ''}>${name}</option>`).join('')}
    </select>
    <ol class="steps">${steps[state.provider]}</ol>
    <button class="btn btn-outline btn-sm" onclick="openTutorialVideo()">▶ Video-Anleitung</button>
    <label class="field-label" style="margin-top:16px;">Dein API-Key</label>
    <input id="apiKeyInput" type="password" autocomplete="off" value="${esc(state.apiKeys[state.provider] || '')}" placeholder="API-Key hier einfügen">
    <p class="note">Der Key bleibt nur auf diesem Gerät gespeichert.</p>
    <div class="row-2" style="margin-top:16px;">
      <button class="btn btn-outline" onclick="closeModal()">Abbrechen</button>
      <button class="btn btn-primary" onclick="saveApiKey()">Speichern</button>
    </div>
  `);
}

function saveApiKey() {
  const key = (document.getElementById('apiKeyInput')?.value || '').trim();
  state.apiKeys[state.provider] = key;
  localStorage.setItem('key-' + state.provider, key);
  closeModal();
  toast(key ? 'KI ist bereit.' : 'Key entfernt.');
  render();
}

function openTutorialVideo() {
  openModal(`
    <h3 class="modal-title">Video-Anleitung</h3>
    <p class="note" style="margin-bottom:12px;">So findest du deinen API-Key und fügst ihn ein.</p>
    <video controls playsinline preload="metadata" style="width:100%; border:2px solid var(--ink); background:#000;"><source src="./api-key-tutorial.mp4" type="video/mp4"></video>
    <button class="btn btn-primary" style="margin-top:16px;" onclick="setApiKey()">← Zurück zum Key</button>
  `);
}

// Prüft den Key und öffnet sonst den Dialog. Gibt true zurück, wenn es losgehen kann.
function requireAi() {
  if (hasAiKey()) return true;
  setApiKey();
  return false;
}
