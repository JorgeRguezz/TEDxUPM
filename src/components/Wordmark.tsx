import { Arrow } from './Arrow';
import { useId, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import artwork from '../assets/wordmark.json';
import { copy, event, type Locale } from '../data/event';

gsap.registerPlugin(useGSAP);

// Hold is wall-clock time; the remaining positions are relative to motion start at 1×.
// At default 0.25×: 1s hold + 0.3s glow build + 1.45s glow-to-fill blend + 0.25s settle = 3s.
const timing = { hold: 1, fill: 0.075, settle: 0.4375, end: 0.5 };
const glow = { resting: 0, initial: 0.72, peak: 0.75, outline: 0.35, settledOutline: 0 };
const fillOpacity = 1;

export function Wordmark({ locale, prototype = false, replay = 0, speed = 0.25, immersive = false, onComplete }: {
  locale: Locale; prototype?: boolean; replay?: number; speed?: number; immersive?: boolean; onComplete?: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const finishRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const prefix = `wm${useId().replace(/:/g, '')}`;

  useGSAP(() => {
    const node = root.current;
    if (!node) return;
    const fills = Array.from(node.querySelectorAll<SVGPathElement>('[data-fill]'));
    const halo = node.querySelector('[data-halo]');
    const baseline = node.querySelector('[data-baseline]');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let done = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let timeline: gsap.core.Timeline | undefined;
    const finish = () => {
      if (done) return;
      done = true;
      timeline?.kill();
      clearTimeout(timer);
      gsap.set(fills, { opacity: fillOpacity });
      gsap.set(halo, { opacity: glow.resting });
      gsap.set(baseline, { opacity: glow.settledOutline });
      if (document.activeElement === skipRef.current) node.focus({ preventScroll: true });
      setPlaying(false);
      if (!prototype) { try { sessionStorage.setItem('tedx-intro-seen', '1'); } catch { /* optional storage */ } }
      onComplete?.();
    };
    finishRef.current = finish;
    let seen = false;
    try { seen = sessionStorage.getItem('tedx-intro-seen') === '1'; } catch { /* optional storage */ }
    if (motion.matches || (!prototype && (seen || window.location.hash))) {
      finish();
      return;
    }
    try {
      gsap.set(fills, { opacity: 0 });
      gsap.set(halo, { opacity: glow.initial });
      gsap.set(baseline, { opacity: glow.outline });
      setPlaying(true);
      timeline = gsap.timeline({ onComplete: finish });
      // Compensate for timeline.timeScale so a slower speed never lengthens the opening pause.
      const motionStart = timing.hold * speed;
      const phase = (position: number) => motionStart + position;
      // Build the existing glow directly into the letter fill; no traveling contours.
      timeline.to(halo, { opacity: glow.peak, duration: 0.15, ease: 'sine.inOut' }, motionStart);
      timeline.to(baseline, { opacity: 0.7, duration: 0.15, ease: 'sine.inOut' }, motionStart);
      // Blend the original silhouettes directly. Large expanding mask strokes produce
      // dark seams in WebKit at narrow curves (s, o, c), even before completion.
      timeline.to(fills, {
        opacity: fillOpacity, duration: timing.settle - timing.fill, ease: 'power2.inOut',
      }, phase(timing.fill));
      timeline.to(halo, { opacity: glow.resting, duration: timing.end - timing.settle }, phase(timing.settle));
      timeline.to(baseline, { opacity: glow.settledOutline, duration: timing.end - timing.settle }, phase(timing.settle));
      timeline.timeScale(speed);
      timer = setTimeout(finish, (timeline.duration() / speed + 3) * 1000);
    } catch { finish(); }
    const onMotion = () => { if (motion.matches) finish(); };
    motion.addEventListener('change', onMotion);
    return () => {
      clearTimeout(timer);
      motion.removeEventListener('change', onMotion);
      timeline?.kill();
      gsap.set(fills, { opacity: fillOpacity });
      finishRef.current = () => {};
    };
  }, { scope: root, dependencies: [replay, prototype, speed, onComplete], revertOnUpdate: true });

  return <div ref={root} className={`wordmark-wrap${immersive ? ' wordmark-wrap--immersive' : ''}`} tabIndex={-1}>
    <svg className="wordmark" viewBox={artwork.viewBox} role="img" aria-label={event.name}>
      <defs>
        <filter id={`${prefix}-halo`} x="-12%" y="-25%" width="124%" height="150%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <g data-animated-artwork="" display={playing ? undefined : 'none'}>
        <g data-halo="" opacity={glow.resting} fill="none" strokeWidth="6" filter={`url(#${prefix}-halo)`}>
          {artwork.letters.map((letter, i) => <path key={i} d={letter.d} stroke={letter.red ? '#EB0028' : '#FFFFFF'} />)}
        </g>
        <g>{artwork.letters.map((letter, i) => <path key={i} d={letter.d} fill="#000000" />)}</g>
        <g opacity={fillOpacity}>{artwork.letters.map((letter, i) => <path key={i} d={letter.d} fill={letter.red ? '#EB0028' : '#FFFFFF'} data-fill={i} />)}</g>
        <g data-baseline="" opacity={glow.settledOutline} fill="none" strokeWidth="0.85" strokeLinejoin="round">
          {artwork.letters.map((letter, i) => <path key={i} d={letter.d} stroke={letter.red ? '#EB0028' : '#FFFFFF'} />)}
        </g>
      </g>
      {/* A separate, effect-free final layer avoids stale SVG mask/filter tiles in WebKit.
          Keep the animated nodes mounted so replay can reuse the same GSAP targets. */}
      <g data-static-artwork="" opacity={fillOpacity} display={playing ? 'none' : undefined}>
        {artwork.letters.map((letter, i) => <path key={i} d={letter.d} fill={letter.red ? '#EB0028' : '#FFFFFF'} />)}
      </g>
    </svg>
    {playing && <button ref={skipRef} type="button" className="skip-animation" onClick={() => finishRef.current()}>{copy[locale].skipAnimation} <Arrow /></button>}
  </div>;
}
