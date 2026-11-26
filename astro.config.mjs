import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Herkunftsprüfung erfolgt selbst in src/middleware.js (funktioniert auch hinter Proxies/im LAN)
  security: { checkOrigin: false },
  server: { port: 4321 },
});
