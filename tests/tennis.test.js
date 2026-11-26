import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auswerten, checkSet, checkMatchTiebreak, spiralPaarungen, einzelProSpieler } from '../src/lib/tennis.js';

test('gültige und ungültige Sätze', () => {
  for (const [a, b] of [[6, 0], [6, 4], [4, 6], [7, 5], [7, 6], [6, 7]]) assert.equal(checkSet(a, b), null);
  for (const [a, b] of [[6, 5], [6, 6], [8, 6], [5, 3], [7, 4]]) assert.ok(checkSet(a, b));
});

test('Match-Tiebreak', () => {
  for (const [a, b] of [[10, 0], [10, 8], [12, 10], [9, 11]]) assert.equal(checkMatchTiebreak(a, b), null);
  for (const [a, b] of [[10, 9], [9, 7], [13, 10], [11, 10]]) assert.ok(checkMatchTiebreak(a, b));
});

test('beendetes Spiel in zwei Sätzen', () => {
  const r = auswerten({ status: 'beendet', saetze: [[6, 4], [7, 5]] });
  assert.equal(r.ok, true);
  assert.equal(r.sieger, 'a');
});

test('beendetes Spiel mit Match-Tiebreak', () => {
  const r = auswerten({ status: 'beendet', saetze: [[6, 4], [3, 6], [8, 10]] });
  assert.equal(r.ok, true);
  assert.equal(r.sieger, 'b');
});

test('dritter Satz ausgespielt bei Zählweise "satz"', () => {
  assert.equal(auswerten({ status: 'beendet', saetze: [[6, 4], [3, 6], [7, 6]] }, 'satz').sieger, 'a');
  assert.equal(auswerten({ status: 'beendet', saetze: [[6, 4], [3, 6], [10, 8]] }, 'satz').ok, false);
});

test('ungültige Endstände werden abgelehnt', () => {
  assert.equal(auswerten({ status: 'beendet', saetze: [[6, 4], [6, 6]] }).ok, false);
  assert.equal(auswerten({ status: 'beendet', saetze: [[6, 4], [3, 6]] }).ok, false);
  assert.equal(auswerten({ status: 'beendet', saetze: [[6, 4], [6, 2], [10, 5]] }).ok, false);
});

test('laufendes Spiel mit Zwischenstand', () => {
  const r = auswerten({ status: 'laeuft', saetze: [[6, 4], [2, 3]] });
  assert.equal(r.ok, true);
  assert.equal(r.sieger, null);
});

test('Aufgabe braucht gewählten Sieger', () => {
  assert.equal(auswerten({ status: 'aufgabe', saetze: [[2, 6], [1, 0]] }).ok, false);
  assert.equal(auswerten({ status: 'aufgabe', saetze: [[2, 6], [1, 0]], sieger: 'b' }).sieger, 'b');
});

for (const n of [3, 4, 5, 6, 7, 8]) {
  test(`Spiralsystem mit ${n} Spielern: jeder höchstens 2 Einzel, keine Doppelbelegung pro Runde`, () => {
    const spieler = Array.from({ length: n }, (_, i) => ({ id: 'p' + i, lk: 10 + i }));
    const paare = spiralPaarungen(spieler);
    const z = einzelProSpieler(paare);
    for (const s of spieler) assert.equal(z[s.id], 2, `${s.id} spielt ${z[s.id]}x`);
    for (const r of [1, 2, 3]) {
      const ids = paare.filter((p) => p.runde === r).flatMap((p) => [p.a, p.b]);
      assert.equal(new Set(ids).size, ids.length);
    }
    // Gegner liegen höchstens 2 LK-Plätze auseinander
    for (const p of paare) assert.ok(Math.abs(+p.a.slice(1) - +p.b.slice(1)) <= 2);
  });
}
