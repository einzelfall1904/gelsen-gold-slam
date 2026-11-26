// Tennis-Logik nach WTV-Richtlinien für LK-Turniere.
// Wird im Browser (Verwaltung, Live-Stand) und auf dem Server genutzt.

export const STATUS = {
  geplant: 'Geplant',
  laeuft: 'Läuft',
  beendet: 'Beendet',
  aufgabe: 'Aufgabe',
  na: 'n.a. (nicht angetreten)',
};

/** Zählweisen, die der WTV bei LK-Turnieren erlaubt (Einzel). */
export const ZAEHLWEISEN = {
  mtb: '2 Gewinnsätze, Tiebreak bei 6:6, 3. Satz als Match-Tiebreak bis 10',
  satz: '2 Gewinnsätze, Tiebreak bei 6:6, 3. Satz ausgespielt (Tiebreak bei 6:6)',
};

const isInt = (n) => Number.isInteger(n) && n >= 0;

/** Prüft einen fertigen normalen Satz (z. B. 6:4, 7:5, 7:6). */
export function checkSet(a, b) {
  if (!isInt(a) || !isInt(b)) return 'Bitte ganze Zahlen eintragen.';
  const hi = Math.max(a, b), lo = Math.min(a, b);
  if (hi === 6 && lo <= 4) return null;
  if (hi === 7 && (lo === 5 || lo === 6)) return null;
  return `${a}:${b} ist kein gültiges Satzergebnis (erlaubt: 6:0 bis 6:4, 7:5, 7:6).`;
}

/** Prüft einen fertigen Match-Tiebreak (bis 10, 2 Punkte Abstand). */
export function checkMatchTiebreak(a, b) {
  if (!isInt(a) || !isInt(b)) return 'Bitte ganze Zahlen eintragen.';
  const hi = Math.max(a, b), lo = Math.min(a, b);
  if (hi === 10 && lo <= 8) return null;
  if (hi > 10 && hi - lo === 2) return null;
  return `${a}:${b} ist kein gültiger Match-Tiebreak (bis 10 mit 2 Punkten Abstand, z. B. 10:8 oder 12:10).`;
}

/** Prüft einen noch laufenden Satz (Zwischenstand). */
function checkRunningSet(a, b, isMtb) {
  if (!isInt(a) || !isInt(b)) return 'Bitte ganze Zahlen eintragen.';
  if (isMtb) return null;
  if (a > 7 || b > 7) return `Zwischenstand ${a}:${b} ist nicht möglich.`;
  return null;
}

/**
 * Wertet ein Spiel aus.
 * @param {{status:string, saetze:number[][], sieger?:'a'|'b'}} spiel
 * @param {'mtb'|'satz'} zaehlweise
 * @returns {{ok:boolean, fehler:string[], sieger:'a'|'b'|null, saetzeA:number, saetzeB:number}}
 */
export function auswerten(spiel, zaehlweise = 'mtb') {
  const fehler = [];
  const saetze = (spiel.saetze || []).filter((s) => s && s.length === 2 && (s[0] !== null || s[1] !== null));
  let saetzeA = 0, saetzeB = 0;
  const status = spiel.status || 'geplant';

  if (saetze.length > 3) fehler.push('Höchstens 3 Sätze.');

  saetze.forEach(([a, b], i) => {
    const istDritter = i === 2;
    const isMtb = istDritter && zaehlweise === 'mtb';
    const name = isMtb ? 'Match-Tiebreak' : `${i + 1}. Satz`;
    const letzter = i === saetze.length - 1;
    // Abgeschlossene Sätze: alle außer dem letzten eines laufenden/aufgegebenen Spiels
    const mussFertigSein = status === 'beendet' || !letzter;
    const err = mussFertigSein
      ? (isMtb ? checkMatchTiebreak(a, b) : checkSet(a, b))
      : checkRunningSet(a, b, isMtb);
    if (err) fehler.push(`${name}: ${err}`);
    else if (mussFertigSein) {
      if (a > b) saetzeA++; else saetzeB++;
    }
    if (mussFertigSein && (saetzeA === 2 || saetzeB === 2) && i < saetze.length - 1) {
      fehler.push('Nach zwei gewonnenen Sätzen ist das Spiel vorbei – bitte überzählige Sätze löschen.');
    }
  });

  let sieger = null;
  if (status === 'beendet') {
    if (saetzeA === 2 && saetzeB < 2) sieger = 'a';
    else if (saetzeB === 2 && saetzeA < 2) sieger = 'b';
    else if (!fehler.length) fehler.push('Ein beendetes Spiel braucht einen Sieger mit 2 Gewinnsätzen.');
  } else if (status === 'aufgabe' || status === 'na') {
    if (spiel.sieger === 'a' || spiel.sieger === 'b') sieger = spiel.sieger;
    else fehler.push('Bitte auswählen, wer weiterkommt bzw. gewonnen hat.');
  }

  return { ok: fehler.length === 0, fehler, sieger, saetzeA, saetzeB };
}

/** "6:4 3:6 10:8" */
export function formatErgebnis(spiel) {
  const s = (spiel.saetze || []).filter((x) => x && x[0] !== null && x[1] !== null);
  return s.map(([a, b]) => `${a}:${b}`).join('  ');
}

/**
 * Vorschlag für Paarungen im Spiralsystem: Spieler nach LK sortiert,
 * jeder spielt 2 Einzel gegen Gegner mit möglichst ähnlicher LK.
 * Die offizielle Auslosung erfolgt in nuLiga – dies ist nur eine Hilfe
 * zum Abtippen bzw. für Probeläufe.
 * @param {{id:string, lk:number}[]} spieler
 * @returns {{runde:1|2, a:string, b:string}[]}
 */
export function spiralPaarungen(spieler) {
  const s = [...spieler].sort((x, y) => (x.lk ?? 25) - (y.lk ?? 25));
  const n = s.length;
  if (n < 2) return [];
  // Zickzack-Kreis 0,2,4,…,5,3,1 → Nachbarn im Kreis liegen höchstens 2 LK-Plätze auseinander
  const evens = s.filter((_, i) => i % 2 === 0);
  const odds = s.filter((_, i) => i % 2 === 1).reverse();
  const kreis = [...evens, ...odds];
  const paare = [];
  const kanten = n === 2 ? 1 : n; // bei 2 Spielern nur ein Spiel
  for (let i = 0; i < kanten; i++) {
    const a = kreis[i], b = kreis[(i + 1) % n];
    // Bei ungerader Anzahl kommt das letzte Spiel in eine eigene 3. Runde,
    // damit niemand zwei Spiele gleichzeitig hat.
    const runde = n % 2 === 1 && i === n - 1 ? 3 : (i % 2 === 0 ? 1 : 2);
    paare.push({ runde, a: a.id, b: b.id });
  }
  return paare;
}

/** Zählt Einzel je Spieler – WTV: max. 2 Einzel pro Tag beim Tagesturnier. */
export function einzelProSpieler(spiele) {
  const z = {};
  for (const sp of spiele) {
    for (const id of [sp.a, sp.b]) if (id) z[id] = (z[id] || 0) + 1;
  }
  return z;
}
