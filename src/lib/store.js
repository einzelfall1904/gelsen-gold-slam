// Speichert alle Turnierdaten in einer JSON-Datei (data/turnier.json).
// Für den lokalen Testbetrieb genügt das; für den Live-Betrieb im Internet
// wird dieser Speicher später durch ein Redaktionssystem (z. B. Sanity) ersetzt.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { seedDaten } from './seed.js';
import { auswerten } from './tennis.js';

export const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const FILE = path.join(DATA_DIR, 'turnier.json');

export function ladeDaten() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    speichereRoh(seedDaten());
  }
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function speichereRoh(daten) {
  const tmp = FILE + '.' + crypto.randomBytes(4).toString('hex') + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(daten, null, 2));
  fs.renameSync(tmp, FILE);
}

const LISTEN = ['konkurrenzen', 'spieler', 'spiele', 'ablauf', 'sponsoren', 'galerie'];

/** Prüft und speichert die Daten aus der Verwaltung. Gibt Fehler zurück, falls ungültig. */
export function speichereDaten(neu) {
  const fehler = [];
  if (!neu || typeof neu !== 'object' || typeof neu.einstellungen !== 'object') {
    return { ok: false, fehler: ['Ungültiges Datenformat.'] };
  }
  for (const l of LISTEN) if (!Array.isArray(neu[l])) fehler.push(`„${l}“ fehlt oder ist keine Liste.`);
  if (fehler.length) return { ok: false, fehler };

  const zw = neu.einstellungen.zaehlweise === 'satz' ? 'satz' : 'mtb';
  for (const sp of neu.spiele) {
    const r = auswerten(sp, zw);
    if (!r.ok) fehler.push(`Spiel ${sp.zeit || ''} Platz ${sp.platz || '?'}: ${r.fehler.join(' ')}`);
    sp.sieger = r.sieger;
  }
  if (fehler.length) return { ok: false, fehler };

  neu.aktualisiert = new Date().toISOString();
  speichereRoh(neu);
  return { ok: true, daten: neu };
}

export function zuruecksetzen() {
  const d = seedDaten();
  speichereRoh(d);
  return d;
}

/** Öffentliche Sicht: nur Fotos mit Einverständnis. */
export function oeffentlich(daten) {
  return { ...daten, galerie: daten.galerie.filter((g) => g.einverstaendnis) };
}
