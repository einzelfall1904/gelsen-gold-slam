import path from 'node:path';
import { bildLaden, ladeDaten, dateiOeffentlich } from '../../lib/store.js';
import { istAngemeldet } from '../../lib/auth.js';
import { CACHE_TAG } from '../../lib/cache.js';

const TYP = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

export const GET = async ({ params, cookies }) => {
  const name = path.basename(String(params.datei || ''));
  const typ = TYP[path.extname(name).toLowerCase()];
  if (!typ || !/^[0-9a-f-]{36}\.\w+$/.test(name)) return new Response('Nicht gefunden', { status: 404 });
  // Fotos ohne vollständige Einwilligung der Eltern nur für die angemeldete Turnierleitung
  const frei = dateiOeffentlich(await ladeDaten(), '/uploads/' + name);
  if (!frei && !istAngemeldet(cookies)) return new Response('Nicht gefunden', { status: 404 });
  const daten = await bildLaden(name);
  if (!daten) return new Response('Nicht gefunden', { status: 404 });
  // Freigegebene Bilder: Netlify darf sie zwischenspeichern; jedes Speichern in der Verwaltung
  // (z. B. ein Widerruf der Einwilligung) leert diesen Zwischenspeicher sofort.
  // Verborgene Bilder (nur Turnierleitung) werden nirgends zwischengespeichert.
  const headers = frei
    ? { 'content-type': typ, 'cache-control': 'public, max-age=60', 'netlify-cdn-cache-control': 'public, durable, s-maxage=300', 'netlify-cache-tag': CACHE_TAG }
    : { 'content-type': typ, 'cache-control': 'private, no-store', 'netlify-cdn-cache-control': 'no-store' };
  headers['x-content-type-options'] = 'nosniff';
  if (typ === 'image/svg+xml') headers['content-security-policy'] = "default-src 'none'; style-src 'unsafe-inline'";
  return new Response(daten, { headers });
};
