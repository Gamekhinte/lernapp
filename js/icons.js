// Schlichte Strich-Icons (24er Raster, Farbe kommt vom Text) und Fach-Kürzel statt Emojis.

const ICON_PATHS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  books: '<path d="M4 4h5v16H4z"/><path d="M9 4h5v16H9z"/><path d="M14.5 5.5l4.5-1 2.5 14.5-4.5 1z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  camera: '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13.5" r="3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  folder: '<path d="M3 6h7l2 2h9v11H3z"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  play: '<path d="M7 5l12 7-12 7z"/>',
  repeat: '<path d="M4 12a8 8 0 0 1 14-5l2 2"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5l-2-2"/><path d="M4 20v-5h5"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.8"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 16l-5-5-8 8"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2 6"/><path d="M20 4v7h-7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5M4 4h16"/>',
  note: '<path d="M6 3h10l3 3v15H6z"/><path d="M9 9h7M9 13h7M9 17h4"/><path d="M3 6h3M3 10h3M3 14h3"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  shuffle: '<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4"/><path d="M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="1"/><path d="M6 10h1M10 10h1M14 10h1M18 10h0M7 14h10"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  speaker: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  flame: '<path d="M12 21c-4 0-6-3-6-6 0-4 4-6 4-10 3 2 4 4 4 6 1-1 1.5-2 1.5-3 2 2 2.5 4.5 2.5 7 0 3-2 6-6 6z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.4l-5.6 2.9 1.1-6.2L3 9.7l6.2-.9z"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/>',
  pen: '<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M4 20h16"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
  sparkle: '<path d="M12 4v4M12 16v4M4 12h4M16 12h4M7 7l2 2M15 15l2 2M7 17l2-2M15 9l2-2"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  cards: '<rect x="3" y="7" width="13" height="14" rx="1"/><path d="M7 7V4h13v14h-4"/>',
  choice: '<circle cx="6" cy="7" r="2"/><circle cx="6" cy="17" r="2"/><path d="M11 7h9M11 17h9"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17v.5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  medal: '<circle cx="12" cy="15" r="5"/><path d="M8 3l2 7M16 3l-2 7M9 3h6"/>'
};

function icon(name, size = 18) {
  const p = ICON_PATHS[name];
  if (!p) return '';
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

// Farbiges Kästchen mit Fach-Kürzel
function subjectAbbr(s) {
  if (s.abbr) return s.abbr;
  const words = String(s.name || '?').split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[1][0] : s.name.slice(0, 2)).toUpperCase();
}

function subjectBadge(s, size = 'md') {
  return `<span class="subj-badge ${size}" style="--subject:${s.color}; color:${getContrastColor(s.color)}">${esc(subjectAbbr(s))}</span>`;
}
