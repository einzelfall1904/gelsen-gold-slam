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
