import { useEffect, useState } from 'react';
import { event, href, type Locale } from '../data/event';
import { TedxMark } from './TedxMark';

// Inicio del evento: 26/02/2027 09:00 en Madrid (CET, UTC+1 en febrero).
const START = Date.parse('2027-02-26T09:00:00+01:00');
// La X de la identidad (la misma figura que en la rama rediseno-cartel), dibujada como línea de luz (demo de Abril).
const X = 'M4 4H32L50 34L68 4H96L66 50L96 96H68L50 66L32 96H4L34 50Z';

// Tarjeta de «Participa». `points` es opcional: hoy solo la usa la de empresas (las tres modalidades, sin precios).
type Call = { label: string; title: string; body: string; points?: [string, string][]; cta: string; url: string };

const t = {
  es: {
    soon: 'Próximamente', date: '26.02.2027', place: 'ETSII · Madrid', placeLabel: 'Cómo llegar a la ETSII, Madrid',
    units: ['días', 'horas', 'min', 'seg'], today: 'Hoy es el día.', countLabel: 'Tiempo restante hasta el evento',
    theme: { dark: 'Cambiar a modo claro', light: 'Cambiar a modo oscuro' },
    about: 'TEDx es un programa de eventos locales, organizados de forma independiente, que reúnen a personas para compartir ideas al estilo de TED, la organización sin ánimo de lucro dedicada a difundir ideas en charlas breves.',
    more: 'Qué es TEDx',
    // Destino provisional: LinkedIn (empresas) e Instagram (ponentes) hasta tener email de contacto.
    calls: [
      {
        label: 'Para empresas',
        title: 'Haz posible la primera edición',
        body: 'Más de 350 estudiantes, alumni y profesionales de la UPM pasarán el día en la ETSII. Tu empresa puede estar con ellos de tres formas:',
        points: [
          ['Experience Partner', 'una experiencia interactiva propia en la Sala de la Máquina, diseñada con nosotros.'],
          ['Partner', 'un punto de encuentro con los asistentes en los descansos.'],
          ['Supporting Partner', 'apoyo económico o en especie (catering, transporte, impresión…).'],
        ],
        cta: 'Escríbenos para colaborar',
        url: event.linkedin,
      },
      {
        label: 'Para ponentes',
        title: 'Buscamos ideas, no currículums',
        body: 'Ingeniería, tecnología, investigación, emprendimiento o el propio oficio de comunicar: buscamos ideas propias y con fundamento.',
        cta: 'Propón tu charla',
        url: event.instagram,
      },
    ] as Call[],
  },
  en: {
    soon: 'Coming soon', date: '26.02.2027', place: 'ETSII · Madrid', placeLabel: 'Directions to ETSII, Madrid',
    units: ['days', 'hours', 'min', 'sec'], today: 'The day is here.', countLabel: 'Time left until the event',
    theme: { dark: 'Switch to light mode', light: 'Switch to dark mode' },
    about: 'TEDx is a program of local, independently organized events that bring people together to share ideas in the spirit of TED, the nonprofit devoted to spreading ideas in short, powerful talks.',
    more: 'About TEDx',
    calls: [
      {
        label: 'For companies',
        title: 'Help build our first edition',
        body: '350+ UPM students, alumni and professionals will spend the day at ETSII. Your company can join them in three ways:',
        points: [
          ['Experience Partner', 'your own interactive experience in the Sala de la Máquina, designed with our team.'],
          ['Partner', 'a meeting point with attendees during the breaks.'],
          ['Supporting Partner', 'financial or in-kind support (catering, travel, printing…).'],
        ],
        cta: 'Get in touch',
        url: event.linkedin,
      },
      {
        label: 'For speakers',
        title: "We're after ideas, not résumés",
        body: 'Engineering, technology, research, entrepreneurship, or the craft of speaking itself: bring an original, well-grounded idea.',
        cta: 'Propose a talk',
        url: event.instagram,
      },
    ] as Call[],
  },
};

export function remaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
}

type Theme = 'dark' | 'light';
const currentTheme = (): Theme => (document.documentElement.dataset.theme as Theme) || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

export function ComingSoon({ locale }: { locale: Locale }) {
  const p = t[locale];
  // null en el prerender: el servidor no sabe la hora del visitante, así no hay desajuste al hidratar.
  const [left, setLeft] = useState<number[] | null>(null);
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(() => {
    setTheme(currentTheme());
    const tick = () => setLeft(remaining(START - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* sin almacenamiento: el cambio dura hasta recargar */ }
    setTheme(next);
  };
  const done = left?.every(n => n === 0);

  return <main id="main" className="cs">
    <header className="cs-top">
      <a href={href(locale)} className="cs-brand" aria-label={event.name}><TedxMark /><span>Universidad<br />Politecnica Madrid</span></a>
      <div className="cs-tools">
        <nav className="cs-lang" aria-label={locale === 'es' ? 'Idioma' : 'Language'}>
          {(['es', 'en'] as Locale[]).map(l => <a key={l} lang={l} href={href(l)} aria-current={l === locale ? 'true' : undefined}>{l.toUpperCase()}</a>)}
        </nav>
        <button type="button" className="cs-theme" onClick={toggleTheme} aria-label={p.theme[theme]}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16Z" /></svg>
        </button>
      </div>
    </header>

    <section className="cs-hero" aria-labelledby="cs-title">
      <svg className="cs-x" viewBox="0 0 100 100" aria-hidden="true"><path d={X} pathLength={100} /></svg>
      <h1 id="cs-title"><span className="cs-soon">{p.soon}</span><span className="sr-only"> · {event.name}</span></h1>

      {done ? <p className="cs-today">{p.today}</p> :
        <div className="cs-count" role="timer" aria-label={p.countLabel}>
          {p.units.map((unit, i) => <div key={unit}>
            <span className="cs-num">{left ? String(left[i]).padStart(2, '0') : '--'}</span>
            <span className="cs-unit">{unit}</span>
          </div>)}
        </div>}

      <p className="cs-meta">
        <time dateTime="2027-02-26T09:00:00+01:00">{p.date}</time>
        <span aria-hidden="true">·</span>
        <a href={event.directions} target="_blank" rel="noreferrer" aria-label={p.placeLabel}>{p.place}</a>
      </p>
      <a href="#participa" className="cs-scroll" aria-label={locale === 'es' ? 'Bajar a Participa' : 'Scroll to Get involved'} />
    </section>

    <section id="participa" className="cs-calls" aria-label={locale === 'es' ? 'Participa' : 'Get involved'}>
      {p.calls.map(({ label, title, body, points, cta, url }) => <article key={label}>
        <p className="cs-label">{label}</p>
        <h2>{title}</h2>
        <p>{body}</p>
        {points && <ul className="cs-points">
          {points.map(([name, text]) => <li key={name}><strong>{name}</strong>: {text}</li>)}
        </ul>}
        <a href={url} target="_blank" rel="noreferrer">{cta} <span aria-hidden="true">↗</span></a>
      </article>)}
    </section>

    <footer className="cs-foot">
      {/* Nombre completo en una línea (TED exige el nombre completo; "TEDxUPM" pendiente de confirmar). */}
      <p className="cs-sign"><TedxMark /><span className="sr-only">TEDx</span><span>Universidad Politecnica Madrid</span></p>
      <p>{p.about} <a href="https://www.ted.com/tedx" target="_blank" rel="noreferrer">{p.more} ↗</a></p>
      <div className="cs-end">
        <p className="cs-legal">This independent TEDx event is operated under license from TED.</p>
        <nav className="cs-social" aria-label={locale === 'es' ? 'Redes sociales' : 'Social media'}>
          <a href={event.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>
          <a href={event.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
        </nav>
      </div>
    </footer>
  </main>;
}
