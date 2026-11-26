// Foto-Einwilligungen der Erziehungsberechtigten (alle Teilnehmenden sind minderjährig).
// Wird im Browser (Verwaltung) und auf dem Server (öffentliche Galerie, Bildauslieferung) genutzt.

export const EINWILLIGUNG = {
  offen: 'Offen – liegt nicht vor',
  ja: 'Liegt vor (schriftlich)',
  nein: 'Abgelehnt / widerrufen',
};

/**
 * Darf ein Foto öffentlich gezeigt werden?
 * Regel: Entweder sind keine Personen erkennbar, oder es sind Personen zugeordnet
 * und für JEDE davon liegt die Einwilligung der Eltern vor.
 * @param {{personen?: string[], keinePersonen?: boolean}} foto
 * @param {Record<string, {vorname:string, nachname:string, fotoEinwilligung?:string}>} spielerById
 */
export function fotoStatus(foto, spielerById) {
  // Auch Kinder, die inzwischen aus der Spielerliste gelöscht wurden, bleiben zugeordnet
  // und gelten als „ohne Einwilligung“ – bis sie bewusst aus dem Foto entfernt werden.
  const personen = foto.personen || [];
  if (foto.keinePersonen && personen.length === 0) {
    return { oeffentlich: true, grund: 'Keine Personen erkennbar', fehlend: [] };
  }
  if (personen.length === 0) {
    return { oeffentlich: false, grund: 'Noch nicht zugeordnet: Wer ist auf dem Foto?', fehlend: [] };
  }
  const fehlend = personen.filter((id) => spielerById[id]?.fotoEinwilligung !== 'ja');
  if (fehlend.length) {
    const namen = fehlend.map((id) => (spielerById[id] ? `${spielerById[id].vorname} ${spielerById[id].nachname}` : 'gelöschte Person'));
    return { oeffentlich: false, grund: `Einwilligung fehlt für: ${namen.join(', ')}`, fehlend };
  }
  return { oeffentlich: true, grund: 'Einwilligung für alle abgebildeten Kinder liegt vor', fehlend: [] };
}

export const spielerIndex = (spieler) => Object.fromEntries((spieler || []).map((s) => [s.id, s]));
