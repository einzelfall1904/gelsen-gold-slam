import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seedDaten } from '../src/lib/seed.js';
import { auswerten, einzelProSpieler } from '../src/lib/tennis.js';

test('Beispieldaten sind gültig und WTV-konform', () => {
  const d = seedDaten();
  for (const sp of d.spiele) assert.equal(auswerten(sp).ok, true, JSON.stringify(sp));
  const z = einzelProSpieler(d.spiele);
  for (const s of d.spieler) assert.ok(z[s.id] >= 1 && z[s.id] <= 2, `${s.id}: ${z[s.id]}`);
  // niemand zwei Spiele zur gleichen Zeit, kein Platz doppelt belegt
  const zeitSpieler = new Set(), zeitPlatz = new Set();
  for (const sp of d.spiele) {
    for (const id of [sp.a, sp.b]) { const k = sp.zeit + id; assert.ok(!zeitSpieler.has(k), k); zeitSpieler.add(k); }
    const k = sp.zeit + '#' + sp.platz; assert.ok(!zeitPlatz.has(k), k); zeitPlatz.add(k);
    assert.ok(sp.platz >= 1 && sp.platz <= 6);
  }
  assert.ok(d.spieler.length <= 42);
});
