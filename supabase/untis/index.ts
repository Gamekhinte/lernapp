// Weiterleitung zu WebUntis für die Lernapp.
// Untis erlaubt keine direkten Browser-Anfragen von fremden Seiten, deshalb läuft der Abruf hier.
// Zugangsdaten werden nur für die eine Anfrage benutzt und nirgends gespeichert oder geloggt.
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
function isoDate(n: number | string) {
  const s = String(n);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}
function hhmm(n: number) {
  const s = String(n).padStart(4, "0");
  return `${s.slice(0, 2)}:${s.slice(2)}`;
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

async function rest(server: string, path: string, cookie: string) {
  const res = await fetch(`https://${server}/WebUntis${path}`, { headers: { Cookie: cookie, Accept: "application/json" } });
  if (!res.ok) throw new Error(`Untis ${path.split("?")[0]}: ${res.status}`);
  return res.json();
}

async function searchSchool(query: string) {
  const result = await rpc("https://mobile.webuntis.com/ms/schoolquery2", "searchSchool", [{ search: query }]);
  return (result?.schools || []).slice(0, 15).map((s: any) => ({
    server: s.server, loginName: s.loginName, displayName: s.displayName, address: s.address,
  }));
}

async function sync(server: string, school: string, user: string, password: string) {
  const base = `https://${server}/WebUntis/jsonrpc.do?school=${encodeURIComponent(school)}`;
  const auth = await rpc(base, "authenticate", { user, password, client: "Lernapp" });
  if (!auth?.sessionId) throw new Error("Anmeldung fehlgeschlagen");
  const cookie = `JSESSIONID=${auth.sessionId}; schoolname="_${btoa(school)}"`;
  const out: any = { timetable: [], exams: [], homework: [], warnings: [] };
  try {
    // Fächer (Kurz- und Langname)
    const subjects: Record<number, { name: string; long: string }> = {};
    try {
      for (const s of await rpc(base, "getSubjects", {}, cookie)) subjects[s.id] = { name: s.name, long: s.longName };
    } catch (_) { /* manche Schulen geben die Liste nicht frei */ }

    // Stundenplan für die nächsten 14 Tage
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
      }).sort((a: any, b: any) => (a.date + a.start).localeCompare(b.date + b.start));
    } catch (e) { out.warnings.push("Stundenplan: " + (e as Error).message); }

    // Klassenarbeiten und Tests
    try {
      const data = await rest(server, `/api/exams?startDate=${ymd(addDays(-3))}&endDate=${ymd(addDays(120))}&studentId=${auth.personId}&klasseId=-1&withGrades=false`, cookie);
      out.exams = (data?.data?.exams || []).map((e: any) => ({
        id: String(e.id), date: isoDate(e.examDate), start: e.startTime ? hhmm(e.startTime) : "",
        subject: e.subject || "", type: e.examType || "", name: e.name || "", text: e.text || "",
      }));
    } catch (e) { out.warnings.push("Arbeiten: " + (e as Error).message); }

    // Hausaufgaben
    try {
      const data = await rest(server, `/api/homeworks/lessons?startDate=${ymd(addDays(-7))}&endDate=${ymd(addDays(30))}`, cookie);
      const lessons: Record<number, string> = {};
      for (const l of data?.data?.lessons || []) lessons[l.id] = l.subject || "";
      out.homework = (data?.data?.homeworks || []).map((h: any) => ({
        id: String(h.id), date: isoDate(h.date), due: isoDate(h.dueDate), subject: lessons[h.lessonId] || "",
        text: h.text || "", remark: h.remark || "", done: !!h.completed,
      }));
    } catch (e) { out.warnings.push("Hausaufgaben: " + (e as Error).message); }
  } finally {
    await rpc(base, "logout", {}, cookie).catch(() => {});
  }
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
