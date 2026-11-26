import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import netlify from '@astrojs/netlify';

// Auf Netlify (Umgebungsvariable NETLIFY beim Build) wird der Netlify-Adapter genutzt,
// lokal ein normaler Node-Server.
const aufNetlify = Boolean(process.env.NETLIFY);

export default defineConfig({
  output: 'server',
  adapter: aufNetlify ? netlify() : node({ mode: 'standalone' }),
  // Herkunftsprüfung erfolgt selbst in src/middleware.js (funktioniert auch hinter Proxies/im LAN)
  security: { checkOrigin: false },
  server: { port: 4321 },
});
