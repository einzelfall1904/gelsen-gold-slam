// Schutz vor Cross-Site-Anfragen: Schreibende Anfragen müssen von dieser Website selbst kommen.
export function onRequest({ request }, next) {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    if (origin && host && new URL(origin).host !== host) {
      return new Response('Anfrage von fremder Seite abgelehnt.', { status: 403 });
    }
  }
  return next();
}
