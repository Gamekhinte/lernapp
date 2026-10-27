// Feste Daten: Supabase, Fächer, Themes, Sprachen.

// Bei jedem Update hochzählen (zusammen mit ?v= in index.html und dem Cache-Namen in sw.js)
const APP_VERSION = 20;

// Der Publishable Key darf im Browser stehen. Der service_role Key darf niemals hier hinein.
const SUPABASE_URL = 'https://jxkcxfmutaxmhifgbufv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4OZSol8T0c0TRVwRVgyAHQ_9WAhw-Zf';
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// kind: 'sprache' = Vokabeln, 'mathe' = Aufgaben-Generatoren, 'sach' = Lernkarten und Quiz
const BASE_SUBJECTS = [
  { id: 'englisch',     name: 'Englisch',     abbr: 'E', kind: 'sprache', lang: 'en', color: '#2b7aaf' },
  { id: 'franzoesisch', name: 'Französisch',  abbr: 'F', kind: 'sprache', lang: 'fr', color: '#7056b8' },
  { id: 'mathe',        name: 'Mathe',        abbr: 'M', kind: 'mathe',               color: '#c6573d' },
  { id: 'geschichte',   name: 'Geschichte',   abbr: 'G', kind: 'sach',                color: '#b7791f' },
  { id: 'erdkunde',     name: 'Erdkunde',     abbr: 'Ek', kind: 'sach',                color: '#218c62' },
  { id: 'biologie',     name: 'Biologie',     abbr: 'Bio', kind: 'sach',                color: '#2a6f4e' },
  { id: 'deutsch',      name: 'Deutsch',      abbr: 'D', kind: 'sach',                color: '#a83232' },
  { id: 'chemie',       name: 'Chemie',       abbr: 'Ch', kind: 'sach',                color: '#176b87' },
  { id: 'physik',       name: 'Physik',       abbr: 'Ph', kind: 'sach',                color: '#4a4a4a' },
  { id: 'powi',         name: 'PoWi',         abbr: 'PW', kind: 'sach',                color: '#c43d65' },
  { id: 'religion',     name: 'Religion',     abbr: 'Rel', kind: 'sach',                color: '#8a6d3b' }
];

const THEMES = {
  classic:  { name: 'Classic',  paper: '#f4efdf', card: '#fdfbf7', ink: '#1a1816', muted: '#6b675e', rule: '#ded6c5', button: '#8b3a2b' },
  sky:      { name: 'Sky',      paper: '#edf8ff', card: '#fbfeff', ink: '#102a43', muted: '#486581', rule: '#b9dced', button: '#2b7aaf' },
  mint:     { name: 'Mint',     paper: '#effcf5', card: '#fbfffd', ink: '#173d2a', muted: '#527364', rule: '#bde5cf', button: '#218c62' },
  lemon:    { name: 'Lemon',    paper: '#fffbe6', card: '#fffef7', ink: '#3d3510', muted: '#776a34', rule: '#eadf9a', button: '#b7791f' },
  blush:    { name: 'Blush',    paper: '#fff1f4', card: '#fffafb', ink: '#4a1d2a', muted: '#865365', rule: '#f2c4d0', button: '#c43d65' },
  ocean:    { name: 'Ocean',    paper: '#dbeafe', card: '#f5f9ff', ink: '#102a43', muted: '#486581', rule: '#9fbcd3', button: '#176b87' },
  forest:   { name: 'Forest',   paper: '#e7f2e5', card: '#f8fcf7', ink: '#173d2a', muted: '#557662', rule: '#b8d2b7', button: '#2a6f4e' },
  sunset:   { name: 'Sunset',   paper: '#fff0df', card: '#fffaf4', ink: '#4a2114', muted: '#8a5a4a', rule: '#f1c6a7', button: '#c6573d' },
  lavender: { name: 'Lavender', paper: '#f0ebff', card: '#fbf9ff', ink: '#30264f', muted: '#71658e', rule: '#cec4ec', button: '#7056b8' },
  mono:     { name: 'Mono',     paper: '#e9e9e9', card: '#fafafa', ink: '#161616', muted: '#626262', rule: '#bcbcbc', button: '#4a4a4a' },
  candy:    { name: 'Candy',    paper: '#ffe7f0', card: '#fff8fb', ink: '#4d1632', muted: '#8a5570', rule: '#efb7ce', button: '#e64980' },
  night:    { name: 'Night',    paper: '#1d2735', card: '#263345', ink: '#f4efdf', muted: '#bbc7d6', rule: '#526273', button: '#8a5cf6' }
};

const FOLDER_COLORS = ['#8b3a2b', '#2b7aaf', '#218c62', '#b7791f', '#c43d65', '#7056b8', '#176b87', '#4a4a4a'];

// Google Translate style comprehensive language list, sorted alphabetically in German
const LANGUAGES = [
  { code: 'auto', name: 'Automatisch erkennen', tts: 'en-US', speech: 'en-US' },
  { code: 'af', name: 'Afrikaans', tts: 'af-ZA', speech: 'af-ZA' },
  { code: 'sq', name: 'Albanisch', tts: 'sq-AL', speech: 'sq-AL' },
  { code: 'am', name: 'Amharisch', tts: 'am-ET', speech: 'am-ET' },
  { code: 'ar', name: 'Arabisch', tts: 'ar-SA', speech: 'ar-SA' },
  { code: 'hy', name: 'Armenisch', tts: 'hy-AM', speech: 'hy-AM' },
  { code: 'az', name: 'Aserbaidschanisch', tts: 'az-AZ', speech: 'az-AZ' },
  { code: 'eu', name: 'Baskisch', tts: 'eu-ES', speech: 'eu-ES' },
  { code: 'bn', name: 'Bengalisch', tts: 'bn-BD', speech: 'bn-BD' },
  { code: 'bs', name: 'Bosnisch', tts: 'bs-BA', speech: 'bs-BA' },
  { code: 'bg', name: 'Bulgarisch', tts: 'bg-BG', speech: 'bg-BG' },
  { code: 'da', name: 'Dänisch', tts: 'da-DK', speech: 'da-DK' },
  { code: 'de', name: 'Deutsch', tts: 'de-DE', speech: 'de-DE' },
  { code: 'en', name: 'Englisch', tts: 'en-US', speech: 'en-US' },
  { code: 'eo', name: 'Esperanto', tts: 'eo', speech: 'eo' },
  { code: 'et', name: 'Estnisch', tts: 'et-EE', speech: 'et-EE' },
  { code: 'fi', name: 'Finnisch', tts: 'fi-FI', speech: 'fi-FI' },
  { code: 'fr', name: 'Französisch', tts: 'fr-FR', speech: 'fr-FR' },
  { code: 'gl', name: 'Galizisch', tts: 'gl-ES', speech: 'gl-ES' },
  { code: 'ka', name: 'Georgisch', tts: 'ka-GE', speech: 'ka-GE' },
  { code: 'el', name: 'Griechisch', tts: 'el-GR', speech: 'el-GR' },
  { code: 'gu', name: 'Gujarati', tts: 'gu-IN', speech: 'gu-IN' },
  { code: 'he', name: 'Hebräisch', tts: 'he-IL', speech: 'he-IL' },
  { code: 'hi', name: 'Hindi', tts: 'hi-IN', speech: 'hi-IN' },
  { code: 'id', name: 'Indonesisch', tts: 'id-ID', speech: 'id-ID' },
  { code: 'ga', name: 'Irisch', tts: 'ga-IE', speech: 'ga-IE' },
  { code: 'is', name: 'Isländisch', tts: 'is-IS', speech: 'is-IS' },
  { code: 'it', name: 'Italienisch', tts: 'it-IT', speech: 'it-IT' },
  { code: 'ja', name: 'Japanisch', tts: 'ja-JP', speech: 'ja-JP' },
  { code: 'jv', name: 'Javanisch', tts: 'jv-ID', speech: 'jv-ID' },
  { code: 'yi', name: 'Jiddisch', tts: 'yi', speech: 'yi' },
  { code: 'kn', name: 'Kannada', tts: 'kn-IN', speech: 'kn-IN' },
  { code: 'kk', name: 'Kasachisch', tts: 'kk-KZ', speech: 'kk-KZ' },
  { code: 'km', name: 'Khmer', tts: 'km-KH', speech: 'km-KH' },
  { code: 'ko', name: 'Koreanisch', tts: 'ko-KR', speech: 'ko-KR' },
  { code: 'hr', name: 'Kroatisch', tts: 'hr-HR', speech: 'hr-HR' },
  { code: 'ku', name: 'Kurdisch', tts: 'ku-TR', speech: 'ku-TR' },
  { code: 'la', name: 'Latein', tts: 'la', speech: 'la' },
  { code: 'lv', name: 'Lettisch', tts: 'lv-LV', speech: 'lv-LV' },
  { code: 'lt', name: 'Litauisch', tts: 'lt-LT', speech: 'lt-LT' },
  { code: 'lb', name: 'Luxemburgisch', tts: 'lb-LU', speech: 'lb-LU' },
  { code: 'ms', name: 'Malaiisch', tts: 'ms-MY', speech: 'ms-MY' },
  { code: 'ml', name: 'Malayalam', tts: 'ml-IN', speech: 'ml-IN' },
  { code: 'mt', name: 'Maltesisch', tts: 'mt-MT', speech: 'mt-MT' },
  { code: 'mr', name: 'Marathi', tts: 'mr-IN', speech: 'mr-IN' },
  { code: 'mn', name: 'Mongolisch', tts: 'mn-MN', speech: 'mn-MN' },
  { code: 'ne', name: 'Nepalesisch', tts: 'ne-NP', speech: 'ne-NP' },
  { code: 'nl', name: 'Niederländisch', tts: 'nl-NL', speech: 'nl-NL' },
  { code: 'no', name: 'Norwegisch', tts: 'no-NO', speech: 'no-NO' },
  { code: 'fa', name: 'Persisch', tts: 'fa-IR', speech: 'fa-IR' },
  { code: 'pl', name: 'Polnisch', tts: 'pl-PL', speech: 'pl-PL' },
  { code: 'pt', name: 'Portugiesisch', tts: 'pt-PT', speech: 'pt-PT' },
  { code: 'ro', name: 'Rumänisch', tts: 'ro-RO', speech: 'ro-RO' },
  { code: 'ru', name: 'Russisch', tts: 'ru-RU', speech: 'ru-RU' },
  { code: 'sv', name: 'Schwedisch', tts: 'sv-SE', speech: 'sv-SE' },
  { code: 'sr', name: 'Serbisch', tts: 'sr-RS', speech: 'sr-RS' },
  { code: 'sk', name: 'Slowakisch', tts: 'sk-SK', speech: 'sk-SK' },
  { code: 'sl', name: 'Slowenisch', tts: 'sl-SI', speech: 'sl-SI' },
  { code: 'es', name: 'Spanisch', tts: 'es-ES', speech: 'es-ES' },
  { code: 'sw', name: 'Swahili', tts: 'sw-KE', speech: 'sw-KE' },
  { code: 'tl', name: 'Tagalog (Filipino)', tts: 'fil-PH', speech: 'fil-PH' },
  { code: 'ta', name: 'Tamil', tts: 'ta-IN', speech: 'ta-IN' },
  { code: 'th', name: 'Thailändisch', tts: 'th-TH', speech: 'th-TH' },
  { code: 'cs', name: 'Tschechisch', tts: 'cs-CZ', speech: 'cs-CZ' },
  { code: 'tr', name: 'Türkisch', tts: 'tr-TR', speech: 'tr-TR' },
  { code: 'uk', name: 'Ukrainisch', tts: 'uk-UA', speech: 'uk-UA' },
  { code: 'hu', name: 'Ungarisch', tts: 'hu-HU', speech: 'hu-HU' },
  { code: 'ur', name: 'Urdu', tts: 'ur-PK', speech: 'ur-PK' },
  { code: 'vi', name: 'Vietnamesisch', tts: 'vi-VN', speech: 'vi-VN' },
  { code: 'cy', name: 'Walisisch', tts: 'cy-GB', speech: 'cy-GB' },
  { code: 'zh', name: 'Chinesisch (Mandarin)', tts: 'zh-CN', speech: 'zh-CN' }
].sort((a, b) => a.name.localeCompare(b.name, 'de'));

function getLangConfig(code) {
  return LANGUAGES.find(l => l.code === code) || { code: 'en', name: 'Englisch', tts: 'en-US', speech: 'en-US' };
}
