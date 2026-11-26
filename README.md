# Gelsen Gold Slam 2027 – Turnierwebsite

Website für das LK-Jugendturnier (U12, U15, U18 – m/w, Spiralsystem) der TG Gold-Weiß Gelsenkirchen.
Läuft im Moment **nur lokal zum Testen**.

## Starten (einmalig Node.js installieren)

1. Node.js ab Version 20 installieren: https://nodejs.org (LTS-Version)
2. Ordner `gelsen-gold-slam` öffnen, darin ein Terminal öffnen.
3. Einmalig die Bausteine installieren:

   ```bash
   npm install
   ```

4. Website starten:

   ```bash
   npm run dev
   ```

5. Im Browser öffnen: **http://localhost:4321**
   Die Turnierleitung erreicht ihr unter **http://localhost:4321/admin**.
   Passwort im Testbetrieb: `goldslam2027`

Tipp: `npm run dev` zeigt auch eine „Network“-Adresse (z. B. `http://192.168.0.23:4321`).
Damit könnt ihr die Seite im gleichen WLAN auch am Handy testen.

## Was wo gepflegt wird (alles unter /admin)

| Bereich | Wofür |
|---|---|
| Ergebnisse | Am Turniertag: Status wählen, Sätze eintippen, „Ergebnis veröffentlichen“ |
| Spielplan | Paarungen, Zeiten, Plätze. Warnt bei Doppelbelegung und mehr als 2 Einzeln pro Kind |
| Spieler | Teilnehmer mit Verein und LK |
| Konkurrenzen | Namen, Jahrgänge, Feldgrößen |
| Texte & Eckdaten | Datum, Meldeschluss, Startgeld, alle Texte, Impressum |
| Spieler: Foto-Einwilligung | Je Kind: Einwilligung der Eltern liegt vor / offen / widerrufen |
| Ablauf / Sponsoren / Galerie | Zeitplan, Logos, Fotos. Ein Foto ist nur öffentlich, wenn für **jedes** abgebildete Kind die Einwilligung vorliegt |

Alle Inhalte sind Platzhalter. Die Spielernamen sind frei erfunden.
„Texte & Eckdaten“ → „Beispieldaten wiederherstellen“ setzt alles zurück.

## Technik in Kürze

- [Astro](https://astro.build) mit Node-Server, Daten in `data/turnier.json`, Uploads in `data/uploads/`
- Ergebnisprüfung nach WTV-Richtlinien für LK-Turniere: `src/lib/tennis.js` (Tests: `npm test`)
- Passwort ändern: Umgebungsvariable `ADMIN_PASSWORT` setzen
- Für den Betrieb im Internet wird der Datenspeicher später durch ein Redaktionssystem (z. B. Sanity) ersetzt
