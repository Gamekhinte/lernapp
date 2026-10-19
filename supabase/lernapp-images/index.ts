// Bilder der Lernapp: hochladen, abrufen, prüfen welche schon da sind.
// Das Login gehört zum Supabase-Projekt des Voc-Trainers, deshalb wird der Token dort geprüft.
// Gespeichert wird privat im Bucket lernapp-images unter <user-id>/<bild-id>.jpg.
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const AUTH_URL = "https://jxkcxfmutaxmhifgbufv.supabase.co/auth/v1/user";
const AUTH_KEY = "sb_publishable_4OZSol8T0c0TRVwRVgyAHQ_9WAhw-Zf";
const BUCKET = "lernapp-images";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-lernapp-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const ID_RE = /^i[0-9a-f]{20}$/;

async function userId(token: string | null) {
  if (!token) return null;
  const res = await fetch(AUTH_URL, { headers: { apikey: AUTH_KEY, Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const u = await res.json().catch(() => null);
  return typeof u?.id === "string" ? u.id : null;
}

function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(s);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const uid = await userId(req.headers.get("x-lernapp-token"));
  if (!uid) return json({ error: "nicht angemeldet" }, 401);
  let b: any;
  try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }

  if (b.action === "upload") {
    if (!ID_RE.test(String(b.id)) || typeof b.data !== "string" || b.data.length > 7_000_000) return json({ error: "ungültig" }, 400);
    const { error } = await db.storage.from(BUCKET).upload(`${uid}/${b.id}.jpg`, b64ToBytes(b.data), { contentType: "image/jpeg", upsert: true });
    return error ? json({ error: error.message }, 500) : json({ ok: true });
  }

  if (b.action === "get") {
    if (!ID_RE.test(String(b.id))) return json({ error: "ungültig" }, 400);
    const { data, error } = await db.storage.from(BUCKET).download(`${uid}/${b.id}.jpg`);
    if (error || !data) return json({ error: "nicht gefunden" }, 404);
    return json({ data: bytesToB64(new Uint8Array(await data.arrayBuffer())) });
  }

  if (b.action === "has") {
    const ids = (Array.isArray(b.ids) ? b.ids : []).filter((x: unknown) => ID_RE.test(String(x))).slice(0, 1000);
    const found = new Set<string>();
    let offset = 0;
    while (true) {
      const { data } = await db.storage.from(BUCKET).list(uid, { limit: 1000, offset });
      if (!data?.length) break;
      data.forEach((f) => found.add(f.name.replace(/\.jpg$/, "")));
      if (data.length < 1000) break;
      offset += 1000;
    }
    return json({ have: ids.filter((id: string) => found.has(id)) });
  }

  return json({ error: "unknown action" }, 400);
});
