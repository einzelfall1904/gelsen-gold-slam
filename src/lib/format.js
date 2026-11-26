const TZ = 'Europe/Berlin';

export function datumLang(iso) {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? iso + 'T12:00:00' : iso);
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
}

/** Datum + Uhrzeit aus einem Formularfeld („2027-05-20T18:00“) – gemeint ist immer deutsche Ortszeit. */
export function datumZeit(wert) {
  if (!wert) return '';
  const m = String(wert).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return String(wert);
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  return d.toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' Uhr';
}

/** Teilt Text an Leerzeilen in Absätze. */
export const absaetze = (t) => String(t || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

export const spielerName = (s) => (s ? `${s.vorname} ${s.nachname}` : 'N. N.');
