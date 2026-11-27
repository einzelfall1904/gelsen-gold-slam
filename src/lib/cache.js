// Netlify-Zwischenspeicher: Alle öffentlichen Inhalte tragen dieses Kennzeichen und werden
// nach jedem Speichern in der Verwaltung auf einen Schlag ungültig gemacht.
export const CACHE_TAG = 'inhalt';

/** Leert den Netlify-Zwischenspeicher (nur auf Netlify; lokal gibt es keinen). */
export async function leereZwischenspeicher() {
  const aufNetlify = Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT || globalThis.Netlify);
  if (!aufNetlify) return;
  try {
    const { purgeCache } = await import('@netlify/cache');
    await purgeCache({ tags: [CACHE_TAG] });
  } catch (err) {
    // Kein Abbruch: Dann sehen Besucher die Änderung spätestens nach 5 Minuten.
    console.error('Zwischenspeicher konnte nicht geleert werden', err);
  }
}
