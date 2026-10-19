// Mathe-Aufgaben für Klasse 9 (Hessen): jede Aufgabe wird zufällig erzeugt und bringt ihren Lösungsweg mit.
// Aufgabe: { topicId, q, fields: [{ key, label }] | null, choices: [..] | null, answer, tol, tolRel, steps: [..], plot }

// ---------- Helfer ----------

function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function rnz(a, b) { let v = 0; while (v === 0) v = ri(a, b); return v; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; }
function lcm(a, b) { return Math.abs(a * b) / gcd(a, b); }

// Zahl deutsch formatieren: Komma, echtes Minus
function fmtN(x) {
  const r = Math.round(x * 10000) / 10000;
  return String(r).replace('.', ',').replace('-', '−');
}

function fracStr(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d);
  n /= g; d /= g;
  if (d === 1) return fmtN(n);
  return (n < 0 ? '−' : '') + Math.abs(n) + '/' + d;
}

// Ein Glied mit Vorzeichen, z. B. term(-3, 'x') -> " − 3x"
function term(coef, v, first) {
  if (coef === 0) return '';
  const abs = Math.abs(coef);
  const body = v ? (abs === 1 ? v : fmtN(abs) + v) : fmtN(abs);
  if (first) return (coef < 0 ? '−' : '') + body;
  return (coef < 0 ? ' − ' : ' + ') + body;
}

function expr(pairs) {
  let out = '';
  pairs.forEach(([c, v]) => { if (c !== 0) out += term(c, v, out === ''); });
  return out || '0';
}

function eqLine(label, left, right) {
  return `<div class="eq"><span class="eq-label">${label}</span> ${left} = ${right}</div>`;
}

function pow(base, exp) {
  return `${base}<sup>${exp}</sup>`;
}

function paren(x) {
  return x < 0 ? '(' + fmtN(x) + ')' : fmtN(x);
}

// Liest Eingaben wie "3,5", "-2", "3/4", "25%", "x = 4"
function parseNum(str) {
  if (str === null || str === undefined) return NaN;
  let s = String(str).trim().replace(/−/g, '-').replace(/\s+/g, '');
  s = s.replace(/^[a-z_₁₂]*\d?[a-z]*=/i, '');
  let percent = false;
  if (s.endsWith('%')) { percent = true; s = s.slice(0, -1); }
  s = s.replace(',', '.');
  let val;
  if (s.includes('/')) {
    const [a, b] = s.split('/');
    val = Number(a) / Number(b);
  } else {
    val = s === '' ? NaN : Number(s);
  }
  if (percent) val /= 100;
  return Number.isFinite(val) ? val : NaN;
}

function checkTask(task, values) {
  if (task.choices) return values.choice === task.answer;
  return task.fields.every(f => {
    const v = parseNum(values[f.key]);
    const a = task.answer[f.key];
    if (Number.isNaN(v)) return false;
    const tol = task.tolRel ? Math.abs(a) * task.tolRel : (task.tol ?? 1e-6);
    return Math.abs(v - a) <= tol + 1e-9;
  });
}

function answerText(task) {
  if (task.selfCheck) return task.aiAnswer;
  if (task.choices) return task.choices[task.answer];
  return task.fields.map(f => `${f.label.replace(/<[^>]+>/g, '')} ${task.answerFmt?.[f.key] ?? fmtN(task.answer[f.key])}`).join(', ');
}

// ---------- Koordinatensystem als SVG ----------

function plotSvg({ lines = [], parabolas = [], points = [], range = 10 }) {
  const R = range, size = 280, s = size / (2 * R);
  const X = x => ((x + R) * s).toFixed(1);
  const Y = y => ((R - y) * s).toFixed(1);
  const colors = ['#c6573d', '#2b7aaf', '#218c62'];
  let g = '';
  const step = R > 12 ? 2 : 1;
  for (let i = -R; i <= R; i += step) {
    g += `<line x1="${X(i)}" y1="0" x2="${X(i)}" y2="${size}" stroke="currentColor" stroke-opacity=".12"/>`;
    g += `<line x1="0" y1="${Y(i)}" x2="${size}" y2="${Y(i)}" stroke="currentColor" stroke-opacity=".12"/>`;
  }
  g += `<line x1="0" y1="${Y(0)}" x2="${size}" y2="${Y(0)}" stroke="currentColor" stroke-width="1.5"/>`;
  g += `<line x1="${X(0)}" y1="0" x2="${X(0)}" y2="${size}" stroke="currentColor" stroke-width="1.5"/>`;
  const lab = R > 12 ? 5 : 2;
  for (let i = -R + lab; i < R; i += lab) {
    if (i === 0 || i % lab) continue;
    g += `<text x="${X(i)}" y="${+Y(0) + 12}" font-size="9" text-anchor="middle" fill="currentColor" opacity=".7">${i}</text>`;
    g += `<text x="${+X(0) - 4}" y="${+Y(i) + 3}" font-size="9" text-anchor="end" fill="currentColor" opacity=".7">${i}</text>`;
  }
  g += `<text x="${size - 6}" y="${+Y(0) - 5}" font-size="11" text-anchor="end" fill="currentColor">x</text>`;
  g += `<text x="${+X(0) + 6}" y="12" font-size="11" fill="currentColor">y</text>`;
  lines.forEach((l, i) => {
    const c = colors[i % colors.length];
    if (l.vertical !== undefined) {
      g += `<line x1="${X(l.vertical)}" y1="0" x2="${X(l.vertical)}" y2="${size}" stroke="${c}" stroke-width="2.5"/>`;
    } else {
      g += `<line x1="${X(-R)}" y1="${Y(l.m * -R + l.b)}" x2="${X(R)}" y2="${Y(l.m * R + l.b)}" stroke="${c}" stroke-width="2.5"/>`;
    }
    if (l.label) g += `<text x="6" y="${16 + i * 14}" font-size="11" fill="${c}" font-weight="700">${l.label}</text>`;
  });
  parabolas.forEach((p, i) => {
    const c = colors[(i + lines.length) % colors.length];
    const pts = [];
    for (let x = -R; x <= R; x += R / 60) pts.push(`${X(x)},${Y(p.a * (x - p.d) ** 2 + p.e)}`);
    g += `<polyline points="${pts.join(' ')}" fill="none" stroke="${c}" stroke-width="2.5"/>`;
  });
  points.forEach(([x, y, label]) => {
    g += `<circle cx="${X(x)}" cy="${Y(y)}" r="4.5" fill="currentColor"/>`;
    if (label) g += `<text x="${+X(x) + 7}" y="${+Y(y) - 7}" font-size="11" font-weight="700" fill="currentColor">${label}</text>`;
  });
  return `<svg class="plot" viewBox="0 0 ${size} ${size}" role="img" aria-label="Koordinatensystem"><rect width="${size}" height="${size}" fill="none"/>${g}</svg>`;
}

function rangeFor(...vals) {
  const m = Math.max(...vals.map(v => Math.abs(v)));
  return m + 2 <= 10 ? 10 : Math.min(20, Math.ceil((m + 2) / 5) * 5);
}

// ---------- Generatoren ----------

function genLgsPruefen() {
  const x0 = ri(-5, 5), y0 = ri(-5, 5);
  const a1 = rnz(-4, 4), b1 = rnz(-4, 4), a2 = rnz(-4, 4), b2 = rnz(-4, 4);
  const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
  const isSolution = Math.random() < 0.5;
  const px = x0, py = isSolution ? y0 : y0 + pick([-2, -1, 1, 2]);
  const v1 = a1 * px + b1 * py, v2 = a2 * px + b2 * py;
  return {
    q: `Prüfe, ob das Zahlenpaar <b>(${fmtN(px)} | ${fmtN(py)})</b> Lösung des Gleichungssystems ist.
        ${eqLine('(I)', expr([[a1, 'x'], [b1, 'y']]), fmtN(c1))}
        ${eqLine('(II)', expr([[a2, 'x'], [b2, 'y']]), fmtN(c2))}`,
    choices: ['Ja, ist Lösung', 'Nein, keine Lösung'],
    answer: isSolution ? 0 : 1,
    steps: [
      `Setze x = ${fmtN(px)} und y = ${fmtN(py)} in beide Gleichungen ein.`,
      `(I): ${fmtN(a1)}·${paren(px)} + ${paren(b1)}·${paren(py)} = ${fmtN(v1)} ${v1 === c1 ? '✓ stimmt' : '✗ sollte ' + fmtN(c1) + ' sein'}`,
      `(II): ${fmtN(a2)}·${paren(px)} + ${paren(b2)}·${paren(py)} = ${fmtN(v2)} ${v2 === c2 ? '✓ stimmt' : '✗ sollte ' + fmtN(c2) + ' sein'}`,
      isSolution ? 'Beide Gleichungen stimmen, also ist das Paar eine Lösung.' : 'Mindestens eine Gleichung stimmt nicht, also keine Lösung.'
    ]
  };
}

function genGleichsetzen() {
  const x0 = ri(-6, 6), y0 = ri(-8, 8);
  let m1 = rnz(-4, 4), m2 = rnz(-4, 4);
  while (m2 === m1) m2 = rnz(-4, 4);
  const b1 = y0 - m1 * x0, b2 = y0 - m2 * x0;
  const clever = Math.random() < 0.35;
  if (clever) {
    // Geschicktes Gleichsetzen: k·y steht auf beiden Seiten
    const k = pick([2, 3, 5]);
    const a1 = m1, a2 = m2, c1 = k * y0 - a1 * x0, c2 = k * y0 - a2 * x0;
    return {
      q: `Löse das Gleichungssystem durch geschicktes Gleichsetzen.
          ${eqLine('(I)', k + 'y', expr([[a1, 'x'], [c1, '']]))}
          ${eqLine('(II)', k + 'y', expr([[a2, 'x'], [c2, '']]))}`,
      fields: [{ key: 'x', label: 'x =' }, { key: 'y', label: 'y =' }],
      answer: { x: x0, y: y0 },
      steps: [
        `Beide Gleichungen haben links ${k}y. Du musst nicht nach y auflösen, sondern setzt die rechten Seiten gleich:`,
        `${expr([[a1, 'x'], [c1, '']])} = ${expr([[a2, 'x'], [c2, '']])}`,
        `${expr([[a1 - a2, 'x']])} = ${fmtN(c2 - c1)}  →  x = ${fmtN(x0)}`,
        `x in (I): ${k}y = ${fmtN(a1)}·${paren(x0)} ${term(c1, '', false) || '+ 0'} = ${fmtN(k * y0)}  →  y = ${fmtN(y0)}`,
        `L = {(${fmtN(x0)} | ${fmtN(y0)})}`
      ],
      plot: { lines: [{ m: a1 / k, b: c1 / k, label: '(I)' }, { m: a2 / k, b: c2 / k, label: '(II)' }], points: [[x0, y0, 'S']], range: rangeFor(x0, y0) }
    };
  }
  return {
    q: `Löse das Gleichungssystem mit dem Gleichsetzungsverfahren.
        ${eqLine('(I)', 'y', expr([[m1, 'x'], [b1, '']]))}
        ${eqLine('(II)', 'y', expr([[m2, 'x'], [b2, '']]))}`,
    fields: [{ key: 'x', label: 'x =' }, { key: 'y', label: 'y =' }],
    answer: { x: x0, y: y0 },
    steps: [
      'Beide Gleichungen sind nach y aufgelöst. Setze die rechten Seiten gleich:',
      `${expr([[m1, 'x'], [b1, '']])} = ${expr([[m2, 'x'], [b2, '']])}`,
      `Alles mit x nach links, Zahlen nach rechts: ${expr([[m1 - m2, 'x']])} = ${fmtN(b2 - b1)}`,
      `Teile durch ${paren(m1 - m2)}: x = ${fmtN(x0)}`,
      `x in (I) einsetzen: y = ${fmtN(m1)}·${paren(x0)} ${term(b1, '', false)} = ${fmtN(y0)}`,
      `Probe in (II): ${fmtN(m2)}·${paren(x0)} ${term(b2, '', false)} = ${fmtN(y0)} ✓`,
      `L = {(${fmtN(x0)} | ${fmtN(y0)})}. Im Graphen ist das der Schnittpunkt der beiden Geraden.`
    ],
    plot: { lines: [{ m: m1, b: b1, label: '(I)' }, { m: m2, b: b2, label: '(II)' }], points: [[x0, y0, 'S']], range: rangeFor(x0, y0) }
  };
}

function genEinsetzen() {
  const x0 = ri(-6, 6), y0 = ri(-6, 6);
  let m, a, c;
  do { m = rnz(-3, 3); a = rnz(-5, 5); c = rnz(-5, 5); } while (a + c * m === 0);
  const b = y0 - m * x0, e = a * x0 + c * y0;
  return {
    q: `Löse das Gleichungssystem mit dem Einsetzungsverfahren.
        ${eqLine('(I)', 'y', expr([[m, 'x'], [b, '']]))}
        ${eqLine('(II)', expr([[a, 'x'], [c, 'y']]), fmtN(e))}`,
    fields: [{ key: 'x', label: 'x =' }, { key: 'y', label: 'y =' }],
    answer: { x: x0, y: y0 },
    steps: [
      '(I) ist schon nach y aufgelöst. Setze den Term für y in (II) ein:',
      `${expr([[a, 'x']])} ${c < 0 ? '−' : '+'} ${Math.abs(c) === 1 ? '' : Math.abs(c)}(${expr([[m, 'x'], [b, '']])}) = ${fmtN(e)}`,
      `Klammer auflösen: ${expr([[a, 'x'], [c * m, 'x'], [c * b, '']])} = ${fmtN(e)}`,
      `Zusammenfassen: ${expr([[a + c * m, 'x'], [c * b, '']])} = ${fmtN(e)}`,
      `${expr([[a + c * m, 'x']])} = ${fmtN(e - c * b)}  →  x = ${fmtN(x0)}`,
      `x in (I): y = ${fmtN(m)}·${paren(x0)} ${term(b, '', false)} = ${fmtN(y0)}`,
      `L = {(${fmtN(x0)} | ${fmtN(y0)})}`
    ],
    plot: { lines: [{ m, b, label: '(I)' }, { m: -a / c, b: e / c, label: '(II)' }], points: [[x0, y0, 'S']], range: rangeFor(x0, y0) }
  };
}

function genAddition() {
  const x0 = ri(-6, 6), y0 = ri(-6, 6);
  let a1, b1, a2, b2;
  do {
    a1 = rnz(-6, 6); b1 = rnz(-6, 6); a2 = rnz(-6, 6); b2 = rnz(-6, 6);
  } while (a1 * b2 - a2 * b1 === 0 || Math.abs(b1) === Math.abs(a1));
  const c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
  const L = lcm(b1, b2);
  const f1 = L / b1, f2 = -L / b2;
  const na1 = a1 * f1, nc1 = c1 * f1, na2 = a2 * f2, nc2 = c2 * f2;
  const steps = ['Ziel: y fällt beim Addieren weg. Dafür müssen die y-Faktoren Gegenzahlen sein.'];
  if (f1 !== 1) steps.push(`(I) · ${paren(f1)}: ${expr([[na1, 'x'], [b1 * f1, 'y']])} = ${fmtN(nc1)}`);
  if (f2 !== 1) steps.push(`(II) · ${paren(f2)}: ${expr([[na2, 'x'], [b2 * f2, 'y']])} = ${fmtN(nc2)}`);
  steps.push(`Addieren: ${expr([[na1 + na2, 'x']])} = ${fmtN(nc1 + nc2)}  →  x = ${fmtN(x0)}`);
  steps.push(`x in (I): ${fmtN(a1)}·${paren(x0)} ${term(b1, 'y', false)} = ${fmtN(c1)}  →  ${expr([[b1, 'y']])} = ${fmtN(c1 - a1 * x0)}  →  y = ${fmtN(y0)}`);
  steps.push(`L = {(${fmtN(x0)} | ${fmtN(y0)})}`);
  return {
    q: `Löse das Gleichungssystem mit dem Additionsverfahren.
        ${eqLine('(I)', expr([[a1, 'x'], [b1, 'y']]), fmtN(c1))}
        ${eqLine('(II)', expr([[a2, 'x'], [b2, 'y']]), fmtN(c2))}`,
    fields: [{ key: 'x', label: 'x =' }, { key: 'y', label: 'y =' }],
    answer: { x: x0, y: y0 },
    steps,
    plot: { lines: [{ m: -a1 / b1, b: c1 / b1, label: '(I)' }, { m: -a2 / b2, b: c2 / b2, label: '(II)' }], points: [[x0, y0, 'S']], range: rangeFor(x0, y0) }
  };
}

function genAnzahl() {
  const type = ri(0, 2); // 0 genau eine, 1 keine, 2 unendlich viele
  let a1 = rnz(-5, 5), b1 = rnz(-5, 5), c1 = ri(-10, 10);
  let a2, b2, c2;
  if (type === 0) {
    do { a2 = rnz(-5, 5); b2 = rnz(-5, 5); } while (a1 * b2 - a2 * b1 === 0);
    c2 = ri(-10, 10);
  } else {
    const k = pick([-3, -2, 2, 3]);
    a2 = a1 * k; b2 = b1 * k;
    c2 = type === 2 ? c1 * k : c1 * k + pick([-4, -2, 3, 5]);
  }
  const m1 = fracStr(-a1, b1), n1 = fracStr(c1, b1), m2 = fracStr(-a2, b2), n2 = fracStr(c2, b2);
  const reason = [
    `Die Steigungen sind verschieden (${m1} und ${m2}). Die Geraden schneiden sich in genau einem Punkt.`,
    `Gleiche Steigung (${m1}), aber verschiedene y-Achsenabschnitte (${n1} und ${n2}). Die Geraden sind parallel, es gibt keine Lösung.`,
    `Gleiche Steigung und gleicher y-Achsenabschnitt. Die Geraden sind identisch, es gibt unendlich viele Lösungen.`
  ][type];
  return {
    q: `Wie viele Lösungen hat das Gleichungssystem?
        ${eqLine('(I)', expr([[a1, 'x'], [b1, 'y']]), fmtN(c1))}
        ${eqLine('(II)', expr([[a2, 'x'], [b2, 'y']]), fmtN(c2))}`,
    choices: ['genau eine Lösung', 'keine Lösung', 'unendlich viele Lösungen'],
    answer: type,
    steps: [
      'Löse beide Gleichungen nach y auf und vergleiche Steigung und y-Achsenabschnitt.',
      `(I): y = ${m1}·x + (${n1})`,
      `(II): y = ${m2}·x + (${n2})`,
      reason
    ],
    plot: { lines: [{ m: -a1 / b1, b: c1 / b1, label: '(I)' }, { m: -a2 / b2, b: c2 / b2, label: '(II)' }], range: 10 }
  };
}

function genTarif() {
  const tpl = pick([
    { thing: 'E-Scooter-Verleiher', unit: 'Minute', units: 'Minuten', a: 'Scooter24', b: 'TopScooter', base: 'Aktivierungsgebühr', min: 10, max: 40, p: [12, 30], g: [40, 200] },
    { thing: 'Handytarife', unit: 'Gesprächsminute', units: 'Minuten', a: 'Tarif Flex', b: 'Tarif Basic', base: 'Grundgebühr', min: 20, max: 80, p: [5, 15], g: [200, 900] },
    { thing: 'Fahrradverleih', unit: 'Stunde', units: 'Stunden', a: 'CityBike', b: 'RadPlus', base: 'Leihgebühr', min: 2, max: 8, p: [100, 300], g: [200, 1000] }
  ]);
  let x0, p1, p2, g1, g2;
  do {
    x0 = ri(tpl.min, tpl.max);
    p1 = ri(tpl.p[0], tpl.p[1]); p2 = ri(tpl.p[0], tpl.p[1]);
    g1 = Math.round(ri(tpl.g[0], tpl.g[1]) / 10) * 10;
    g2 = g1 + (p1 - p2) * x0;
  } while (p1 === p2 || g2 <= 0 || g2 % 10 !== 0);
  const euro = c => (c / 100).toFixed(2).replace('.', ',') + ' €';
  const y0 = (g1 + p1 * x0) / 100;
  return {
    q: `Zwei ${tpl.thing} im Vergleich:<br>
        <b>${tpl.a}:</b> ${tpl.base} ${euro(g1)}, pro ${tpl.unit} ${euro(p1)}<br>
        <b>${tpl.b}:</b> ${tpl.base} ${euro(g2)}, pro ${tpl.unit} ${euro(p2)}<br>
        Bei wie vielen ${tpl.units} kosten beide gleich viel? Wie hoch ist dann der Preis?`,
    fields: [{ key: 'x', label: tpl.units + ':' }, { key: 'y', label: 'Preis (€):' }],
    answer: { x: x0, y: y0 },
    answerFmt: { y: euro(g1 + p1 * x0) },
    tol: 0.01,
    steps: [
      `x = Anzahl ${tpl.units}, y = Preis in €`,
      `(I) ${tpl.a}: y = ${fmtN(p1 / 100)}x + ${fmtN(g1 / 100)}`,
      `(II) ${tpl.b}: y = ${fmtN(p2 / 100)}x + ${fmtN(g2 / 100)}`,
      `Gleichsetzen: ${fmtN(p1 / 100)}x + ${fmtN(g1 / 100)} = ${fmtN(p2 / 100)}x + ${fmtN(g2 / 100)}`,
      `${fmtN((p1 - p2) / 100)}x = ${fmtN((g2 - g1) / 100)}  →  x = ${x0}`,
      `y = ${fmtN(p1 / 100)}·${x0} + ${fmtN(g1 / 100)} = ${fmtN(y0)}`,
      `Antwortsatz: Bei ${x0} ${tpl.units} zahlt man bei beiden ${euro(g1 + p1 * x0)}.`
    ]
  };
}

function genKino() {
  const tpl = pick([
    { place: 'Im Kino', a: 'Erwachsene', k: 'Kinder', pa: [8, 13], pk: [4, 7] },
    { place: 'Im Freibad', a: 'Erwachsene', k: 'Jugendliche', pa: [4, 7], pk: [2, 3] },
    { place: 'Im Zoo', a: 'Erwachsene', k: 'Kinder', pa: [14, 20], pk: [7, 10] }
  ]);
  const pa = ri(tpl.pa[0], tpl.pa[1]), pk = ri(tpl.pk[0], tpl.pk[1]);
  const E = ri(3, 25), K = ri(3, 30), n = E + K, T = pa * E + pk * K;
  return {
    q: `${tpl.place} kostet der Eintritt für ${tpl.a} ${pa} € und für ${tpl.k} ${pk} €. Eine Gruppe von ${n} Personen zahlt zusammen ${T} €.<br>Wie viele ${tpl.a} und wie viele ${tpl.k} sind in der Gruppe?`,
    fields: [{ key: 'e', label: tpl.a + ':' }, { key: 'k', label: tpl.k + ':' }],
    answer: { e: E, k: K },
    steps: [
      `e = Anzahl ${tpl.a}, k = Anzahl ${tpl.k}`,
      `(I) e + k = ${n}`,
      `(II) ${pa}e + ${pk}k = ${T}`,
      `(I) nach e auflösen: e = ${n} − k`,
      `In (II) einsetzen: ${pa}(${n} − k) + ${pk}k = ${T}  →  ${pa * n} − ${pa - pk}k = ${T}`,
      `${pa - pk}k = ${pa * n - T}  →  k = ${K}`,
      `e = ${n} − ${K} = ${E}`,
      `Antwortsatz: In der Gruppe sind ${E} ${tpl.a} und ${K} ${tpl.k}.`
    ]
  };
}

function genLinAchsen() {
  const x0 = ri(-6, 6), m = rnz(-4, 4), b = -m * x0;
  const asK = Math.random() < 0.5;
  const k = pick([2, 3, 4]);
  const given = asK
    ? eqLine('', k + 'y', expr([[k * m, 'x'], [k * b, '']]))
    : eqLine('', 'y', expr([[m, 'x'], [b, '']]));
  const steps = [];
  if (asK) steps.push(`Erst nach y auflösen, also durch ${k} teilen: y = ${expr([[m, 'x'], [b, '']])}`);
  steps.push(`y-Achsenabschnitt: x = 0 einsetzen → y = ${fmtN(b)}. Schnittpunkt mit der y-Achse: (0 | ${fmtN(b)})`);
  steps.push(`Nullstelle: y = 0 setzen → 0 = ${expr([[m, 'x'], [b, '']])} → ${expr([[m, 'x']])} = ${fmtN(-b)} → x = ${fmtN(x0)}`);
  steps.push(`Schnittpunkt mit der x-Achse: (${fmtN(x0)} | 0)`);
  return {
    q: `Bestimme den y-Achsenabschnitt und die Nullstelle der Geraden.${given}`,
    fields: [{ key: 'b', label: 'y-Achsenabschnitt:' }, { key: 'x', label: 'Nullstelle x =' }],
    answer: { b, x: x0 },
    steps,
    plot: { lines: [{ m, b }], points: [[0, b, ''], [x0, 0, '']], range: rangeFor(b, x0) }
  };
}

function genZweiPunkte() {
  const m = pick([-3, -2, -1, -0.5, 0.5, 1, 2, 3]);
  const b = ri(-5, 5);
  const x1 = ri(-5, 3);
  const dx = Number.isInteger(m) ? ri(1, 4) : pick([2, 4]);
  const x2 = x1 + dx, y1 = m * x1 + b, y2 = m * x2 + b;
  return {
    q: `Eine Gerade geht durch die Punkte <b>P(${fmtN(x1)} | ${fmtN(y1)})</b> und <b>Q(${fmtN(x2)} | ${fmtN(y2)})</b>. Bestimme die Geradengleichung y = mx + b.`,
    fields: [{ key: 'm', label: 'm =' }, { key: 'b', label: 'b =' }],
    answer: { m, b },
    tol: 0.01,
    steps: [
      `Steigung: m = (y₂ − y₁) : (x₂ − x₁) = (${fmtN(y2)} − ${paren(y1)}) : (${fmtN(x2)} − ${paren(x1)}) = ${fmtN(y2 - y1)} : ${fmtN(dx)} = ${fmtN(m)}`,
      `P einsetzen: ${fmtN(y1)} = ${fmtN(m)}·${paren(x1)} + b → b = ${fmtN(y1)} − ${paren(m * x1)} = ${fmtN(b)}`,
      `Geradengleichung: y = ${expr([[m, 'x'], [b, '']])}`
    ],
    plot: { lines: [{ m, b }], points: [[x1, y1, 'P'], [x2, y2, 'Q']], range: rangeFor(y1, y2, x2) }
  };
}

function genScheitelForm() {
  const a = pick([1, -1, 2, -2, 0.5, -0.5, 3]);
  const d = ri(-6, 6), e = ri(-6, 6);
  const inner = d === 0 ? 'x' : `x ${d > 0 ? '−' : '+'} ${Math.abs(d)}`;
  const aStr = a === 1 ? '' : a === -1 ? '−' : fmtN(a);
  const f = `y = ${aStr}(${inner})²${term(e, '', false)}`;
  return {
    q: `Gib den Scheitelpunkt der Parabel an.<div class="eq">${f}</div>`,
    fields: [{ key: 'd', label: 'x<sub>S</sub> =' }, { key: 'e', label: 'y<sub>S</sub> =' }],
    answer: { d, e },
    steps: [
      'Die Parabel steht in Scheitelpunktform y = a(x − d)² + e. Dann ist S(d | e).',
      `Aus (${inner})² liest du d = ${fmtN(d)} ab. Achtung: Das Vorzeichen dreht sich um!`,
      `e = ${fmtN(e)}, also S(${fmtN(d)} | ${fmtN(e)}).`,
      a > 0 ? `a = ${fmtN(a)} ist positiv: Die Parabel ist nach oben geöffnet, S ist der tiefste Punkt.` : `a = ${fmtN(a)} ist negativ: Die Parabel ist nach unten geöffnet, S ist der höchste Punkt.`
    ],
    plot: { parabolas: [{ a, d, e }], points: [[d, e, 'S']], range: rangeFor(d, e) }
  };
}

function genErgaenzung() {
  const p = pick([-10, -8, -6, -4, -2, 2, 4, 6, 8, 10]);
  const q = ri(-8, 12);
  const h = p / 2, d = -h, e = q - h * h;
  return {
    q: `Bestimme mit quadratischer Ergänzung den Scheitelpunkt.<div class="eq">y = ${expr([[1, 'x²'], [p, 'x'], [q, '']])}</div>`,
    fields: [{ key: 'd', label: 'x<sub>S</sub> =' }, { key: 'e', label: 'y<sub>S</sub> =' }],
    answer: { d, e },
    steps: [
      `Halbiere die Zahl vor x: ${fmtN(p)} : 2 = ${fmtN(h)}. Quadriere sie: ${paren(h)}² = ${fmtN(h * h)}.`,
      `Ergänzen und gleich wieder abziehen: y = x² ${term(p, 'x', false)} + ${fmtN(h * h)} − ${fmtN(h * h)} ${term(q, '', false)}`,
      `Binomische Formel: y = (x ${h > 0 ? '+' : '−'} ${Math.abs(h)})² ${term(e, '', false) || '+ 0'}`,
      `Scheitelpunkt S(${fmtN(d)} | ${fmtN(e)})`
    ],
    plot: { parabolas: [{ a: 1, d, e }], points: [[d, e, 'S']], range: rangeFor(d, e) }
  };
}

function genPq() {
  let r1 = ri(-9, 9), r2 = ri(-9, 9);
  while (r2 === r1) r2 = ri(-9, 9);
  if (r1 > r2) [r1, r2] = [r2, r1];
  const p = -(r1 + r2), q = r1 * r2;
  const a = Math.random() < 0.3 ? pick([2, 3, -1, -2]) : 1;
  const h = p / 2, D = h * h - q, w = Math.sqrt(D);
  const steps = [];
  if (a !== 1) steps.push(`Erst durch ${paren(a)} teilen, damit vor x² eine 1 steht: x² ${term(p, 'x', false)} ${term(q, '', false)} = 0`);
  steps.push(`p = ${fmtN(p)}, q = ${fmtN(q)}`);
  steps.push(`pq-Formel: x = −p/2 ± √((p/2)² − q) = ${fmtN(-h)} ± √(${fmtN(h * h)} − ${paren(q)})`);
  steps.push(`= ${fmtN(-h)} ± √${fmtN(D)} = ${fmtN(-h)} ± ${fmtN(w)}`);
  steps.push(`x₁ = ${fmtN(r1)}, x₂ = ${fmtN(r2)}`);
  steps.push(`Probe: ${paren(r1)}² ${term(p, '', false)}·${paren(r1)} ${term(q, '', false)} = 0 ✓`);
  return {
    q: `Löse die quadratische Gleichung.<div class="eq">${expr([[a, 'x²'], [a * p, 'x'], [a * q, '']])} = 0</div><p class="note">Kleinere Lösung zuerst.</p>`,
    fields: [{ key: 'x1', label: 'x₁ =' }, { key: 'x2', label: 'x₂ =' }],
    answer: { x1: r1, x2: r2 },
    steps,
    plot: { parabolas: [{ a, d: -h, e: -a * D }], points: [[r1, 0, 'x₁'], [r2, 0, 'x₂']], range: rangeFor(r1, r2) }
  };
}

function genQuadAnzahl() {
  const type = ri(0, 2); // 0 keine, 1 eine, 2 zwei
  const p = pick([-8, -6, -4, -2, 2, 4, 6, 8]);
  const h = p / 2;
  const q = type === 1 ? h * h : type === 0 ? h * h + ri(1, 9) : h * h - ri(1, 15);
  const D = h * h - q;
  return {
    q: `Wie viele Lösungen hat die Gleichung?<div class="eq">${expr([[1, 'x²'], [p, 'x'], [q, '']])} = 0</div>`,
    choices: ['keine Lösung', 'genau eine Lösung', 'zwei Lösungen'],
    answer: type,
    steps: [
      'Entscheidend ist der Term unter der Wurzel in der pq-Formel: D = (p/2)² − q.',
      `D = ${paren(h)}² − ${paren(q)} = ${fmtN(D)}`,
      D < 0 ? 'D ist negativ: Aus einer negativen Zahl kann man keine Wurzel ziehen. Keine Lösung.' : D === 0 ? 'D = 0: genau eine Lösung (die Parabel berührt die x-Achse).' : 'D ist positiv: zwei Lösungen.'
    ],
    plot: { parabolas: [{ a: 1, d: -h, e: -D }], range: rangeFor(h, D) }
  };
}

function genWurzel() {
  if (Math.random() < 0.65) {
    const k = ri(2, 7), r = pick([2, 3, 5, 6, 7, 10]);
    const n = k * k * r;
    return {
      q: `Ziehe teilweise die Wurzel. Schreibe als a·√b mit möglichst kleinem b.<div class="eq">√${n}</div>`,
      fields: [{ key: 'a', label: 'a =' }, { key: 'b', label: 'b =' }],
      answer: { a: k, b: r },
      steps: [
        `Suche die größte Quadratzahl, die in ${n} steckt: ${n} = ${k * k} · ${r}`,
        `√${n} = √${k * k} · √${r} = ${k}·√${r}`
      ]
    };
  }
  const r = pick([2, 3, 5, 6]), m = ri(1, 4), n = ri(2, 5);
  const x = r * m * m, y = r * n * n;
  return {
    q: `Berechne ohne Taschenrechner.<div class="eq">√${x} · √${y}</div>`,
    fields: [{ key: 'v', label: 'Ergebnis:' }],
    answer: { v: r * m * n },
    steps: [
      `Wurzeln darf man zusammenfassen: √${x} · √${y} = √(${x} · ${y}) = √${x * y}`,
      `√${x * y} = ${r * m * n}, denn ${r * m * n}² = ${x * y}`
    ]
  };
}

function genPotenz() {
  const v = ri(0, 4);
  const base = pick(['a', 'x', 'b']);
  if (v === 0) {
    const m = rnz(-5, 9), n = rnz(-5, 9);
    return {
      q: `Vereinfache zu einer Potenz.<div class="eq">${pow(base, m)} · ${pow(base, n)} = ${pow(base, '?')}</div>`,
      fields: [{ key: 'e', label: 'Exponent:' }], answer: { e: m + n },
      steps: [`Gleiche Basis multiplizieren: Exponenten addieren.`, `${m} + ${paren(n)} = ${m + n}, also ${pow(base, m + n)}`]
    };
  }
  if (v === 1) {
    const m = rnz(-4, 12), n = rnz(-4, 9);
    return {
      q: `Vereinfache zu einer Potenz.<div class="eq">${pow(base, m)} : ${pow(base, n)} = ${pow(base, '?')}</div>`,
      fields: [{ key: 'e', label: 'Exponent:' }], answer: { e: m - n },
      steps: [`Gleiche Basis dividieren: Exponenten subtrahieren.`, `${m} − ${paren(n)} = ${m - n}, also ${pow(base, m - n)}`]
    };
  }
  if (v === 2) {
    const m = rnz(-4, 6), n = rnz(-3, 5);
    return {
      q: `Vereinfache zu einer Potenz.<div class="eq">(${pow(base, m)})<sup>${n}</sup> = ${pow(base, '?')}</div>`,
      fields: [{ key: 'e', label: 'Exponent:' }], answer: { e: m * n },
      steps: [`Potenz potenzieren: Exponenten multiplizieren.`, `${m} · ${paren(n)} = ${m * n}, also ${pow(base, m * n)}`]
    };
  }
  if (v === 3) {
    const b = pick([2, 3, 4, 5, 10]), n = ri(1, b === 10 ? 3 : 3);
    const val = Math.pow(b, n);
    return {
      q: `Berechne. Du darfst einen Bruch eingeben (z. B. 1/8).<div class="eq">${pow(b, -n)}</div>`,
      fields: [{ key: 'v', label: 'Ergebnis:' }], answer: { v: 1 / val }, answerFmt: { v: '1/' + val }, tol: 1e-6,
      steps: [`Negativer Exponent bedeutet Kehrwert: ${pow(b, -n)} = 1 / ${pow(b, n)}`, `= 1/${val}`]
    };
  }
  // Wissenschaftliche Schreibweise
  const mant = ri(11, 99) / 10;
  const exp = pick([-6, -5, -4, -3, 3, 4, 5, 6, 7]);
  const numStr = (mant * Math.pow(10, exp)).toFixed(exp < 0 ? -exp + 1 : 0).replace('.', ',');
  return {
    q: `Schreibe in wissenschaftlicher Schreibweise.<div class="eq">${numStr} = ${fmtN(mant)} · ${pow(10, '?')}</div>`,
    fields: [{ key: 'e', label: 'Exponent:' }], answer: { e: exp },
    steps: [
      exp > 0 ? `Das Komma wandert ${exp} Stellen nach links, bis eine Zahl zwischen 1 und 10 dasteht.` : `Das Komma wandert ${-exp} Stellen nach rechts, bis eine Zahl zwischen 1 und 10 dasteht.`,
      exp > 0 ? 'Große Zahl → positiver Exponent.' : 'Kleine Zahl (kleiner als 1) → negativer Exponent.',
      `${numStr} = ${fmtN(mant)} · ${pow(10, exp)}`
    ]
  };
}

function genPythagoras() {
  const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15]];
  const exact = Math.random() < 0.4;
  let a, b, c;
  if (exact) {
    const t = pick(triples), k = pick([1, 1, 2]);
    [a, b, c] = t.map(v => v * k);
  } else {
    a = ri(3, 15); b = ri(3, 15); c = Math.sqrt(a * a + b * b);
  }
  const findLeg = Math.random() < 0.4 && exact;
  if (findLeg) {
    return {
      q: `In einem rechtwinkligen Dreieck ist die Hypotenuse c = ${c} cm und die Kathete a = ${a} cm lang. Berechne die Kathete b.`,
      fields: [{ key: 'b', label: 'b (cm) =' }], answer: { b }, tol: 0.05,
      steps: [`Satz des Pythagoras: a² + b² = c², also b² = c² − a²`, `b² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}`, `b = √${b * b} = ${b} cm`]
    };
  }
  const cr = Math.round(c * 10) / 10;
  return {
    q: `Ein rechtwinkliges Dreieck hat die Katheten a = ${a} cm und b = ${b} cm. Berechne die Hypotenuse c. ${exact ? '' : '(Runde auf eine Nachkommastelle.)'}`,
    fields: [{ key: 'c', label: 'c (cm) =' }], answer: { c: cr }, tol: 0.051,
    steps: [`Satz des Pythagoras: c² = a² + b²`, `c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}`, `c = √${a * a + b * b} ${exact ? '=' : '≈'} ${fmtN(cr)} cm`]
  };
}

function genZylinder() {
  const r = ri(2, 9), h = ri(3, 15);
  const volume = Math.random() < 0.6;
  if (volume) {
    const V = Math.PI * r * r * h;
    return {
      q: `Ein Zylinder hat den Radius r = ${r} cm und die Höhe h = ${h} cm. Berechne das Volumen (auf ganze cm³ gerundet).`,
      fields: [{ key: 'v', label: 'V (cm³) ≈' }], answer: { v: Math.round(V) }, tolRel: 0.006,
      steps: [`V = π · r² · h`, `V = π · ${r}² · ${h} = π · ${r * r * h}`, `V ≈ ${Math.round(V)} cm³`]
    };
  }
  const O = 2 * Math.PI * r * r + 2 * Math.PI * r * h;
  return {
    q: `Ein Zylinder hat den Radius r = ${r} cm und die Höhe h = ${h} cm. Berechne die Oberfläche (auf ganze cm² gerundet).`,
    fields: [{ key: 'o', label: 'O (cm²) ≈' }], answer: { o: Math.round(O) }, tolRel: 0.006,
    steps: [`O = 2 · Grundfläche + Mantel = 2πr² + 2πr·h`, `O = 2π·${r}² + 2π·${r}·${h} = π·(${2 * r * r} + ${2 * r * h}) = π·${2 * r * r + 2 * r * h}`, `O ≈ ${Math.round(O)} cm²`]
  };
}

function genWahrscheinlichkeit() {
  const red = ri(2, 7), blue = ri(2, 7), n = red + blue;
  const back = Math.random() < 0.4;
  const num = back ? red * red : red * (red - 1);
  const den = back ? n * n : n * (n - 1);
  return {
    q: `In einer Urne liegen ${red} rote und ${blue} blaue Kugeln. Du ziehst zweimal ${back ? 'mit' : 'ohne'} Zurücklegen. Wie groß ist die Wahrscheinlichkeit, zwei rote Kugeln zu ziehen? (Bruch, Dezimalzahl oder Prozent)`,
    fields: [{ key: 'p', label: 'P =' }], answer: { p: num / den }, answerFmt: { p: fracStr(num, den) }, tol: 0.002,
    steps: [
      `Erster Zug: P(rot) = ${red}/${n}`,
      back ? `Mit Zurücklegen bleibt alles gleich: zweiter Zug ${red}/${n}` : `Ohne Zurücklegen ist eine rote Kugel weniger drin: zweiter Zug ${red - 1}/${n - 1}`,
      `Pfadregel (multiplizieren): ${red}/${n} · ${back ? red : red - 1}/${back ? n : n - 1} = ${num}/${den} = ${fracStr(num, den)} ≈ ${fmtN(Math.round(num / den * 1000) / 10)} %`
    ]
  };
}

// ---------- Themenliste ----------

const MATH_TOPICS = [
  { id: 'lgs-pruefen',      group: 'Lineare Gleichungssysteme', name: 'Zahlenpaare prüfen',        gen: genLgsPruefen },
  { id: 'lgs-gleichsetzen', group: 'Lineare Gleichungssysteme', name: 'Gleichsetzungsverfahren',   gen: genGleichsetzen },
  { id: 'lgs-einsetzen',    group: 'Lineare Gleichungssysteme', name: 'Einsetzungsverfahren',      gen: genEinsetzen },
  { id: 'lgs-addition',     group: 'Lineare Gleichungssysteme', name: 'Additionsverfahren',        gen: genAddition },
  { id: 'lgs-anzahl',       group: 'Lineare Gleichungssysteme', name: 'Anzahl der Lösungen',       gen: genAnzahl },
  { id: 'lgs-tarif',        group: 'Lineare Gleichungssysteme', name: 'Textaufgaben: Tarife',      gen: genTarif },
  { id: 'lgs-kino',         group: 'Lineare Gleichungssysteme', name: 'Textaufgaben: Eintritt',    gen: genKino },
  { id: 'lin-achsen',       group: 'Lineare Funktionen',        name: 'Achsenschnittpunkte',       gen: genLinAchsen },
  { id: 'lin-punkte',       group: 'Lineare Funktionen',        name: 'Gerade durch zwei Punkte',  gen: genZweiPunkte },
  { id: 'quad-scheitel',    group: 'Quadratische Funktionen',   name: 'Scheitelpunkt ablesen',     gen: genScheitelForm },
  { id: 'quad-ergaenzung',  group: 'Quadratische Funktionen',   name: 'Quadratische Ergänzung',    gen: genErgaenzung },
  { id: 'quad-pq',          group: 'Quadratische Funktionen',   name: 'pq-Formel',                 gen: genPq },
  { id: 'quad-anzahl',      group: 'Quadratische Funktionen',   name: 'Anzahl der Lösungen',       gen: genQuadAnzahl },
  { id: 'wurzeln',          group: 'Wurzeln & Potenzen',        name: 'Wurzeln vereinfachen',      gen: genWurzel },
  { id: 'potenzen',         group: 'Wurzeln & Potenzen',        name: 'Potenzgesetze',             gen: genPotenz },
  { id: 'pythagoras',       group: 'Geometrie',                 name: 'Satz des Pythagoras',       gen: genPythagoras },
  { id: 'zylinder',         group: 'Geometrie',                 name: 'Zylinder',                  gen: genZylinder },
  { id: 'stochastik',       group: 'Wahrscheinlichkeit',        name: 'Zweistufige Zufallsversuche', gen: genWahrscheinlichkeit }
];

function getMathTopic(id) {
  return MATH_TOPICS.find(t => t.id === id);
}

function makeTask(topicId) {
  const topic = getMathTopic(topicId);
  const task = topic.gen();
  task.topicId = topicId;
  task.topicName = topic.name;
  task.id = uid();
  return task;
}

// Aufgaben aus KI-Sets in das gleiche Format bringen
function taskFromAi(item, setTitle) {
  const nums = String(item.answer ?? '').match(/-?\d+(?:[.,]\d+)?(?:\/\d+)?/g) || [];
  const numeric = item.answerType !== 'text' && nums.length > 0 && nums.length <= 3;
  const task = {
    id: uid(),
    topicId: 'ki',
    topicName: setTitle,
    q: esc(item.question || '').replace(/\n/g, '<br>'),
    steps: (item.steps || []).map(s => esc(s)),
    aiAnswer: String(item.answer ?? '')
  };
  if (numeric) {
    task.fields = nums.map((n, i) => ({ key: 'v' + i, label: nums.length > 1 ? `Wert ${i + 1}:` : 'Ergebnis:' }));
    task.answer = {};
    nums.forEach((n, i) => { task.answer['v' + i] = parseNum(n); });
    task.answerFmt = {};
    nums.forEach((n, i) => { task.answerFmt['v' + i] = n.replace('.', ','); });
    task.tol = 0.011;
    if (nums.length > 1) task.q += '<p class="note">Gib die Werte in der Reihenfolge ein, wie sie in der Lösung vorkommen.</p>';
  } else {
    task.selfCheck = true;
  }
  return task;
}
