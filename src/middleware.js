// 1. Schutz vor Cross-Site-Anfragen: Schreibende Anfragen müssen von dieser Website selbst kommen.
// 2. Testphase: Suchmaschinen fernhalten. Zum offiziellen Start die Umgebungsvariable
//    SUCHMASCHINEN=erlauben setzen (und den [[headers]]-Block in netlify.toml entfernen).
export async function onRequest({ request }, next) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (origin && host && new URL(origin).host !== host) {
      return new Response('Anfrage von fremder Seite abgelehnt.', { status: 403 });
    }
  }
  const response = await next();
  if (process.env.SUCHMASCHINEN !== 'erlauben') {
    try { response.headers.set('X-Robots-Tag', 'noindex, nofollow'); } catch { /* unveränderliche Antwort */ }
  }
  return response;
}
