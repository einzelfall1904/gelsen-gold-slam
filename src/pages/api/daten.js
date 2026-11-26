import { ladeDaten, speichereDaten } from '../../lib/store.js';
import { istAngemeldet } from '../../lib/auth.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export const GET = async ({ cookies }) => (istAngemeldet(cookies) ? json(await ladeDaten()) : json({ fehler: ['Nicht angemeldet.'] }, 401));

export const PUT = async ({ cookies, request }) => {
  if (!istAngemeldet(cookies)) return json({ ok: false, fehler: ['Nicht angemeldet. Bitte neu einloggen.'] }, 401);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, fehler: ['Daten konnten nicht gelesen werden.'] }, 400); }
  try {
    const r = await speichereDaten(body);
    return json(r, r.ok ? 200 : 422);
  } catch (err) {
    console.error('Speichern fehlgeschlagen', err);
    return json({ ok: false, fehler: ['Speichern auf dem Server ist fehlgeschlagen. Bitte gleich noch einmal versuchen.'] }, 500);
  }
};
