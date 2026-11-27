// Bringt gespeicherte Daten älterer Versionen auf den aktuellen Stand.
// Läuft beim Laden automatisch (lokal und auf Netlify).
import { DATEN_VERSION, HINWEIS_FOTOS, HINWEIS_FOTOS_ALT, ENTFALLENE_KONKURRENZEN, EDITION, AUSBLICK, BEGRUESSUNG, BEGRUESSUNG_ALT } from './seed.js';

export function migriere(eingabe) {
  const daten = structuredClone(eingabe);
  const v = daten.version || 1;
  if (v >= DATEN_VERSION) return { daten, geaendert: false };
  if (v < 2) version2(daten);
  if (v < 3) version3(daten);
  daten.version = DATEN_VERSION;
  return { daten, geaendert: true };
}

function version2(daten) {
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
}

function version3(daten) {
  // Version 3: Kids Edition – U18 entfällt (Konkurrenzen, Spieler und Spiele), Edition und Ausblick
  const weg = new Set(ENTFALLENE_KONKURRENZEN);
  daten.konkurrenzen = (daten.konkurrenzen || []).filter((k) => !weg.has(k.id));
  daten.spieler = (daten.spieler || []).filter((s) => !weg.has(s.konkurrenz));
  daten.spiele = (daten.spiele || []).filter((s) => !weg.has(s.konkurrenz));
  // Fotos mit (jetzt gelöschten) U18-Kindern bleiben zugeordnet und damit automatisch verborgen.
  const e = daten.einstellungen || (daten.einstellungen = {});
  if (typeof e.edition !== 'string') e.edition = EDITION;
  if (typeof e.ausblick !== 'string') e.ausblick = AUSBLICK;
  if (!e.begruessung || e.begruessung === BEGRUESSUNG_ALT) e.begruessung = BEGRUESSUNG;
}
