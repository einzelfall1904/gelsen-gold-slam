import { ladeDaten } from '../../lib/store.js';
import { liveDaten } from '../../lib/live.js';

export const GET = () =>
  new Response(JSON.stringify(liveDaten(ladeDaten())), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
