import { useEffect, useId, useRef, useState } from 'react';

function TopicIcon({ index }: { index: number }) {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {index === 0 ? <>
      <ellipse cx="24" cy="24" rx="20" ry="8" />
      <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(120 24 24)" />
      <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
    </> : index === 1 ? <>
      <path d="m24 6 4.5 13.5L42 24l-13.5 4.5L24 42l-4.5-13.5L6 24l13.5-4.5Z" fill="currentColor" fillOpacity=".1" />
      <path d="m36 6 1.5 4.5L42 12l-4.5 1.5L36 18l-1.5-4.5L30 12l4.5-1.5Z" />
    </> : index === 2 ? <>
      <circle cx="24" cy="12" r="7" />
      <circle cx="9" cy="15" r="5" /><circle cx="39" cy="15" r="5" />
      <path d="M19 23c3 2 7 2 10 0a13 13 0 0 1 8 12v7c-8 3-18 3-26 0v-7a13 13 0 0 1 8-12Z" />
      <path d="M7 23c2 1.5 5 1.5 7 0M7 23a10 10 0 0 0-6 9v6c3 1.5 6 2 9 2M34 23c2 1.5 5 1.5 7 0M41 23a10 10 0 0 1 6 9v6c-3 1.5-6 2-9 2" />
    </> : <>
      <circle cx="24" cy="24" r="19" /><ellipse cx="24" cy="24" rx="8" ry="19" />
      <path d="M5 24h38M9 13.5c9 5 21 5 30 0M9 34.5c9-5 21-5 30 0" />
    </>}
  </svg>;
}

export function TopicAccordion({ topics, expandHint }: { topics: string[][]; expandHint: string }) {
  const [active, setActive] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prefix = useId();
  const cancelTimer = () => clearTimeout(timer.current);
  useEffect(() => () => clearTimeout(timer.current), []);
  const toggle = (index: number) => {
    cancelTimer();
    setActive(current => current === index ? null : index);
  };
  return <div className="topic-list topic-accordion" onPointerLeave={e => {
    if (e.pointerType !== 'mouse') return;
    cancelTimer();
    timer.current = setTimeout(() => setActive(null), 220);
  }}>
    <p className="topic-expand-hint">{expandHint}</p>
    {topics.map(([title, body], index) => <article
      className={`topic${active === index ? ' topic--expanded' : ''}`}
      key={title}
      onPointerEnter={e => {
        if (e.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        cancelTimer();
        timer.current = setTimeout(() => setActive(index), 100);
      }}
      onPointerLeave={cancelTimer}
    >
      <button type="button" className="topic-trigger" aria-expanded={active === index}
        aria-label={title} aria-controls={`${prefix}-description-${index}`}
        aria-describedby={active === index ? `${prefix}-description-${index}` : undefined}
        onClick={() => toggle(index)} onFocus={cancelTimer}>
        <span className="topic-number" aria-hidden="true">0{index + 1}</span>
        <span className="topic-copy"><span className="topic-title">{title}</span><span className="topic-description" id={`${prefix}-description-${index}`} aria-hidden={active !== index}><span className="topic-description-clip"><span className="topic-description-text">{body}</span></span></span></span>
        <span className={`topic-icon topic-icon--${index}`}><TopicIcon index={index} /></span>
      </button>
    </article>)}
  </div>;
}
