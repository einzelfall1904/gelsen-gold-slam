import { ladeDaten } from '../../lib/store.js';
import { liveDaten } from '../../lib/live.js';

export const GET = async () =>
  new Response(JSON.stringify(liveDaten(await ladeDaten())), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
