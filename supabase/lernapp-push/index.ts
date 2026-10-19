// Push-Erinnerungen der Lernapp (nach dem Vorbild von LilDough).
// Aktionen: config (öffentlicher VAPID-Schlüssel), subscribe, schedule (Liste geplanter Erinnerungen), cancel, tick (Cron).
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

// Nur die Push-Dienste der großen Browser sind als Ziel erlaubt
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^android\.googleapis\.com$/, /(^|\.)push\.services\.mozilla\.com$/, /(^|\.)notify\.windows\.com$/, /(^|\.)push\.apple\.com$/];
function pushOk(ep: string) {
  try {
    const u = new URL(ep);
    return u.protocol === "https:" && !u.port && !u.username && PUSH_HOSTS.some((re) => re.test(u.hostname));
  } catch { return false; }
}

// VAPID-Schlüssel werden beim ersten Aufruf erzeugt und gespeichert
async function cfg() {
  let { data } = await db.from("lernapp_push_config").select("*").eq("id", 1).single();
  if (!data.vapid_public) {
    const k = webpush.generateVAPIDKeys();
    await db.from("lernapp_push_config").update({ vapid_public: k.publicKey, vapid_private: k.privateKey }).eq("id", 1).is("vapid_public", null);
    ({ data } = await db.from("lernapp_push_config").select("*").eq("id", 1).single());
  }
  return data;
}
const str = (v: unknown, n: number) => String(v ?? "").slice(0, n);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  let b: any;
  try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const c = await cfg();

  if (b.action === "config") return json({ publicKey: c.vapid_public });

  if (b.action === "subscribe") {
    const ep = str(b.endpoint, 1000);
    if (!pushOk(ep) || !b.keys?.p256dh || !b.keys?.auth) return json({ error: "invalid subscription" }, 400);
    const { error } = await db.from("lernapp_push_subs").upsert({ endpoint: ep, p256dh: str(b.keys.p256dh, 200), auth: str(b.keys.auth, 100) });
    return error ? json({ error: error.message }, 500) : json({ ok: true });
  }

  if (b.action === "schedule") {
    const ep = str(b.endpoint, 1000);
    const { data: sub } = await db.from("lernapp_push_subs").select("endpoint").eq("endpoint", ep).maybeSingle();
    if (!sub) return json({ error: "unknown subscription" }, 404);
    const now = Date.now();
    const rows = (Array.isArray(b.jobs) ? b.jobs : []).slice(0, 30)
      .filter((j: any) => Number.isFinite(j.t) && j.t > now - 60000 && j.t < now + 8 * 864e5)
      .map((j: any) => ({ endpoint: ep, fire_at: new Date(j.t).toISOString(), title: str(j.title, 80), body: str(j.body, 200) }));
    await db.from("lernapp_push_jobs").delete().eq("endpoint", ep).eq("sent", false);
    if (rows.length) {
      const { error } = await db.from("lernapp_push_jobs").insert(rows);
      if (error) return json({ error: error.message }, 500);
    }
    return json({ ok: true, count: rows.length });
  }

  if (b.action === "cancel") {
    await db.from("lernapp_push_subs").delete().eq("endpoint", str(b.endpoint, 1000));
    return json({ ok: true });
  }

  if (b.action === "tick") {
    if (req.headers.get("x-cron-secret") !== c.cron_secret) return json({ error: "forbidden" }, 403);
    const nowIso = new Date().toISOString();
    // Fällige Erinnerungen atomar beanspruchen (max. 2 Std. alt), damit nichts doppelt rausgeht
    const { data: due } = await db.from("lernapp_push_jobs").update({ sent: true }).eq("sent", false)
      .lte("fire_at", nowIso).gt("fire_at", new Date(Date.now() - 2 * 36e5).toISOString()).select();
    await db.from("lernapp_push_jobs").delete().lt("fire_at", new Date(Date.now() - 864e5).toISOString());
    if (!due?.length) return json({ sent: 0 });
    webpush.setVapidDetails("https://gamekhinte.github.io/lernapp/", c.vapid_public, c.vapid_private);
    const { data: subs } = await db.from("lernapp_push_subs").select("*").in("endpoint", [...new Set(due.map((j) => j.endpoint))]);
    const by = new Map((subs ?? []).map((s) => [s.endpoint, s]));
    let sent = 0;
    await Promise.all(due.map(async (j) => {
      const s = by.get(j.endpoint);
      if (!s) return;
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: j.title, body: j.body }), { TTL: 3600, urgency: "normal" });
        sent++;
      } catch (e: any) {
        if (e.statusCode === 404 || e.statusCode === 410) await db.from("lernapp_push_subs").delete().eq("endpoint", s.endpoint);
      }
    }));
    return json({ sent });
  }
  return json({ error: "unknown action" }, 400);
});
