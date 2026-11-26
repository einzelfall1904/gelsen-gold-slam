/** Öffentliche Daten für den Live-Stand (ohne interne Notizen der Verwaltung). */
export function liveDaten(d) {
  const spielerById = Object.fromEntries(d.spieler.map((s) => [s.id, { vorname: s.vorname, nachname: s.nachname, verein: s.verein, lk: s.lk }]));
  const konkurrenzById = Object.fromEntries(d.konkurrenzen.map((k) => [k.id, { kurz: k.kurz, name: k.name }]));
  return {
    konkurrenzen: d.konkurrenzen.map((k) => ({ id: k.id, kurz: k.kurz, name: k.name })),
    spieler: d.spieler.map((s) => ({ id: s.id, vorname: s.vorname, nachname: s.nachname, verein: s.verein, lk: s.lk, konkurrenz: s.konkurrenz })),
    spielerById,
    konkurrenzById,
    spiele: d.spiele.map(({ id, konkurrenz, runde, zeit, platz, a, b, status, saetze, sieger, notiz }) => ({ id, konkurrenz, runde, zeit, platz, a, b, status, saetze, sieger, notiz })),
    aktualisiert: d.aktualisiert,
  };
}
