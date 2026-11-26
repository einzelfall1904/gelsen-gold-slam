import crypto from 'node:crypto';
import { bildSpeichern } from '../../lib/store.js';
import { istAngemeldet } from '../../lib/auth.js';

const ERLAUBT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/svg+xml': '.svg' };
// Netlify-Funktionen nehmen höchstens ca. 6 MB pro Anfrage an
const MAX = 4 * 1024 * 1024;

export const POST = async ({ cookies, request }) => {
  const res = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  if (!istAngemeldet(cookies)) return res({ fehler: 'Nicht angemeldet.' }, 401);
  const form = await request.formData();
  const datei = form.get('datei');
  if (!datei || typeof datei === 'string') return res({ fehler: 'Keine Datei ausgewählt.' }, 400);
  const ext = ERLAUBT[datei.type];
  if (!ext) return res({ fehler: 'Bitte ein Bild als JPG, PNG, WebP oder SVG hochladen.' }, 400);
  if (datei.size > MAX) return res({ fehler: 'Das Bild ist größer als 4 MB. Bitte vorher verkleinern (z. B. am Handy „Mittel“ wählen).' }, 400);
  const name = crypto.randomUUID() + ext;
  await bildSpeichern(name, await datei.arrayBuffer(), datei.type);
  return res({ url: '/uploads/' + name });
};
