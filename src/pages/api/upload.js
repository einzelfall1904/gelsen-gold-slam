import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { UPLOAD_DIR } from '../../lib/store.js';
import { istAngemeldet } from '../../lib/auth.js';

const ERLAUBT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/svg+xml': '.svg' };
const MAX = 8 * 1024 * 1024;

export const POST = async ({ cookies, request }) => {
  const res = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  if (!istAngemeldet(cookies)) return res({ fehler: 'Nicht angemeldet.' }, 401);
  const form = await request.formData();
  const datei = form.get('datei');
  if (!datei || typeof datei === 'string') return res({ fehler: 'Keine Datei ausgewählt.' }, 400);
  const ext = ERLAUBT[datei.type];
  if (!ext) return res({ fehler: 'Bitte ein Bild als JPG, PNG, WebP oder SVG hochladen.' }, 400);
  if (datei.size > MAX) return res({ fehler: 'Das Bild ist größer als 8 MB. Bitte vorher verkleinern.' }, 400);
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = crypto.randomUUID() + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(await datei.arrayBuffer()));
  return res({ url: '/uploads/' + name });
};
