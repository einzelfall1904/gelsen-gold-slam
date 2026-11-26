// Bringt gespeicherte Daten älterer Versionen auf den aktuellen Stand.
// Läuft beim Laden automatisch (lokal und auf Netlify).
import { DATEN_VERSION, HINWEIS_FOTOS, HINWEIS_FOTOS_ALT } from './seed.js';

export function migriere(eingabe) {
  const daten = structuredClone(eingabe);
  if ((daten.version || 1) >= DATEN_VERSION) return { daten, geaendert: false };

  // Version 2: Foto-Einwilligung der Eltern je Kind, Fotos mit abgebildeten Kindern verknüpft
  for (const s of daten.spieler || []) {
    if (!['offen', 'ja', 'nein'].includes(s.fotoEinwilligung)) s.fotoEinwilligung = 'offen';
    if (typeof s.einwilligungDatum !== 'string') s.einwilligungDatum = '';
  }
  for (const g of daten.galerie || []) {
    if (!Array.isArray(g.personen)) g.personen = [];
    if (typeof g.keinePersonen !== 'boolean') g.keinePersonen = false;
    // Der alte pauschale Haken gilt nicht mehr: Fotos müssen den Kindern neu zugeordnet werden.
    delete g.einverstaendnis;
  }
  if (daten.einstellungen && (!daten.einstellungen.hinweisFotos || daten.einstellungen.hinweisFotos === HINWEIS_FOTOS_ALT)) {
    daten.einstellungen.hinweisFotos = HINWEIS_FOTOS;
  }
  daten.version = DATEN_VERSION;
  return { daten, geaendert: true };
}
