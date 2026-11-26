// Einfacher Passwortschutz für die Verwaltung.
// Lokal gibt es ein Testpasswort. Auf Netlify MUSS die Umgebungsvariable
// ADMIN_PASSWORT gesetzt sein – sonst ist keine Anmeldung möglich.
import crypto from 'node:crypto';
import { AUF_NETLIFY } from './store.js';

export const PASSWORT = process.env.ADMIN_PASSWORT || (AUF_NETLIFY ? '' : 'goldslam2027');
export const PASSWORT_FEHLT = !PASSWORT;
export const STANDARD_PASSWORT = !process.env.ADMIN_PASSWORT && !AUF_NETLIFY;
const SECRET = process.env.SESSION_SECRET || 'ggs:' + PASSWORT;
export const COOKIE = 'ggs_admin';

const token = () => crypto.createHmac('sha256', SECRET).update('admin-v1').digest('hex');

export function passwortRichtig(eingabe) {
  if (PASSWORT_FEHLT) return false;
  const a = Buffer.from(String(eingabe ?? ''));
  const b = Buffer.from(PASSWORT);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function istAngemeldet(cookies) {
  if (PASSWORT_FEHLT) return false;
  const v = cookies.get(COOKIE)?.value;
  if (!v) return false;
  const t = token();
  return v.length === t.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(t));
}

export function anmelden(cookies) {
  cookies.set(COOKIE, token(), { httpOnly: true, secure: AUF_NETLIFY, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 14 });
}

export function abmelden(cookies) {
  cookies.delete(COOKIE, { path: '/' });
}
