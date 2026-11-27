/* =====================================================================
   Gelsen Gold Slam – Animationen (GSAP), angelehnt an die TGG-Website
   1. Seite blendet weich ein
   2. Startseite: Platzlinien zeichnen sich, Titel baut sich Buchstabe für Buchstabe auf,
      Logo springt herein, Video wird aufgedeckt, Countdown zählt hoch
   3. Seitenköpfe und Abschnittsüberschriften steigen aus einer Maske auf
   4. Karten, Listen, Zeitplan, Logos erscheinen beim Scrollen gestaffelt
   5. Kopfzeile: Lesefortschritt, beim Runterscrollen aus-, beim Hochscrollen einblenden
   6. Mikroanimationen (nur mit Maus): magnetische Buttons, leichtes 3D-Kippen von Karten
   7. Fußzeile: großer Schriftzug „Gold Slam“ fährt herein
   Wer im Betriebssystem „Bewegung reduzieren“ eingestellt hat, sieht alles sofort ohne Bewegung.
   Die Live-Ergebnisse (laufend neu geladen) und die Verwaltung werden nicht animiert.
   ===================================================================== */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const html = document.documentElement;
const zeigen = () => html.classList.remove('js');
const $ = (s, r = document) => Array.from(r.querySelectorAll(s));
const one = (s, r = document) => r.querySelector(s);

// Elemente, die beim Scrollen gestaffelt erscheinen
const REVEAL = [
  '.konk-card', '.intro .facts', '.zeitplan li', '.spiral', '.cols > div > .card', '.cols aside .card',
  '.sponsoren li', '.bilder li', '.tabelle tr', '.werden > *', '.grid > .card', '.leer',
].join(', ');

function revealBlock(el) {
  if (!el) return gsap.timeline();
  return gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)', y: 40 },
    { clipPath: 'inset(0% 0% -20% 0%)', y: 0, duration: 0.9, ease: 'power3.out', clearProps: 'clipPath' });
}

const mm = gsap.matchMedia();
mm.add({ motion: '(prefers-reduced-motion: no-preference)', fine: '(hover: hover) and (pointer: fine)' }, (ctx) => {
  const { motion, fine } = ctx.conditions;
  if (!motion) { zeigen(); return; }

  /* ---------- 1. Einblenden */
  gsap.fromTo([one('main'), one('footer')].filter(Boolean), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power1.out', onStart: zeigen });

  /* ---------- 2. Startseite */
  const hero = one('.hero');
  if (hero) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    $('.hero-court .court-line').forEach((line) => {
      const len = line.getTotalLength ? line.getTotalLength() : 1200;
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    });
    tl.to($('.hero-court .court-line'), { strokeDashoffset: 0, duration: 1.6, stagger: 0.12, ease: 'power2.inOut' }, 0);
    tl.from(one('.hero-logo'), { autoAlpha: 0, scale: 0.6, rotate: -12, duration: 1, ease: 'back.out(1.7)' }, 0.05);
    // Stempel „Kids Edition“ wird aufgedrückt
    const ed = one('.edition');
    if (ed) {
      tl.from(ed, { autoAlpha: 0, scale: 2.6, rotate: -28, duration: 0.55, ease: 'power4.in' }, 0.75)
        .to(ed, { keyframes: [{ scale: 0.94, duration: 0.08 }, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.45)' }] }, '>');
    }
    const h1 = one('.hero h1');
    if (h1) {
      const s = SplitText.create(h1, { type: 'words,chars', mask: 'words' });
      tl.from(s.chars, { yPercent: 115, rotate: 8, duration: 0.9, stagger: 0.03, onComplete: () => s.revert() }, 0.25);
    }
    tl.from($('.hero .eyebrow, .hero-date'), { autoAlpha: 0, y: 18, duration: 0.7, stagger: 0.1 }, 0.35)
      .from($('.countdown > div'), { autoAlpha: 0, y: 16, scale: 0.9, duration: 0.6, stagger: 0.08, ease: 'back.out(2)' }, 0.55)
      .from($('.hero-cta .btn, .hero-note'), { autoAlpha: 0, y: 16, scale: 0.96, duration: 0.6, stagger: 0.08 }, 0.7)
      .fromTo(one('.hero-video video'), { clipPath: 'inset(100% 0% 0% 0% round 22px)', scale: 1.08 },
        { clipPath: 'inset(0% 0% 0% 0% round 22px)', scale: 1, duration: 1.3, ease: 'expo.out', clearProps: 'clipPath' }, 0.3)
      .from(one('.hero-video .ton'), { autoAlpha: 0, x: -16, duration: 0.6, ease: 'back.out(1.8)' }, 1.1);

    // Countdown zählt von 0 hoch, sobald die echten Werte gesetzt sind
    $('.countdown b').forEach((b) => {
      const ende = parseInt(b.textContent, 10);
      if (!Number.isFinite(ende) || ende <= 0) return;
      const o = { v: 0 };
      tl.to(o, { v: ende, duration: 1.4, ease: 'power2.out', onUpdate: () => { b.textContent = String(Math.round(o.v)); } }, 0.6);
    });

    gsap.to(one('.hero-video'), { yPercent: -8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(one('.hero-court'), { yPercent: 12, rotate: -14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------- 3. Seitenköpfe */
  $('.kopf, .live-head').forEach((k) => {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .add(revealBlock(one('h1', k)), 0.05)
      .from($('.eyebrow, .lead, .muted, .werkzeuge, .tabs', k), { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.08 }, 0.2);
  });

  // Abschnittsüberschriften: am PC Zeile für Zeile, am Handy als Ganzes
  $('main section:not(.hero):not(.kopf):not(.live-head) h2').forEach((h) => {
    if (h.closest('#ausgabe')) return; // Live-Ergebnisse nicht animieren
    const st = { trigger: h, start: 'top 88%', once: true };
    if (window.innerWidth >= 768) {
      const s = SplitText.create(h, { type: 'lines', mask: 'lines' });
      gsap.from(s.lines, { yPercent: 105, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: st });
    } else {
      gsap.timeline({ scrollTrigger: st }).add(revealBlock(h));
    }
  });

  /* ---------- 4. Gestaffeltes Erscheinen */
  const items = $(REVEAL);
  gsap.set(items, { autoAlpha: 0, y: 32 });
  ScrollTrigger.batch(items, {
    start: 'top 92%', once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out', overwrite: 'auto' }),
  });

  // Ablauf: goldene Zeitlinie wächst beim Scrollen mit
  const zp = one('.zeitplan');
  if (zp) {
    gsap.fromTo(zp, { '--linie': 0 }, { '--linie': 1, ease: 'none', scrollTrigger: { trigger: zp, start: 'top 75%', end: 'bottom 60%', scrub: 0.4 } });
  }

  // Spiralsystem-Grafik: Kreise springen auf, Linien zeichnen sich
  const svg = one('.spiral svg');
  if (svg) {
    const pfade = $('path', svg);
    pfade.forEach((p) => {
      const l = p.getTotalLength();
      // gestrichelte Linien behalten ihr Muster und werden nur eingeblendet
      if (p.getAttribute('stroke-dasharray')) gsap.set(p, { autoAlpha: 0 });
      else gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
    });
    gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 85%', once: true } })
      .from($('circle', svg), { scale: 0, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.06, ease: 'back.out(2.5)' })
      .to(pfade.filter((p) => !p.getAttribute('stroke-dasharray')), { strokeDashoffset: 0, duration: 0.8, stagger: 0.12, ease: 'power2.inOut' }, 0.3)
      .to(pfade.filter((p) => p.getAttribute('stroke-dasharray')), { autoAlpha: 1, duration: 0.5, stagger: 0.12 }, 0.9);
  }

  /* ---------- 7. Fußzeile */
  const wm = one('.wordmark');
  if (wm) {
    // Maske um die ganze Zeile statt um jeden Buchstaben: Kursive Buchstaben ragen
    // über ihre eigene Box hinaus und würden sonst rechts abgeschnitten.
    const sw = SplitText.create(wm, { type: 'lines,chars', mask: 'lines' });
    gsap.from(sw.chars, { yPercent: 110, duration: 1, stagger: 0.05, ease: 'power4.out',
      scrollTrigger: { trigger: wm, start: 'top 98%', once: true }, onComplete: () => sw.revert() });
    gsap.fromTo(wm, { xPercent: -4 }, { xPercent: 2, ease: 'none', scrollTrigger: { trigger: wm, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- 6. Mikroanimationen (nur mit Maus) */
  if (fine) {
    $('main .btn--gold, main .btn--navy').forEach((btn) => {
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      btn.addEventListener('pointerleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
    });
    $('.konk-card, .sponsoren li > a, .sponsoren li > div, .hero-video').forEach((card) => {
      gsap.set(card, { transformPerspective: 900 });
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
      const k = card.classList.contains('hero-video') ? 8 : 5;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * k); rx(-((e.clientY - r.top) / r.height - 0.5) * k);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  // Nachladende Bilder und Schrift verschieben Positionen – Scroll-Auslöser neu berechnen
  const refresh = () => ScrollTrigger.refresh();
  $('img').forEach((img) => { if (!img.complete) img.addEventListener('load', refresh, { once: true }); });
  document.fonts?.ready.then(refresh);
});

/* ---------- 5. Kopfzeile */
const header = one('.site-header');
const bar = one('.site-header .progress');
const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Auf der Live-Seite klebt der Ergebnis-Kopf unter der Kopfzeile – dort nicht ausblenden
const ausblenden = !ruhig && !one('.live-head');
let lastY = window.scrollY, versteckt = false;
function onScroll() {
  const y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
  if (bar) gsap.set(bar, { scaleX: max > 0 ? y / max : 0 });
  if (!ausblenden || !header) return;
  const menueOffen = one('#hauptnav')?.classList.contains('offen');
  if (y > lastY + 4 && y > 240 && !versteckt && !menueOffen) {
    versteckt = true; gsap.to(header, { yPercent: -100, duration: 0.35, ease: 'power2.in' });
  } else if ((y < lastY - 4 || y < 120) && versteckt) {
    versteckt = false; gsap.to(header, { yPercent: 0, duration: 0.45, ease: 'power3.out', clearProps: 'transform' });
  }
  lastY = y;
}
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobilmenü: Einträge gleiten nacheinander herein
if (!ruhig) {
  one('.menu-btn')?.addEventListener('click', () => {
    requestAnimationFrame(() => {
      const nav = one('#hauptnav');
      if (nav?.classList.contains('offen')) gsap.fromTo($('li', nav), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' });
    });
  });
}
