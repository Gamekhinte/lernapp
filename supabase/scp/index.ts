// Abruf aus dem StudentControlPanel (SCP) des Franziskanergymnasiums Kreuzburg für die Lernapp.
// Meldet sich mit den Zugangsdaten des Schülers an, sucht Seiten mit Arbeiten und Terminen
// und gibt alle Einträge mit Datum zurück. Zugangsdaten werden nicht gespeichert oder geloggt.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const BASE = "https://kreuzburg-it.de";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const UA = "Mozilla/5.0 (Lernapp)";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// Einfache Cookie-Verwaltung für die eine Sitzung
function takeCookies(jar: Record<string, string>, res: Response) {
  const raw = res.headers.getSetCookie?.() || [];
  for (const c of raw) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    if (i > 0) jar[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  }
}
const cookieHeader = (jar: Record<string, string>) => Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");

async function get(path: string, jar: Record<string, string>) {
  let url = path.startsWith("http") ? path : BASE + path;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { headers: { Cookie: cookieHeader(jar), "User-Agent": UA }, redirect: "manual" });
    takeCookies(jar, res);
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) { url = new URL(loc, url).toString(); continue; }
    return { url, html: await res.text() };
  }
  throw new Error("Zu viele Weiterleitungen");
}

function decode(s: string) {
  return s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&auml;/g, "ä").replace(/&ouml;/g, "ö").replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä").replace(/&Ouml;/g, "Ö").replace(/&Uuml;/g, "Ü").replace(/&szlig;/g, "ß")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

// HTML in Textzeilen zerlegen (Tabellenzeilen, Listen, Karten)
function toLines(html: string) {
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "").replace(/<aside[\s\S]*?<\/aside>/gi, "");
  return decode(body
    .replace(/<\/(td|th)>/gi, " | ")
    .replace(/<(br|\/tr|\/li|\/p|\/div|\/h\d|\/option)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " "))
    .split("\n").map(l => l.replace(/\s+/g, " ").replace(/(\s*\|\s*)+$/, "").replace(/^(\s*\|\s*)+/, "").trim())
    .filter(l => l.length > 3);
}

const DATE_RE = /(\d{1,2})\.(\d{1,2})\.(\d{2,4})?/;
function isoFrom(m: RegExpMatchArray) {
  const d = Number(m[1]), mo = Number(m[2]);
  let y = m[3] ? Number(m[3]) : 0;
  if (y && y < 100) y += 2000;
  if (!y) {
    // Ohne Jahr: das nächste passende Datum im Schuljahr nehmen
    const now = new Date();
    y = now.getFullYear();
    if (mo < now.getMonth() + 1 - 4) y += 1;
  }
  if (d < 1 || d > 31 || mo < 1 || mo > 12) return "";
  return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function entriesFrom(html: string, source: string) {
  const out: { date: string; text: string; source: string }[] = [];
  for (const line of toLines(html)) {
    const m = line.match(DATE_RE);
    if (!m) continue;
    const date = isoFrom(m);
    if (!date) continue;
    const text = line.replace(/\s*\|\s*/g, " · ").slice(0, 240);
    if (text.replace(DATE_RE, "").replace(/[\s·|:-]/g, "").length < 3) continue;
    out.push({ date, text, source });
  }
  return out;
}

const PAGE_RE = /arbeit|klausur|test|termin|kalender|lnw|leistung|prüfung|pruefung|ka-plan|klassenarb/i;

async function scp(email: string, password: string) {
  const jar: Record<string, string> = {};
  await get("/scp/login", jar);
  const form = new URLSearchParams({ smail: email, password, btnLogin: "Einloggen" });
  const res = await fetch(BASE + "/scp/login", {
    method: "POST",
    headers: { Cookie: cookieHeader(jar), "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA, Origin: BASE, Referer: BASE + "/scp/login" },
    body: form.toString(),
    redirect: "manual",
  });
  takeCookies(jar, res);
  const start = await get("/scp/", jar);
  if (/name="password"/.test(start.html) && /btnLogin/.test(start.html)) throw new Error("E-Mail oder Passwort stimmt nicht.");

  // Menüpunkte sammeln
  const menu: { text: string; href: string }[] = [];
  const seen = new Set<string>();
  for (const m of start.html.matchAll(/<a[^>]+href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = new URL(decode(m[1]), start.url).toString();
    const text = decode(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
    if (!href.startsWith(BASE + "/scp") || /logout|abmelden|datenschutz|impressum/i.test(href + text) || seen.has(href)) continue;
    seen.add(href);
    menu.push({ text: text.slice(0, 60), href: href.replace(BASE, "") });
  }

  const entries = entriesFrom(start.html, "Start");
  const pages = menu.filter(m => PAGE_RE.test(m.text + " " + m.href)).slice(0, 5);
  for (const p of pages) {
    try {
      const page = await get(p.href, jar);
      entries.push(...entriesFrom(page.html, p.text || p.href));
    } catch (_) { /* Seite überspringen */ }
  }
  // Doppelte Einträge entfernen
  const uniq = new Map<string, any>();
  for (const e of entries) uniq.set(e.date + e.text, e);
  await get("/scp/logout", jar).catch(() => {});
  return { entries: [...uniq.values()], menu: menu.map(m => m.text).filter(Boolean).slice(0, 40), pages: pages.map(p => p.text) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Nur POST" }, 405);
  try {
    const { email, password } = await req.json();
    if (!email || !password) return json({ error: "E-Mail und Passwort fehlen" }, 400);
    return json(await scp(String(email), String(password)));
  } catch (e) {
    return json({ error: (e as Error).message || "Fehler" }, 502);
  }
});
