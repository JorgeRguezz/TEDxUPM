import { useId, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import artwork from '../assets/wordmark.json';
import { copy, event, type Locale } from '../data/event';
import { contourMotion, contourTurns } from '../animation/contourMotion';

gsap.registerPlugin(useGSAP);

// Hold is wall-clock time; the remaining positions are relative to motion start at 1×.
// At default 0.25×: 1s hold + 1.2s tracing + 0.15s convergence + 0.4s fill + 0.25s settle = 3s.
const timing = { hold: 1, trace: 0.3, converge: 0.3, fill: 0.3375, settle: 0.4375, end: 0.5 };
const glow = { resting: 0, tracing: 0.72, peak: 0.95, outline: 0.35, settledOutline: 0 };

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
    const trails = Array.from(node.querySelectorAll<SVGPathElement>('[data-trail]'));
    const widths = Array.from(node.querySelectorAll<SVGPathElement>('[data-mask-stroke]'));
    const outlines = Array.from(node.querySelectorAll<SVGPathElement>('[data-outline]'));
    const group = node.querySelector('[data-trails]');
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
      fills.forEach(p => p.removeAttribute('mask'));
      gsap.set([group, ...outlines], { opacity: 0 });
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
      fills.forEach(p => p.setAttribute('mask', `url(#${prefix}-${p.dataset.fill})`));
      gsap.set(widths, { attr: { 'stroke-width': 0 } });
      gsap.set(outlines, { opacity: 0 });
      gsap.set(group, { opacity: 0 });
      gsap.set(halo, { opacity: glow.tracing });
      gsap.set(baseline, { opacity: glow.outline });
      setPlaying(true);
      const lengths = new Map<SVGPathElement, number>();
      trails.forEach(p => lengths.set(p, p.getTotalLength()));
      const progress = { elapsed: 0, coverage: 0.1, fill: 0 };
      const draw = () => {
        const turns = contourTurns(progress.elapsed);
        trails.forEach(p => {
          const length = lengths.get(p)!;
          const index = Number(p.dataset.order || 0);
          const tail = Number(p.dataset.tail || 0);
          const segment = progress.coverage / 5;
          const coverage = tail === 0 ? 0.008 : segment * 1.1;
          const dash = Math.max(1, length * coverage);
          p.setAttribute('stroke-dasharray', `${dash} ${length - dash}`);
          p.setAttribute('stroke-dashoffset', `${-length * (turns + index * 0.083 - (tail === 0 ? 0 : tail * segment))}`);
        });
      };
      draw();
      timeline = gsap.timeline({ onComplete: finish });
      // Compensate for timeline.timeScale so a slower speed never lengthens the opening pause.
      const motionStart = timing.hold * speed;
      const phase = (position: number) => motionStart + position;
      timeline.to(group, { opacity: 1, duration: 0.075, ease: 'power1.inOut' }, motionStart);
      // Reach the historical top speed sooner, hold it, and keep moving through the fade.
      // Drive elapsed time linearly; contourTurns integrates explicit velocity targets.
      timeline.to(progress, {
        elapsed: timing.fill / contourMotion.referenceSpeed,
        duration: timing.fill, ease: 'none', onUpdate: draw,
      }, motionStart);
      timeline.to(progress, { coverage: 0.22, duration: timing.trace, ease: 'power1.in', onUpdate: draw }, motionStart);
      timeline.to(halo, { opacity: glow.peak, duration: 0.1, ease: 'sine.inOut' }, phase(timing.trace - 0.1));
      timeline.to(outlines, { opacity: 0.85, duration: timing.fill - timing.converge, ease: 'sine.inOut' }, phase(timing.converge));
      timeline.to(group, { opacity: 0, duration: timing.fill - timing.converge }, phase(timing.converge));
      timeline.to(progress, {
        fill: 110, duration: timing.settle - timing.fill, ease: 'power2.inOut',
        onUpdate: () => widths.forEach(p => p.setAttribute('stroke-width', `${progress.fill}`)),
      }, phase(timing.fill));
      timeline.to(outlines, { opacity: 0, duration: timing.end - timing.settle }, phase(timing.settle));
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
      fills.forEach(p => p.removeAttribute('mask'));
      finishRef.current = () => {};
    };
  }, { scope: root, dependencies: [replay, prototype, speed, onComplete], revertOnUpdate: true });

  return <div ref={root} className={`wordmark-wrap${immersive ? ' wordmark-wrap--immersive' : ''}`} tabIndex={-1}>
    <svg className="wordmark" viewBox={artwork.viewBox} role="img" aria-label={event.name}>
      <defs>
        <filter id={`${prefix}-blur`} x="-12%" y="-25%" width="124%" height="150%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="2.8" />
        </filter>
        <filter id={`${prefix}-halo`} x="-12%" y="-25%" width="124%" height="150%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        {artwork.letters.map((letter, i) => <g key={i}>
          <clipPath id={`${prefix}-clip-${i}`}><path d={letter.d} fillRule="nonzero" /></clipPath>
          <mask id={`${prefix}-${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={artwork.width} height={artwork.height} style={{ maskType: 'luminance' }}>
            <g clipPath={`url(#${prefix}-clip-${i})`}>
              {letter.contours.map((d, j) => <path key={j} d={d} fill="none" stroke="white" strokeWidth="0" strokeLinejoin="round" data-mask-stroke="" />)}
            </g>
          </mask>
        </g>)}
      </defs>
      <g data-halo="" opacity={glow.resting} fill="none" strokeWidth="6" filter={`url(#${prefix}-halo)`}>
        {artwork.letters.map((letter, i) => <path key={i} d={letter.d} stroke={letter.red ? '#EB0028' : '#FFFFFF'} />)}
      </g>
      <g>{artwork.letters.map((letter, i) => <path key={i} d={letter.d} fill="#000000" />)}</g>
      <g>{artwork.letters.map((letter, i) => <path key={i} d={letter.d} fill={letter.red ? '#EB0028' : '#FFFFFF'} data-fill={i} />)}</g>
      <g data-baseline="" opacity={glow.settledOutline} fill="none" strokeWidth="0.85" strokeLinejoin="round">
        {artwork.letters.map((letter, i) => <path key={i} d={letter.d} stroke={letter.red ? '#EB0028' : '#FFFFFF'} />)}
      </g>
      <g data-trails="" opacity="0" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {[5, 4, 3, 2, 1, 0].map(tail => <g key={tail} opacity={tail === 0 ? 1 : 0.82 * Math.pow(0.6, tail - 1)} filter={tail >= 3 ? `url(#${prefix}-blur)` : undefined}>
          {artwork.letters.flatMap((letter, i) => letter.contours.map((d, j) => <path key={`${i}-${j}`} d={d} stroke={letter.red ? (tail === 0 ? '#ffd1da' : '#EB0028') : '#FFFFFF'} strokeWidth={tail === 0 ? 1.25 : tail >= 3 ? 4 : 1.8} data-trail="" data-order={i} data-tail={tail} />))}
        </g>)}
      </g>
      <g fill="none" strokeWidth="1.5" strokeLinejoin="round">
        {artwork.letters.map((letter, i) => <path key={i} d={letter.d} stroke={letter.red ? '#EB0028' : '#FFFFFF'} data-outline="" opacity="0" />)}
      </g>
    </svg>
    {playing && <button ref={skipRef} type="button" className="skip-animation" onClick={() => finishRef.current()}>{copy[locale].skipAnimation} <span aria-hidden="true">↗</span></button>}
  </div>;
}
