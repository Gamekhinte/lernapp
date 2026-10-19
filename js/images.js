// Bilder: lokal in IndexedDB, mit Konto zusätzlich im privaten Supabase-Speicher (Bucket "lernapp-bilder").
// Karten und Karteien speichern nur die Bild-ID, damit die synchronisierten Daten klein bleiben.

const PENDING_KEY = 'lernapp-img-pending';
let idbPromise = null;

function idb() {
  if (!idbPromise) {
    idbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open('lernapp', 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore('images');
        req.result.createObjectStore('handles');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return idbPromise;
}

async function idbGet(store, key) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store).objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(store, key, value) {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function hashBytes(bytes) {
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return [...new Uint8Array(digest)].slice(0, 10).map(b => b.toString(16).padStart(2, '0')).join('');
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// Speichert ein JPEG (base64) und gibt seine ID zurück. Gleiche Bilder bekommen die gleiche ID.
async function putImage(b64) {
  const id = 'i' + await hashBytes(base64ToBytes(b64));
  if (!(await idbGet('images', id))) await idbSet('images', id, b64);
  const pending = getPending();
  if (!pending.includes(id)) { pending.push(id); setPending(pending); }
  queueImageUpload();
  return id;
}

function getPending() {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch (e) { return []; }
}

function setPending(list) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

let uploadTimer = null;
let uploading = false;
function queueImageUpload() {
  clearTimeout(uploadTimer);
  uploadTimer = setTimeout(uploadPendingImages, 1500);
}

// Bilder laufen über die Funktion lernapp-images, die das Lernapp-Login prüft
const IMG_FN = 'https://fgjtokbluxqnzotblnly.supabase.co/functions/v1/lernapp-images';

async function imgCall(body) {
  const { data } = await supabaseClient.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error('nicht angemeldet');
  const res = await fetch(IMG_FN, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-lernapp-token': token }, body: JSON.stringify(body) });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(out.error || 'Fehler ' + res.status), { status: res.status });
  return out;
}

async function uploadPendingImages() {
  if (uploading || !state.authUser || !supabaseClient) return;
  uploading = true;
  state.imgUpload = { left: getPending().length };
  try {
    let pending = getPending();
    // Was schon in der Cloud liegt, nicht nochmal hochladen
    if (pending.length > 5) {
      try {
        const { have } = await imgCall({ action: 'has', ids: pending });
        if (have?.length) { pending = pending.filter(id => !have.includes(id)); setPending(pending); }
      } catch (e) { /* dann eben alle hochladen */ }
    }
    // Drei gleichzeitig, damit 200 OneNote-Seiten nicht ewig dauern
    const queue = [...pending];
    const worker = async () => {
      while (queue.length) {
        const id = queue.shift();
        const b64 = await idbGet('images', id);
        if (b64) await imgCall({ action: 'upload', id, data: b64 });
        setPending(getPending().filter(x => x !== id));
        state.imgUpload = { left: getPending().length };
        if (state.screen === 'onenote' && state.imgUpload.left % 10 === 0) render();
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    state.imgUpload = null;
  } catch (err) {
    console.warn('Bild-Upload nicht möglich:', err.message);
    state.imgUpload = { left: getPending().length, error: err.message };
  } finally {
    uploading = false;
  }
}

// Lokal oder aus der Cloud laden
const imgMemo = {};
const imgMissing = new Set();
async function getImageBase64(id) {
  if (!id) return null;
  if (imgMemo[id]) return imgMemo[id];
  let b64 = await idbGet('images', id);
  if (!b64 && state.authUser && supabaseClient && !imgMissing.has(id)) {
    try {
      const out = await imgCall({ action: 'get', id });
      b64 = out.data;
      if (b64) await idbSet('images', id, b64);
    } catch (err) {
      // Liegt noch nicht in der Cloud (z. B. Laptop hat noch nicht hochgeladen)
      if (err.status === 404) imgMissing.add(id);
    }
  }
  if (b64) imgMemo[id] = b64;
  return b64 || null;
}

function imgTag(id, cls = '', clickable = true) {
  if (!id) return '';
  return `<img data-img="${esc(id)}" class="app-img ${cls}" alt="Bild" ${clickable ? `onclick="event.stopPropagation(); openImage('${esc(id)}')"` : ''}>`;
}

// Füllt alle <img data-img> nach dem Rendern
function hydrateImages(root = document) {
  root.querySelectorAll('img[data-img]:not([data-loaded])').forEach(async el => {
    el.setAttribute('data-loaded', '1');
    const b64 = await getImageBase64(el.dataset.img);
    if (b64) el.src = 'data:image/jpeg;base64,' + b64;
    else el.classList.add('missing');
  });
}

function openImage(id, extra = '') {
  openModal(`
    <div class="lightbox">${imgTag(id, 'full', false)}</div>
    ${extra}
    <div class="row-2" style="margin-top:12px;">
      <button class="btn btn-outline" onclick="closeModal()">Schließen</button>
      <button class="btn btn-primary" onclick="askAboutImage('${esc(id)}')">Dazu fragen</button>
    </div>`);
  hydrateImages(document.getElementById('modalContainer'));
}

async function askAboutImage(id) {
  const b64 = await getImageBase64(id);
  if (!b64) return toast('Das Bild ist gerade nicht verfügbar.');
  const subject = state.params.id || state.practice?.subject || state.tutor?.subject || 'mathe';
  ensureTutor(subject);
  state.tutor.image = b64;
  state.tutor.returnTo = [state.screen, { ...state.params }];
  go('tutor');
}

// Datei auswählen, verkleinern, speichern
function pickImage(callbackName, arg = '') {
  let input = document.getElementById('globalImgInput');
  if (!input) {
    input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.id = 'globalImgInput';
    input.hidden = true;
    document.body.appendChild(input);
  }
  input.value = '';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const b64 = await compressImage(file, 1400);
    const id = await putImage(b64);
    window[callbackName](id, arg);
  };
  input.click();
}

// Alle Bilder, die in den Daten vorkommen und auf diesem Gerät liegen, aber noch nicht in der Cloud sind,
// in die Upload-Liste nehmen. So geht nichts verloren, auch wenn die Liste auf einem Gerät fehlt.
async function queueMissingUploads() {
  if (!state.authUser || !supabaseClient) return;
  const ids = new Set();
  (state.data.onenote?.items || []).forEach(it => it.imgId && ids.add(it.imgId));
  state.data.decks.forEach(d => { (d.pages || []).forEach(id => ids.add(id)); d.cards.forEach(c => c.img && ids.add(c.img)); });
  (state.data.mathSets || []).forEach(m => (m.pages || []).forEach(id => ids.add(id)));
  const local = [];
  for (const id of ids) if (await idbGet('images', id)) local.push(id);
  if (!local.length) return;
  let have = [];
  try {
    for (let i = 0; i < local.length; i += 900) have = have.concat((await imgCall({ action: 'has', ids: local.slice(i, i + 900) })).have || []);
  } catch (err) {
    state.imgUpload = { left: local.length, error: err.message };
    return;
  }
  const missing = local.filter(id => !have.includes(id));
  if (missing.length) {
    setPending([...new Set([...getPending(), ...missing])]);
    uploadPendingImages();
  }
}

setInterval(() => { if (getPending().length) uploadPendingImages(); else queueMissingUploads(); }, 5 * 60000);
