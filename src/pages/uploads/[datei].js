import path from 'node:path';
import { bildLaden } from '../../lib/store.js';

const TYP = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

export const GET = async ({ params }) => {
  const name = path.basename(String(params.datei || ''));
  const typ = TYP[path.extname(name).toLowerCase()];
  if (!typ || !/^[0-9a-f-]{36}\.\w+$/.test(name)) return new Response('Nicht gefunden', { status: 404 });
  const daten = await bildLaden(name);
  if (!daten) return new Response('Nicht gefunden', { status: 404 });
  const headers = { 'content-type': typ, 'cache-control': 'public, max-age=31536000, immutable', 'x-content-type-options': 'nosniff' };
  if (typ === 'image/svg+xml') headers['content-security-policy'] = "default-src 'none'; style-src 'unsafe-inline'";
  return new Response(daten, { headers });
};
