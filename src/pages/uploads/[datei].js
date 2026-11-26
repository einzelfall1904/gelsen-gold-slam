import path from 'node:path';
import { bildLaden, ladeDaten, dateiOeffentlich } from '../../lib/store.js';
import { istAngemeldet } from '../../lib/auth.js';

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
  // Kein langes Zwischenspeichern: ein Widerruf muss sofort wirken
  const headers = { 'content-type': typ, 'cache-control': frei ? 'public, max-age=300' : 'private, no-store', 'x-content-type-options': 'nosniff' };
  if (typ === 'image/svg+xml') headers['content-security-policy'] = "default-src 'none'; style-src 'unsafe-inline'";
  return new Response(daten, { headers });
};
