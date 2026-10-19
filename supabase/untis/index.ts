// Weiterleitung zu WebUntis für die Lernapp.
// Untis erlaubt keine direkten Browser-Anfragen von fremden Seiten, deshalb läuft der Abruf hier.
// Zugangsdaten werden nur für die eine Anfrage benutzt und nirgends gespeichert oder geloggt.
// Es gibt drei Wege: die Web-Schnittstelle (JSON-RPC), die REST-Schnittstelle mit Token und
// die Schnittstelle der Untis-Handy-App. Was eine Schule sperrt, wird über den nächsten Weg versucht.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// Nur echte WebUntis-Server zulassen, damit die Funktion kein offener Proxy ist
const SERVER_RE = /^[a-z0-9-]+\.webuntis\.com$/i;

function ymd(d: Date) {
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}
function addDays(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}
function isoDay(n: number) {
  return addDays(n).toISOString().slice(0, 10);
}
function isoDate(n: number | string) {
  const s = String(n);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}
function hhmm(n: number) {
  const s = String(n).padStart(4, "0");
  return `${s.slice(0, 2)}:${s.slice(2)}`;
}
// "2026-10-20T07:55" oder "2026-10-20T07:55Z" → Datum und Uhrzeit
function splitDateTime(s: string) {
  const m = String(s || "").match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return m ? { date: m[1], time: m[2] } : { date: "", time: "" };
}

async function rpc(url: string, method: string, params: unknown, cookie?: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify({ id: "lernapp", method, params, jsonrpc: "2.0" }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.error) throw new Error(data.error.message || "Untis-Fehler");
  return data.result;
}

async function rest(server: string, path: string, cookie: string, token?: string) {
  const res = await fetch(`https://${server}/WebUntis${path}`, {
    headers: { Cookie: cookie, Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`${path.split("?")[0]} ${res.status}`);
  return res.json();
}

// ---------- Schnittstelle der Handy-App (Einmal-Code aus geteiltem Schlüssel) ----------

function base32Decode(input: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | alphabet.indexOf(ch);
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return new Uint8Array(out);
}

async function totp(secret: string, time = Date.now()) {
  const counter = Math.floor(time / 30000);
  const msg = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) { msg[i] = c & 255; c = Math.floor(c / 256); }
  const key = await crypto.subtle.importKey("raw", base32Decode(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const o = h[h.length - 1] & 15;
  const code = ((h[o] & 127) << 24 | h[o + 1] << 16 | h[o + 2] << 8 | h[o + 3]) % 1000000;
  return String(code).padStart(6, "0");
}

async function mobile(server: string, school: string, method: string, params: Record<string, unknown>, user?: string, secret?: string) {
  const url = `https://${server}/WebUntis/jsonrpc_intern.do?m=${method}&school=${encodeURIComponent(school)}&v=i2.2`;
  const p: Record<string, unknown> = { ...params };
  if (secret) p.auth = { user, otp: await totp(secret), clientTime: Date.now() };
  return rpc(url, method, [p]);
}

// ---------- Abruf ----------

async function sync(server: string, school: string, user: string, password: string) {
  const base = `https://${server}/WebUntis/jsonrpc.do?school=${encodeURIComponent(school)}`;
  const auth = await rpc(base, "authenticate", { user, password, client: "Lernapp" });
  if (!auth?.sessionId) throw new Error("Anmeldung fehlgeschlagen");
  const cookie = `JSESSIONID=${auth.sessionId}; schoolname="_${btoa(school)}"`;
  const out: any = { timetable: [], exams: [], homework: [], warnings: [], via: {} };
  const subjects: Record<number, { name: string; long: string }> = {};

  // Handy-App-Zugang wird nur bei Bedarf geholt
  let mob: { secret: string; elementId: number } | null | undefined;
  const getMobile = async () => {
    if (mob !== undefined) return mob;
    try {
      const secret = await mobile(server, school, "getAppSharedSecret", { userName: user, password });
      const ud = await mobile(server, school, "getUserData2017", { elementId: 0, deviceOs: "AND", deviceOsVersion: "" }, user, secret);
      for (const s of ud?.masterData?.subjects || []) subjects[s.id] = subjects[s.id] || { name: s.name, long: s.longName };
      mob = { secret, elementId: ud?.userData?.elementId || auth.personId };
    } catch (e) {
      out.warnings.push("App-Zugang: " + (e as Error).message);
      mob = null;
    }
    return mob;
  };
  const mobileCall = async (method: string, extra: Record<string, unknown>) => {
    const m = await getMobile();
    if (!m) throw new Error("App-Zugang nicht möglich");
    return mobile(server, school, method, { id: m.elementId, type: "STUDENT", ...extra }, user, m.secret);
  };

  // REST-Token (neuere Untis-Versionen verlangen ihn)
  let token: string | undefined;
  try {
    const res = await fetch(`https://${server}/WebUntis/api/token/new`, { headers: { Cookie: cookie } });
    if (res.ok) token = (await res.text()).trim().replace(/^"|"$/g, "");
  } catch (_) { /* geht auch ohne */ }

  try {
    try {
      for (const s of await rpc(base, "getSubjects", {}, cookie)) subjects[s.id] = { name: s.name, long: s.longName };
    } catch (_) { /* manche Schulen geben die Liste nicht frei */ }

    // ----- Stundenplan -----
    try {
      const periods = await rpc(base, "getTimetable", {
        options: {
          element: { id: auth.personId, type: auth.personType },
          startDate: ymd(addDays(-1)), endDate: ymd(addDays(14)),
          showSubstText: true, showInfo: true, showLsText: true,
          subjectFields: ["name", "longname"], roomFields: ["name"],
        },
      }, cookie);
      out.timetable = (periods || []).map((p: any) => {
        const su = p.su?.[0] || {};
        return {
          date: isoDate(p.date), start: hhmm(p.startTime), end: hhmm(p.endTime),
          subject: su.name || subjects[su.id]?.name || "", subjectLong: su.longname || subjects[su.id]?.long || "",
          room: p.ro?.[0]?.name || "", cancelled: p.code === "cancelled", irregular: p.code === "irregular",
          info: [p.substText, p.info, p.lstext].filter(Boolean).join(" · "),
        };
      });
      out.via.timetable = "web";
    } catch (e) { out.warnings.push("Stundenplan (Web): " + (e as Error).message); }
    if (!out.timetable.length) {
      try {
        const r = await mobileCall("getTimetable2017", {
          startDate: isoDay(-1), endDate: isoDay(14), masterDataTimestamp: 0, timetableTimestamp: 0, timetableTimestamps: [],
        });
        out.timetable = (r?.timetable?.periods || []).map((p: any) => {
          const st = splitDateTime(p.startDateTime), en = splitDateTime(p.endDateTime);
          const subEl = (p.elements || []).find((el: any) => el.type === "SUBJECT");
          const roomEl = (p.elements || []).find((el: any) => el.type === "ROOM");
          const s = subEl ? subjects[subEl.id] : undefined;
          const is = p.is || {};
          return {
            date: st.date, start: st.time, end: en.time, subject: s?.name || "", subjectLong: s?.long || "",
            room: roomEl?.name || "", cancelled: !!is.cancelled, irregular: !!(is.substitution || is.roomSubstitution || is.event),
            info: [p.text?.substitution, p.text?.info, p.text?.lesson].filter(Boolean).join(" · "),
          };
        });
        if (out.timetable.length) out.via.timetable = "app";
      } catch (e) { out.warnings.push("Stundenplan (App): " + (e as Error).message); }
    }
    out.timetable.sort((a: any, b: any) => (a.date + a.start).localeCompare(b.date + b.start));

    // ----- Arbeiten und Tests -----
    try {
      const data = await rest(server, `/api/exams?startDate=${ymd(addDays(-3))}&endDate=${ymd(addDays(120))}&studentId=${auth.personId}&klasseId=-1&withGrades=false`, cookie, token);
      out.exams = (data?.data?.exams || []).map((e: any) => ({
        id: String(e.id), date: isoDate(e.examDate), start: e.startTime ? hhmm(e.startTime) : "",
        subject: e.subject || "", type: e.examType || "", name: e.name || "", text: e.text || "",
      }));
      out.via.exams = "rest";
    } catch (e1) {
      try {
        const r = await mobileCall("getExams2017", { startDate: isoDay(-3), endDate: isoDay(120) });
        out.exams = (r?.exams || []).map((e: any) => {
          const st = splitDateTime(e.startDateTime);
          const s = subjects[e.subjectId];
          return { id: String(e.id), date: st.date, start: st.time, subject: s?.name || "", type: e.examType || "", name: e.name || "", text: e.text || "" };
        });
        out.via.exams = "app";
      } catch (e2) { out.warnings.push(`Arbeiten: ${(e1 as Error).message}, ${(e2 as Error).message}`); }
    }

    // ----- Hausaufgaben -----
    try {
      const data = await rest(server, `/api/homeworks/lessons?startDate=${ymd(addDays(-7))}&endDate=${ymd(addDays(30))}`, cookie, token);
      const lessons: Record<number, string> = {};
      for (const l of data?.data?.lessons || []) lessons[l.id] = l.subject || "";
      out.homework = (data?.data?.homeworks || []).map((h: any) => ({
        id: String(h.id), date: isoDate(h.date), due: isoDate(h.dueDate), subject: lessons[h.lessonId] || "",
        text: h.text || "", remark: h.remark || "", done: !!h.completed,
      }));
      out.via.homework = "rest";
    } catch (e1) {
      try {
        const r = await mobileCall("getHomeWork2017", { startDate: isoDay(-7), endDate: isoDay(30) });
        const lessonSubject: Record<number, string> = {};
        for (const l of r?.lessons || []) lessonSubject[l.id] = subjects[l.subjectId]?.name || "";
        out.homework = (r?.homeWorks || []).map((h: any) => ({
          id: String(h.id), date: String(h.startDate || "").slice(0, 10), due: String(h.endDate || "").slice(0, 10),
          subject: lessonSubject[h.lessonId] || "", text: h.text || "", remark: h.remark || "", done: !!h.completed,
        }));
        out.via.homework = "app";
      } catch (e2) { out.warnings.push(`Hausaufgaben: ${(e1 as Error).message}, ${(e2 as Error).message}`); }
    }
  } finally {
    await rpc(base, "logout", {}, cookie).catch(() => {});
  }
  // Warnungen nur zeigen, wenn am Ende wirklich etwas fehlt
  out.warnings = out.warnings.filter((w: string) =>
    !(w.startsWith("Stundenplan") && out.timetable.length) && !(w.startsWith("App-Zugang") && out.via.exams && out.via.homework));
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Nur POST" }, 405);
  try {
    const body = await req.json();
    if (body.action === "search") {
      const q = String(body.query || "").trim();
      if (q.length < 3) return json({ schools: [] });
      return json({ schools: await searchSchool(q) });
    }
    if (body.action === "sync") {
      const { server, school, user, password } = body;
      if (!SERVER_RE.test(String(server || ""))) return json({ error: "Unbekannter Untis-Server" }, 400);
      if (!school || !user || !password) return json({ error: "Schule, Benutzername und Passwort fehlen" }, 400);
      return json(await sync(server, String(school), String(user), String(password)));
    }
    return json({ error: "Unbekannte Aktion" }, 400);
  } catch (e) {
    return json({ error: (e as Error).message || "Fehler" }, 502);
  }
});

async function searchSchool(query: string) {
  const result = await rpc("https://mobile.webuntis.com/ms/schoolquery2", "searchSchool", [{ search: query }]);
  return (result?.schools || []).slice(0, 15).map((s: any) => ({
    server: s.server, loginName: s.loginName, displayName: s.displayName, address: s.address,
  }));
}
