// Einfacher Passwortschutz für die Verwaltung.
// Passwort über die Umgebungsvariable ADMIN_PASSWORT setzen (Standard nur zum Testen!).
import crypto from 'node:crypto';

export const PASSWORT = process.env.ADMIN_PASSWORT || 'goldslam2027';
const SECRET = process.env.SESSION_SECRET || 'ggs:' + PASSWORT;
export const COOKIE = 'ggs_admin';

const token = () => crypto.createHmac('sha256', SECRET).update('admin-v1').digest('hex');

export function passwortRichtig(eingabe) {
  const a = Buffer.from(String(eingabe ?? ''));
  const b = Buffer.from(PASSWORT);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function istAngemeldet(cookies) {
  const v = cookies.get(COOKIE)?.value;
  if (!v) return false;
  const t = token();
  return v.length === t.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(t));
}

export function anmelden(cookies) {
  cookies.set(COOKIE, token(), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 14 });
}

export function abmelden(cookies) {
  cookies.delete(COOKIE, { path: '/' });
}
