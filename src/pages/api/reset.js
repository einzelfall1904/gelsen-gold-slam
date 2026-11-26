import { zuruecksetzen } from '../../lib/store.js';
import { istAngemeldet } from '../../lib/auth.js';

export const POST = ({ cookies }) => {
  if (!istAngemeldet(cookies)) return new Response('Nicht angemeldet', { status: 401 });
  return new Response(JSON.stringify(zuruecksetzen()), { headers: { 'content-type': 'application/json' } });
};
