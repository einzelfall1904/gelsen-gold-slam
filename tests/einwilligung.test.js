import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fotoStatus, spielerIndex } from '../src/lib/einwilligung.js';
import { migriere } from '../src/lib/migration.js';

const sp = spielerIndex([
  { id: 'a', vorname: 'Ben', nachname: 'A', fotoEinwilligung: 'ja' },
  { id: 'b', vorname: 'Mia', nachname: 'B', fotoEinwilligung: 'offen' },
  { id: 'c', vorname: 'Leo', nachname: 'C', fotoEinwilligung: 'nein' },
]);

test('Foto ohne Zuordnung bleibt verborgen', () => {
  assert.equal(fotoStatus({ personen: [] }, sp).oeffentlich, false);
});

test('Foto ohne erkennbare Personen ist öffentlich', () => {
  assert.equal(fotoStatus({ personen: [], keinePersonen: true }, sp).oeffentlich, true);
});

test('alle Kinder mit Einwilligung → öffentlich', () => {
  assert.equal(fotoStatus({ personen: ['a'] }, sp).oeffentlich, true);
});

test('ein Kind ohne Einwilligung → verborgen, mit Namen', () => {
  const r = fotoStatus({ personen: ['a', 'b'] }, sp);
  assert.equal(r.oeffentlich, false);
  assert.deepEqual(r.fehlend, ['b']);
  assert.match(r.grund, /Mia B/);
});

test('Widerruf → verborgen', () => {
  assert.equal(fotoStatus({ personen: ['c'] }, sp).oeffentlich, false);
});

test('„keine Personen“ zählt nicht, sobald Kinder zugeordnet sind', () => {
  assert.equal(fotoStatus({ personen: ['b'], keinePersonen: true }, sp).oeffentlich, false);
});

test('gelöschtes Kind auf dem Foto → Foto bleibt verborgen', () => {
  assert.equal(fotoStatus({ personen: ['weg'] }, sp).oeffentlich, false);
  const r = fotoStatus({ personen: ['a', 'weg'] }, sp);
  assert.equal(r.oeffentlich, false);
  assert.match(r.grund, /gelöschte Person/);
});

test('Migration: alte Daten bekommen Einwilligungsfelder, alter Foto-Haken gilt nicht mehr', () => {
  const alt = {
    einstellungen: { hinweisFotos: 'x' },
    spieler: [{ id: 'p1', vorname: 'A', nachname: 'B' }],
    galerie: [{ id: 'g1', datei: '/uploads/x.jpg', einverstaendnis: true }],
  };
  const { daten, geaendert } = migriere(alt);
  assert.equal(geaendert, true);
  assert.equal(daten.spieler[0].fotoEinwilligung, 'offen');
  assert.deepEqual(daten.galerie[0].personen, []);
  assert.equal('einverstaendnis' in daten.galerie[0], false);
  assert.equal(fotoStatus(daten.galerie[0], spielerIndex(daten.spieler)).oeffentlich, false);
  assert.equal(migriere(daten).geaendert, false);
});

test('Migration Version 3: U18 entfällt, Edition und Ausblick kommen dazu', async () => {
  const { BEGRUESSUNG_ALT } = await import('../src/lib/seed.js');
  const alt = {
    version: 2,
    einstellungen: { begruessung: BEGRUESSUNG_ALT },
    konkurrenzen: [{ id: 'u12m' }, { id: 'u15w' }, { id: 'u18m' }, { id: 'u18w' }],
    spieler: [{ id: 'a', konkurrenz: 'u12m' }, { id: 'b', konkurrenz: 'u18m' }, { id: 'c', konkurrenz: 'u18w' }],
    spiele: [{ id: 'm1', konkurrenz: 'u12m' }, { id: 'm2', konkurrenz: 'u18w' }],
    galerie: [{ id: 'g', personen: ['a', 'b'] }],
  };
  const { daten } = migriere(alt);
  assert.deepEqual(daten.konkurrenzen.map((k) => k.id), ['u12m', 'u15w']);
  assert.deepEqual(daten.spieler.map((s) => s.id), ['a']);
  assert.deepEqual(daten.spiele.map((s) => s.id), ['m1']);
  assert.equal(daten.einstellungen.edition, 'Kids Edition');
  assert.match(daten.einstellungen.begruessung, /U12 und U15/);
  // Foto mit gelöschtem U18-Kind bleibt verborgen
  assert.equal(fotoStatus(daten.galerie[0], spielerIndex(daten.spieler)).oeffentlich, false);
});

test('Migration lässt eigene Texte und eine geänderte Edition in Ruhe', () => {
  const { daten } = migriere({ version: 2, einstellungen: { begruessung: 'Eigener Text', edition: 'Youth Edition' }, konkurrenzen: [], spieler: [], spiele: [], galerie: [] });
  assert.equal(daten.einstellungen.begruessung, 'Eigener Text');
  assert.equal(daten.einstellungen.edition, 'Youth Edition');
});
