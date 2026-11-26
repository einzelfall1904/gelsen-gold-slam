// Erzeugt das druckfertige Einwilligungsformular (A4, PDF) für Fotos von Minderjährigen.
// Aufruf: npm run formular
// Ergebnis: public/downloads/Einwilligung-Fotos-Gelsen-Gold-Slam-2027.pdf
// Daten (Name, Datum, Adresse, Konkurrenzen) kommen aus den Standardinhalten in src/lib/seed.js.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { seedDaten } from '../src/lib/seed.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { einstellungen: e, konkurrenzen } = seedDaten();
const datum = new Date(e.datum + 'T12:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const font = (f) => pathToFileURL(path.join(root, 'node_modules/@fontsource-variable/archivo/files', f)).href;
const logo = pathToFileURL(path.join(root, 'public/media/logo.webp')).href;
const box = '<span class="box"></span>';
const linie = (label, breit = '') => `<div class="feld ${breit}"><div class="linie"></div><span>${label}</span></div>`;

const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Einwilligung Fotos – ${e.name} ${e.jahr}</title>
<style>
@font-face { font-family: 'Archivo'; src: url('${font('archivo-latin-wdth-normal.woff2')}') format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
@font-face { font-family: 'Archivo'; src: url('${font('archivo-latin-wdth-italic.woff2')}') format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; font-style: italic; }
@page { size: A4; margin: 13mm 15mm 16mm; }
* { box-sizing: border-box; }
body { font-family: 'Archivo', Arial, sans-serif; font-size: 9.3pt; line-height: 1.38; color: #0E1A24; margin: 0; }
header { display: flex; align-items: center; gap: 12px; border-bottom: 2.5pt solid #C9A456; padding-bottom: 7px; margin-bottom: 9px; }
header img { width: 62px; height: auto; }
header .t { flex: 1; }
h1 { font-size: 15pt; font-weight: 850; font-stretch: 80%; margin: 0; color: #13263A; line-height: 1.1; }
header p { margin: 2px 0 0; color: #4A5866; font-size: 8.6pt; }
h2 { font-size: 10pt; font-weight: 800; color: #13263A; margin: 10px 0 4px; font-stretch: 90%; text-transform: uppercase; letter-spacing: .04em; }
h2 b { display: inline-grid; place-items: center; width: 16px; height: 16px; border-radius: 50%; background: #13263A; color: #F2BC3C; font-size: 8pt; margin-right: 5px; vertical-align: 1px; }
p { margin: 0 0 4px; }
.intro { background: #F6EEDC; border-left: 3pt solid #C9A456; padding: 6px 9px; border-radius: 3px; }
.zeile { display: flex; gap: 14px; }
.feld { flex: 1; margin-top: 15px; }
.feld.schmal { flex: .55; }
.linie { border-bottom: .8pt solid #0E1A24; height: 1px; }
.feld span { font-size: 7.4pt; color: #4A5866; }
.box { display: inline-block; width: 10px; height: 10px; border: 1pt solid #0E1A24; border-radius: 2px; margin-right: 6px; vertical-align: -1px; flex: none; }
.konk { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px 10px; margin-top: 7px; }
ul.wahl { list-style: none; padding: 0; margin: 4px 0 0; }
ul.wahl li { display: flex; gap: 2px; padding: 3.5px 0; border-bottom: .5pt dotted #C9C3B5; }
ul.wahl li small { color: #4A5866; display: block; font-size: 7.8pt; }
.punkte { margin: 2px 0 0; padding-left: 15px; }
.punkte li { margin-bottom: 2px; }
.unterschriften { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.hinweis { font-size: 7.6pt; color: #4A5866; margin-top: 3px; }
.intern { margin-top: 10px; border: 1pt dashed #4A5866; border-radius: 4px; padding: 5px 9px; font-size: 8pt; }
.intern .zeile .feld { margin-top: 11px; }
.seite2 { break-before: page; }
.info p { text-align: justify; hyphens: auto; }
</style></head><body>

<header>
  <img src="${logo}" alt="">
  <div class="t">
    <h1>Einwilligung zur Veröffentlichung von Fotos</h1>
    <p><strong>${e.name} ${e.jahr}</strong> · ${e.turnierart} · ${datum} · ${e.ort}</p>
  </div>
</header>

<p class="intro">Alle Teilnehmenden sind minderjährig. Fotos, auf denen Ihr Kind erkennbar ist, veröffentlichen wir <strong>nur mit Ihrer ausdrücklichen Einwilligung</strong>. Die Einwilligung ist <strong>freiwillig</strong> – die Teilnahme am Turnier hängt nicht davon ab. Ohne Einwilligung erscheinen keine Fotos Ihres Kindes.</p>

<h2><b>1</b>Angaben zum Kind</h2>
<div class="zeile">${linie('Vorname')}${linie('Nachname')}${linie('Geburtsjahr', 'schmal')}</div>
<div class="zeile">${linie('Verein')}${linie('DTB-ID-Nummer (falls bekannt)', 'schmal')}</div>
<div class="konk">${konkurrenzen.map((k) => `<span>${box}${k.name}</span>`).join('')}</div>

<h2><b>2</b>Wo dürfen Fotos erscheinen?</h2>
<p>Bitte jede Stelle einzeln ankreuzen. Nicht angekreuzt bedeutet: <strong>keine Veröffentlichung</strong> an dieser Stelle.</p>
<ul class="wahl">
  <li>${box}<div>Turnier-Website des ${e.name}<small>Galerie der Turnierseite (derzeit gelsen-gold-slam.netlify.app)</small></div></li>
  <li>${box}<div>Website der ${e.ausrichter.replace(' e. V.', '')}<small>Berichte und Fotos auf der Vereinsseite</small></div></li>
  <li>${box}<div>Social-Media-Kanäle des Vereins (z. B. Instagram, Facebook)<small>Hinweis: Inhalte in sozialen Netzwerken sind weltweit abrufbar und können von Dritten weiterverbreitet werden; eine vollständige Löschung kann nicht garantiert werden.</small></div></li>
  <li>${box}<div>Gedruckte Medien (Vereinsheft, Aushang, Lokalpresse)<small>Bereits gedruckte Exemplare können nach einem Widerruf nicht zurückgerufen werden.</small></div></li>
</ul>

<h2><b>3</b>Was wir zusagen</h2>
<ul class="punkte">
  <li>Es werden nur Fotos vom Turniertag veröffentlicht, die Ihr Kind beim Sport, bei der Siegerehrung oder in der Gruppe zeigen – keine unvorteilhaften oder bloßstellenden Aufnahmen.</li>
  <li>Fotos werden <strong>ohne Namensnennung</strong> veröffentlicht. Bildunterschriften enthalten keine Namen von Kindern.</li>
  <li>Sie können die Einwilligung <strong>jederzeit ohne Angabe von Gründen widerrufen</strong> – formlos per E-Mail an <strong>${e.kontaktEmail}</strong>. Wir entfernen die Fotos Ihres Kindes dann umgehend von unseren Online-Kanälen.</li>
</ul>

<h2><b>4</b>Unterschriften</h2>
<p>Ich/wir willige(n) in die Veröffentlichung wie oben angekreuzt ein. Die Datenschutzhinweise auf der Rückseite habe(n) ich/wir zur Kenntnis genommen.</p>
<div class="unterschriften">
  ${linie('Ort, Datum')}${linie('Name der/des Erziehungsberechtigten (Druckbuchstaben)')}
  ${linie('Unterschrift Erziehungsberechtigte/r')}${linie('Unterschrift zweite/r Erziehungsberechtigte/r')}
</div>
<p class="hinweis">Bei gemeinsamem Sorgerecht unterschreiben grundsätzlich beide Elternteile. Unterschreibt nur ein Elternteil, versichert er/sie hiermit, im Einverständnis mit dem anderen Elternteil zu handeln.</p>
<div class="zeile">${linie('Ab 14 Jahren zusätzlich: Unterschrift des Kindes / der/des Jugendlichen')}<div class="feld schmal"></div></div>

<div class="intern">
  <strong>Nur für die Turnierleitung:</strong> Einwilligung in der Turnierverwaltung (Bereich „Spieler“) eingetragen als „Liegt vor“
  <div class="zeile">${linie('am')}${linie('von (Kürzel)')}${linie('Ablage', 'schmal')}</div>
</div>


<section class="seite2 info">
<header>
  <img src="${logo}" alt="">
  <div class="t"><h1>Datenschutzhinweise zur Foto-Einwilligung</h1><p><strong>${e.name} ${e.jahr}</strong> · Bitte bei den Eltern verbleiben (Kopie)</p></div>
</header>

<h2>Verantwortlich</h2>
<p>${e.ausrichter}, ${e.adresse}, E-Mail: ${e.kontaktEmail}</p>

<h2>Zweck und Rechtsgrundlage</h2>
<p>Wir möchten über den ${e.name} berichten und den Turniertag mit Fotos dokumentieren. Grundlage ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO sowie § 22 Kunsturhebergesetz (KUG). Bei Minderjährigen ist die Einwilligung der Erziehungsberechtigten erforderlich; ab etwa 14 Jahren bitten wir zusätzlich um die Zustimmung des Kindes.</p>

<h2>Welche Daten?</h2>
<p>Fotos, auf denen Ihr Kind erkennbar ist. Für die Verwaltung der Einwilligung speichern wir Vor- und Nachname, Verein, Konkurrenz und Status/Datum der Einwilligung. Namen werden in Verbindung mit Fotos nicht veröffentlicht.</p>

<h2>Wie wir die Einwilligung umsetzen</h2>
<p>In unserer Turnierverwaltung ist für jedes Kind hinterlegt, ob eine Einwilligung vorliegt. Ein Foto wird technisch erst freigegeben, wenn für <strong>jedes</strong> darauf erkennbare Kind eine Einwilligung vorliegt. Liegt sie für ein Kind nicht vor oder wird sie widerrufen, wird das Foto automatisch ausgeblendet und ist auch über einen direkten Link nicht mehr abrufbar.</p>

<h2>Speicherdauer</h2>
<p>Veröffentlichte Fotos bleiben bis zu Ihrem Widerruf online, längstens jedoch bis zum 31.12.${Number(e.jahr) + 2}; danach werden sie gelöscht oder nur noch vereinsintern archiviert. Das unterschriebene Formular bewahren wir als Nachweis auf, solange Fotos Ihres Kindes veröffentlicht sind, und darüber hinaus bis zu drei Jahre.</p>

<h2>Widerruf</h2>
<p>Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, formlos per E-Mail an ${e.kontaktEmail}. Die Rechtmäßigkeit der bis dahin erfolgten Veröffentlichung bleibt unberührt. Online-Fotos entfernen wir umgehend. Bereits gedruckte Medien können nicht zurückgerufen werden; in sozialen Netzwerken können Kopien durch Dritte entstanden sein, auf die wir keinen Einfluss haben.</p>

<h2>Ihre Rechte</h2>
<p>Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren, in Nordrhein-Westfalen bei der Landesbeauftragten für Datenschutz und Informationsfreiheit (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf.</p>

<h2>Keine Nachteile</h2>
<p>Die Einwilligung ist freiwillig. Wird sie nicht erteilt oder widerrufen, entstehen Ihrem Kind keinerlei Nachteile – insbesondere hängt die Turnierteilnahme nicht davon ab.</p>

<div class="intro" style="margin-top:14px">
  <strong>Widerruf ganz einfach:</strong> E-Mail an <strong>${e.kontaktEmail}</strong> mit dem Namen Ihres Kindes und dem Betreff „Widerruf Fotos ${e.name}“. Am Turniertag auch direkt bei der Turnierleitung im Clubhaus.
</div>
</section>
</body></html>`;

const zielDir = path.join(root, 'public/downloads');
fs.mkdirSync(zielDir, { recursive: true });
const htmlDatei = path.join(zielDir, '.formular.html');
fs.writeFileSync(htmlDatei, html);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlDatei).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const ziel = path.join(zielDir, `Einwilligung-Fotos-Gelsen-Gold-Slam-${e.jahr}.pdf`);
await page.pdf({
  path: ziel, format: 'A4', printBackground: true, preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: `<div style="font-family: Arial, sans-serif; font-size: 6.5pt; color: #8A95A0; width: 100%; padding: 0 15mm; display: flex; justify-content: space-between;">
    <span>${e.ausrichter} · ${e.adresse}</span>
    <span>Muster – vor Verwendung vom Verein prüfen lassen · Seite <span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`,
});
await browser.close();
fs.unlinkSync(htmlDatei);
console.log('Erstellt:', path.relative(root, ziel));
