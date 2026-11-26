// Standardinhalte zum Testen. Alles hier ist Platzhalter und kann in der
// Verwaltung (/admin) geändert werden. Die Spielernamen sind frei erfunden.
import { spiralPaarungen } from './tennis.js';

/** Alter Hinweistext (Widerspruchslösung) – wird bei bestehenden Daten automatisch ersetzt. */
export const HINWEIS_FOTOS_ALT =
  'Während des Turniers werden Fotos gemacht, die auf dieser Website und in den Kanälen der TG Gold-Weiß erscheinen können. Mit der Anmeldung erklären sich die Erziehungsberechtigten damit einverstanden. Wer das nicht möchte, gibt bitte am Turniertag bei der Turnierleitung Bescheid.';

/** Alle Teilnehmenden sind minderjährig: Fotos nur mit ausdrücklicher Einwilligung der Eltern. */
export const HINWEIS_FOTOS =
  'Alle Teilnehmenden sind minderjährig. Fotos, auf denen ein Kind erkennbar ist, veröffentlichen wir deshalb nur mit der schriftlichen Einwilligung der Erziehungsberechtigten.\n\nDas Einwilligungsformular erhaltet ihr bei der Anmeldung vor Ort an der Turnierleitung. Ohne Einwilligung erscheinen keine Fotos eures Kindes – weder auf dieser Website noch in den Kanälen der TG Gold-Weiß.\n\nDie Einwilligung ist freiwillig und kann jederzeit ohne Angabe von Gründen per E-Mail an die Turnierleitung widerrufen werden. Betroffene Fotos entfernen wir dann umgehend.';

export const DATEN_VERSION = 2;

const KONKURRENZEN = [
  { id: 'u12m', name: 'Junioren U12', kurz: 'U12 m', jahrgaenge: '2015 – 2017', max: 8, hinweis: 'Jahrgang 2015 sowie jüngere Jahrgänge 2016/2017 (Höherspielen erlaubt).' },
  { id: 'u12w', name: 'Juniorinnen U12', kurz: 'U12 w', jahrgaenge: '2015 – 2017', max: 8, hinweis: 'Jahrgang 2015 sowie jüngere Jahrgänge 2016/2017 (Höherspielen erlaubt).' },
  { id: 'u15m', name: 'Junioren U15', kurz: 'U15 m', jahrgaenge: '2012 – 2015', max: 8, hinweis: 'Jahrgang 2012 sowie jüngere Jahrgänge 2013–2015.' },
  { id: 'u15w', name: 'Juniorinnen U15', kurz: 'U15 w', jahrgaenge: '2012 – 2015', max: 8, hinweis: 'Jahrgang 2012 sowie jüngere Jahrgänge 2013–2015.' },
  { id: 'u18m', name: 'Junioren U18', kurz: 'U18 m', jahrgaenge: '2009 – 2014', max: 8, hinweis: 'Jahrgang 2009 sowie jüngere Jahrgänge 2010–2014.' },
  { id: 'u18w', name: 'Juniorinnen U18', kurz: 'U18 w', jahrgaenge: '2009 – 2014', max: 8, hinweis: 'Jahrgang 2009 sowie jüngere Jahrgänge 2010–2014.' },
];

const VORNAMEN_M = ['Ben', 'Elias', 'Finn', 'Jonas', 'Leon', 'Luca', 'Noah', 'Paul', 'Emil', 'Mats', 'Theo', 'Anton', 'Jan', 'Mika', 'Linus', 'Henri', 'Ole', 'Tom'];
const VORNAMEN_W = ['Emma', 'Mia', 'Hannah', 'Lea', 'Lina', 'Marie', 'Ella', 'Clara', 'Ida', 'Lotta', 'Frieda', 'Nele', 'Paula', 'Greta', 'Mila', 'Romy'];
const NACHNAMEN = ['Becker', 'Hoffmann', 'Krüger', 'Lange', 'Meier', 'Neumann', 'Peters', 'Richter', 'Schulte', 'Vogel', 'Wagner', 'Winkler', 'Brandt', 'Kaiser', 'Lorenz', 'Otto', 'Sommer', 'Thiel', 'Busch', 'Franke'];
const VEREINE = ['TG Gold-Weiß Gelsenkirchen', 'TC Beispielstadt', 'TV Musterdorf', 'TC Rot-Blau Testheim', 'TuS Probehausen'];
const ANZAHL = { u12m: 6, u12w: 5, u15m: 6, u15w: 6, u18m: 6, u18w: 4 };

function erzeugeSpieler() {
  const spieler = [];
  let m = 0, w = 0, nn = 0;
  for (const k of KONKURRENZEN) {
    const weiblich = k.id.endsWith('w');
    for (let i = 0; i < ANZAHL[k.id]; i++) {
      const vorname = weiblich ? VORNAMEN_W[w++ % VORNAMEN_W.length] : VORNAMEN_M[m++ % VORNAMEN_M.length];
      const nachname = NACHNAMEN[(nn++ * 7) % NACHNAMEN.length];
      spieler.push({
        id: `${k.id}-${i + 1}`,
        vorname,
        nachname,
        verein: VEREINE[(nn * 3 + i) % VEREINE.length],
        lk: Math.round((14 + i * 1.7 + (nn % 3) * 0.4) * 10) / 10,
        konkurrenz: k.id,
        // Beispielwerte zum Testen: die meisten mit, einige ohne Einwilligung
        fotoEinwilligung: i === 5 ? 'nein' : i % 3 === 2 ? 'offen' : 'ja',
        einwilligungDatum: i === 5 || i % 3 === 2 ? '' : '2027-05-29',
      });
    }
  }
  return spieler;
}

/** Verteilt die Spiele auf 6 Plätze in 90-Minuten-Blöcken ab 9:00 Uhr. */
function erzeugeSpiele(spieler, plaetze = 6) {
  const roh = [];
  for (const k of KONKURRENZEN) {
    const sp = spieler.filter((s) => s.konkurrenz === k.id);
    for (const p of spiralPaarungen(sp)) roh.push({ ...p, konkurrenz: k.id });
  }
  const spiele = [];
  let slot = 0;
  for (const runde of [1, 2, 3]) {
    const r = roh.filter((p) => p.runde === runde);
    if (!r.length) continue;
    r.forEach((p, i) => {
      const s = slot + Math.floor(i / plaetze);
      const min = 9 * 60 + s * 90;
      spiele.push({
        id: `m${spiele.length + 1}`,
        konkurrenz: p.konkurrenz,
        runde: p.runde,
        zeit: `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`,
        platz: (i % plaetze) + 1,
        a: p.a,
        b: p.b,
        status: 'geplant',
        saetze: [],
        sieger: null,
        notiz: '',
      });
    });
    slot += Math.ceil(r.length / plaetze);
  }
  // Ein paar Beispiel-Ergebnisse, damit der Live-Stand zum Testen gefüllt ist
  const beispiele = [
    { status: 'beendet', saetze: [[6, 3], [6, 4]] },
    { status: 'beendet', saetze: [[4, 6], [6, 2], [10, 7]] },
    { status: 'beendet', saetze: [[7, 5], [6, 7], [8, 10]] },
    { status: 'beendet', saetze: [[6, 1], [6, 0]] },
    { status: 'aufgabe', saetze: [[6, 2], [3, 1]], sieger: 'a', notiz: 'Aufgabe wegen Verletzung' },
    { status: 'beendet', saetze: [[7, 6], [6, 4]] },
    { status: 'laeuft', saetze: [[6, 4], [2, 3]] },
    { status: 'laeuft', saetze: [[3, 5]] },
    { status: 'laeuft', saetze: [[5, 7], [6, 3], [4, 2]] },
  ];
  beispiele.forEach((b, i) => { if (spiele[i]) Object.assign(spiele[i], b); });
  return spiele;
}

export function seedDaten() {
  const spieler = erzeugeSpieler();
  return {
    einstellungen: {
      name: 'Gelsen Gold Slam',
      jahr: '2027',
      untertitel: 'LK-Jugendturnier der TG Gold-Weiß Gelsenkirchen',
      datum: '2027-05-29',
      beginn: '09:00',
      ort: 'Tennisanlage der TG Gold-Weiß Gelsenkirchen',
      adresse: 'Feldmarkstraße 200, Gelsenkirchen',
      untergrund: '6 Sandplätze (Asche), Freiluft',
      ausrichter: 'TG Gold-Weiß Gelsenkirchen e. V.',
      turnierart: 'LK-Tagesturnier (Jugend), Einzel, Spiralsystem',
      startgeld: '30',
      dtbEntgelt: '3',
      meldeschluss: '2027-05-20T18:00',
      auslosung: '2027-05-21T18:00',
      zaehlweise: 'mtb',
      baelle: 'Dunlop WTV Tour 3.0',
      oberschiedsrichter: 'N. N. (LK-Turnierausrichterlizenz WTV)',
      oberschiedsrichter2: 'N. N. (Vertretung, LK-Turnierausrichterlizenz WTV)',
      kontaktName: 'Turnierleitung Gelsen Gold Slam',
      kontaktEmail: 'info@tg-gold-weiss.de',
      kontaktTelefon: '',
      tennisdeUrl: 'https://www.tennis.de/spielen/turniersuche.html',
      nuligaUrl: 'https://wtv.liga.nu/cgi-bin/WebObjects/nuLigaTENDE.woa/wa/tournamentCalendar?federation=WTV',
      plaetze: 6,
      begruessung:
        'Am letzten Maiwochenende wird die Anlage der TG Gold-Weiß zur Bühne für den Tennisnachwuchs: Beim Gelsen Gold Slam spielen Mädchen und Jungen in den Altersklassen U12, U15 und U18 um LK-Punkte.\n\nJedes Kind bestreitet zwei Einzel gegen Gegner mit ähnlicher Leistungsklasse – faire Matches, ein kompakter Turniertag und jede Menge Tennis auf sechs Sandplätzen.\n\nWir freuen uns auf spannende Spiele, gute Stimmung und viele Zuschauer!',
      anfahrt:
        'Die Anlage liegt am Nienhausenbusch in Gelsenkirchen. Parkplätze sind an der Anlage vorhanden. Bitte bildet Fahrgemeinschaften, am Turniertag wird es voll.\n\nMit Bus und Bahn: Haltestellen und Verbindungen findet ihr in der Fahrplanauskunft des VRR.',
      verpflegung:
        'Unser Clubhaus ist den ganzen Tag geöffnet. Es gibt Getränke, belegte Brötchen, Obst und Kuchen – der Erlös kommt der Jugendarbeit zugute.',
      regeln:
        'Gespielt wird nach den ITF-Tennisregeln, der DTB-Turnierordnung sowie den WTV-Richtlinien für LK-Turniere.\n\nDie Anmeldung erfolgt ausschließlich online über tennis.de. Teilnahmeberechtigt sind Spielerinnen und Spieler, die Mitglied in einem Verein des DTB sind, eine ID-Nummer und eine LK besitzen sowie über eine tennis.de-Lizenz (LIZENZ oder PREMIUM) verfügen.\n\nBei einem LK-Tagesturnier ist die Teilnahme an nur einer Konkurrenz möglich. Jede Spielerin und jeder Spieler bestreitet zwei Einzel. Die Setzung erfolgt automatisch nach LK.\n\nBei zu wenigen Meldungen können Konkurrenzen zusammengelegt werden; maßgebend ist dann die höhere Altersklasse.\n\nSpiele in der U12 beginnen nicht vor 8:00 Uhr, der letzte Spielbeginn ist spätestens 21:00 Uhr.',
      hinweisFotos: HINWEIS_FOTOS,
      impressum:
        'TG Gold-Weiß Gelsenkirchen e. V.\nFeldmarkstraße 200\n[PLZ] Gelsenkirchen\n\nVertreten durch den Vorstand: [Name 1. Vorsitzende/r]\nE-Mail: info@tg-gold-weiss.de\n\nRegistergericht: Amtsgericht Gelsenkirchen\nRegisternummer: [VR …]\n\nVerantwortlich für den Inhalt: [Name, Anschrift]',
    },
    konkurrenzen: KONKURRENZEN,
    spieler,
    spiele: erzeugeSpiele(spieler),
    ablauf: [
      { zeit: '08:15', titel: 'Anlage öffnet', text: 'Anmeldung bei der Turnierleitung im Clubhaus. Bitte spätestens 30 Minuten vor eurem ersten Spiel da sein.' },
      { zeit: '09:00', titel: 'Erste Runde', text: 'Alle Konkurrenzen starten. Die genauen Zeiten und Plätze stehen im Live-Stand.' },
      { zeit: '12:30', titel: 'Mittag im Clubhaus', text: 'Essen und Trinken für Spieler, Eltern und Gäste – das Clubhaus ist den ganzen Tag geöffnet.' },
      { zeit: '13:30', titel: 'Zweite Runde', text: 'Jede Spielerin und jeder Spieler bestreitet das zweite Einzel.' },
      { zeit: '18:00', titel: 'Zusatzspiele', text: 'Falls in einer Konkurrenz eine ungerade Zahl an Spielern gemeldet ist, finden hier die letzten Spiele statt.' },
      { zeit: '19:30', titel: 'Siegerehrung', text: 'Kleine Siegerehrung für alle Konkurrenzen mit Urkunden und Preisen unserer Sponsoren.' },
    ],
    sponsoren: [
      { id: 's1', name: 'Hauptsponsor (Platzhalter)', url: '', stufe: 'haupt', logo: '' },
      { id: 's2', name: 'Partner 1 (Platzhalter)', url: '', stufe: 'partner', logo: '' },
      { id: 's3', name: 'Partner 2 (Platzhalter)', url: '', stufe: 'partner', logo: '' },
      { id: 's4', name: 'Partner 3 (Platzhalter)', url: '', stufe: 'partner', logo: '' },
    ],
    galerie: [],
    version: DATEN_VERSION,
    aktualisiert: new Date().toISOString(),
  };
}
