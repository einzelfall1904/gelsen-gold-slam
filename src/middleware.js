// 1. Schutz vor Cross-Site-Anfragen: Schreibende Anfragen müssen von dieser Website selbst kommen.
// 2. Testphase: Suchmaschinen fernhalten. Zum offiziellen Start die Umgebungsvariable
//    SUCHMASCHINEN=erlauben setzen (und den [[headers]]-Block in netlify.toml entfernen).
// 3. Zwischenspeicher (spart Netlify-Credits): Öffentliche Seiten und die Live-Daten darf
//    Netlify bis zu 5 Minuten zwischenspeichern. Beim Speichern in der Verwaltung wird dieser
//    Zwischenspeicher sofort geleert (siehe leereZwischenspeicher in src/lib/store.js),
//    Besucher sehen neue Ergebnisse also trotzdem beim nächsten Abruf.
import { CACHE_TAG } from './lib/cache.js';

/** Pfade, die nie zwischengespeichert werden dürfen (Verwaltung, Anmeldung, Schreibzugriffe). */
const NIE_CACHEN = /^\/(admin|api\/(daten|login|reset|upload))(\/|$)/;

export async function onRequest({ request, url }, next) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (origin && host && new URL(origin).host !== host) {
      return new Response('Anfrage von fremder Seite abgelehnt.', { status: 403 });
    }
  }
  const response = await next();
  try {
    if (process.env.SUCHMASCHINEN !== 'erlauben') response.headers.set('X-Robots-Tag', 'noindex, nofollow');

    const h = response.headers;
    const cachebar = request.method === 'GET' && response.status === 200 && !NIE_CACHEN.test(url.pathname)
      && !url.pathname.startsWith('/uploads/') // Bilder regeln ihren Zwischenspeicher selbst (Einwilligung!)
      && !h.has('set-cookie') && !h.has('netlify-cdn-cache-control');
    if (cachebar) {
      h.set('Netlify-CDN-Cache-Control', 'public, durable, s-maxage=300, stale-while-revalidate=60');
      h.set('Netlify-Cache-Tag', CACHE_TAG);
      // Werbe-Parameter (utm_…, fbclid) sollen keine eigenen Cache-Einträge erzeugen
      h.set('Netlify-Vary', 'query=_');
    } else if (NIE_CACHEN.test(url.pathname)) {
      h.set('Netlify-CDN-Cache-Control', 'no-store');
    }
  } catch { /* unveränderliche Antwort */ }
  return response;
}
