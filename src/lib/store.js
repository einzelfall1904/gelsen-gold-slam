// Speichert alle Turnierdaten.
// - Lokal: JSON-Datei data/turnier.json, Bilder in data/uploads/
// - Auf Netlify: Netlify Blobs (dort gibt es keine dauerhafte Festplatte)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { seedDaten, DATEN_VERSION } from './seed.js';
import { auswerten } from './tennis.js';
import { migriere } from './migration.js';
import { fotoStatus, spielerIndex } from './einwilligung.js';
import { externeUrl } from './format.js';

export const AUF_NETLIFY = Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || globalThis.Netlify);

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const FILE = path.join(DATA_DIR, 'turnier.json');
const KEY = 'turnier';

async function blobStore(name) {
  const { getStore } = await import('@netlify/blobs');
  return getStore({ name, consistency: 'strong' });
}

async function speichereRoh(daten) {
  if (AUF_NETLIFY) {
    await (await blobStore('gelsen-gold-slam-daten')).setJSON(KEY, daten);
    return;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = FILE + '.' + crypto.randomBytes(4).toString('hex') + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(daten, null, 2));
  fs.renameSync(tmp, FILE);
}

async function ladeRoh() {
  if (AUF_NETLIFY) return (await blobStore('gelsen-gold-slam-daten')).get(KEY, { type: 'json' });
  return fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : null;
}

export async function ladeDaten() {
  const roh = await ladeRoh();
  if (!roh) {
    const neu = seedDaten();
    await speichereRoh(neu);
    return neu;
  }
  const { daten, geaendert } = migriere(roh);
  if (geaendert) await speichereRoh(daten);
  return daten;
}

const LISTEN = ['konkurrenzen', 'spieler', 'spiele', 'ablauf', 'sponsoren', 'galerie'];

/** Prüft und speichert die Daten aus der Verwaltung. Gibt Fehler zurück, falls ungültig. */
export async function speichereDaten(neu) {
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

  // Einwilligungen nur mit gültigen Werten speichern; im Zweifel „offen“ (= keine Veröffentlichung)
  for (const sp of neu.spieler) {
    if (!['offen', 'ja', 'nein'].includes(sp.fotoEinwilligung)) sp.fotoEinwilligung = 'offen';
  }
  for (const g of neu.galerie) {
    g.personen = Array.isArray(g.personen) ? g.personen.filter((id) => typeof id === 'string') : [];
    g.keinePersonen = g.keinePersonen === true;
    delete g.einverstaendnis;
  }
  // Web-Adressen vervollständigen („www.beispiel.de“ → „https://www.beispiel.de“)
  for (const sp of neu.sponsoren) sp.url = externeUrl(sp.url);
  for (const k of ['tennisdeUrl', 'nuligaUrl']) neu.einstellungen[k] = externeUrl(neu.einstellungen[k]);
  neu.version = DATEN_VERSION;
  neu.aktualisiert = new Date().toISOString();
  await speichereRoh(neu);
  return { ok: true, daten: neu };
}

export async function zuruecksetzen() {
  const d = seedDaten();
  await speichereRoh(d);
  return d;
}

/**
 * Öffentliche Sicht der Galerie: nur Fotos, für deren abgebildete Kinder ALLE
 * Eltern eingewilligt haben (oder auf denen keine Personen erkennbar sind).
 * Die Zuordnung (wer ist auf dem Foto) wird nicht veröffentlicht.
 */
export function oeffentlich(daten) {
  const idx = spielerIndex(daten.spieler);
  const galerie = daten.galerie
    .filter((g) => fotoStatus(g, idx).oeffentlich)
    .map(({ id, datei, titel, album }) => ({ id, datei, titel, album }));
  return { ...daten, galerie };
}

/** Darf diese hochgeladene Datei ohne Anmeldung ausgeliefert werden? */
export function dateiOeffentlich(daten, url) {
  const foto = daten.galerie.find((g) => g.datei === url);
  if (!foto) return true; // z. B. Sponsorenlogos
  return fotoStatus(foto, spielerIndex(daten.spieler)).oeffentlich;
}

// ---------- Hochgeladene Bilder ----------
export async function bildSpeichern(name, buffer, typ) {
  if (AUF_NETLIFY) {
    await (await blobStore('gelsen-gold-slam-bilder')).set(name, buffer, { metadata: { typ } });
    return;
  }
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(buffer));
}

export async function bildLaden(name) {
  if (AUF_NETLIFY) {
    return (await blobStore('gelsen-gold-slam-bilder')).get(name, { type: 'arrayBuffer' });
  }
  const file = path.join(UPLOAD_DIR, name);
  return fs.existsSync(file) ? fs.readFileSync(file) : null;
}
