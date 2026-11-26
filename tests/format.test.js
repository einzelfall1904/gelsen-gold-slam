import { test } from 'node:test';
import assert from 'node:assert/strict';
import { externeUrl } from '../src/lib/format.js';

test('Adresse ohne https wird ergänzt', () => {
  assert.equal(externeUrl('www.morant.de'), 'https://www.morant.de');
  assert.equal(externeUrl('  morant.de/kontakt '), 'https://morant.de/kontakt');
  assert.equal(externeUrl('//cdn.example.org/x'), 'https://cdn.example.org/x');
});

test('vollständige Adressen bleiben unverändert', () => {
  assert.equal(externeUrl('https://www.tennis.de'), 'https://www.tennis.de');
  assert.equal(externeUrl('http://alt.example.de'), 'http://alt.example.de');
  assert.equal(externeUrl('HTTPS://GROSS.DE'), 'HTTPS://GROSS.DE');
});

test('leer bleibt leer', () => {
  assert.equal(externeUrl(''), '');
  assert.equal(externeUrl(null), '');
});

test('gefährliche Schemata werden zu harmlosen https-Adressen', () => {
  assert.ok(externeUrl('javascript:alert(1)').startsWith('https://'));
  assert.ok(externeUrl('data:text/html,x').startsWith('https://'));
});
