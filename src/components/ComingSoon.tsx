import { useEffect, useState } from 'react';
import { event, href, type Locale } from '../data/event';
import { SiteFooter, SiteHeader } from './Site';

// Inicio del evento: 26/02/2027 09:00 en Madrid (CET, UTC+1 en febrero).
const START = Date.parse('2027-02-26T09:00:00+01:00');
// La X de la identidad (la misma figura que en la rama rediseno-cartel), dibujada como línea de luz (demo de Abril).
const X = 'M4 4H32L50 34L68 4H96L66 50L96 96H68L50 66L32 96H4L34 50Z';

const t = {
  es: {
    soon: 'Próximamente', date: '26.02.2027', place: 'ETSII · Madrid', placeLabel: 'Cómo llegar a la ETSII, Madrid',
    units: ['días', 'horas', 'min', 'seg'], today: 'Hoy es el día.', countLabel: 'Tiempo restante hasta el evento',
    day: {
      label: 'La jornada',
      title: 'Un día de charlas en la ETSII',
      body: 'Charlas breves en el auditorio de la Escuela de Ingenieros Industriales y, en las pausas, encuentros en la Sala de la Máquina entre estudiantes, antiguos alumnos y profesionales.',
      facts: [['~350', 'personas'], ['Auditorio', 'charlas'], ['Sala de la Máquina', 'encuentros en las pausas']],
    },
    // Ponentes: destino provisional (Instagram) hasta tener email de contacto.
    calls: [
      ['Para empresas', 'Haz posible la primera edición', 'Tres formas de participar en la jornada: una experiencia interactiva, un punto de encuentro o un servicio del evento.', 'Cómo colaborar', href('es', 'partners')],
      ['Para ponentes', 'Buscamos ideas, no currículums', 'Ingeniería, tecnología, investigación, emprendimiento o el propio oficio de comunicar: buscamos ideas propias y con fundamento.', 'Propón tu charla', event.instagram],
    ],
  },
  en: {
    soon: 'Coming soon', date: '26.02.2027', place: 'ETSII · Madrid', placeLabel: 'Directions to ETSII, Madrid',
    units: ['days', 'hours', 'min', 'sec'], today: 'The day is here.', countLabel: 'Time left until the event',
    day: {
      label: 'The day',
      title: 'A day of talks at ETSII',
      body: 'Short talks in the auditorium of the School of Industrial Engineering and, during the breaks, students, alumni and professionals meeting in the Machine Hall.',
      facts: [['~350', 'people'], ['Auditorium', 'talks'], ['Machine Hall', 'meetings during the breaks']],
    },
    calls: [
      ['For companies', 'Help build our first edition', 'Three ways to take part on the day: an interactive experience, a meeting point or an event service.', 'How to partner', href('en', 'partners')],
      ['For speakers', "We're after ideas, not résumés", 'Engineering, technology, research, entrepreneurship, or the craft of speaking itself: bring an original, well-grounded idea.', 'Propose a talk', event.instagram],
    ],
  },
};

export function remaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
}

export function ComingSoon({ locale }: { locale: Locale }) {
  const p = t[locale];
  // null en el prerender: el servidor no sabe la hora del visitante, así no hay desajuste al hidratar.
  const [left, setLeft] = useState<number[] | null>(null);
  useEffect(() => {
    const tick = () => setLeft(remaining(START - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const done = left?.every(n => n === 0);

  return <main id="main" className="cs">
    <SiteHeader locale={locale} page="home" />

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
      <a href="#jornada" className="cs-scroll" aria-label={locale === 'es' ? 'Bajar a La jornada' : 'Scroll to The day'} />
    </section>

    <section id="jornada" className="cs-day" aria-labelledby="cs-day-title">
      <div>
        <p className="cs-label">{p.day.label}</p>
        <h2 id="cs-day-title">{p.day.title}</h2>
        <p>{p.day.body}</p>
      </div>
      <dl>
        {p.day.facts.map(([value, label]) => <div key={value}><dt>{value}</dt><dd>{label}</dd></div>)}
      </dl>
    </section>

    <section className="cs-calls" aria-label={locale === 'es' ? 'Participa' : 'Get involved'}>
      {p.calls.map(([label, title, body, cta, url]) => {
        const external = url.startsWith('http');
        return <article key={label}>
          <p className="cs-label">{label}</p>
          <h2>{title}</h2>
          <p>{body}</p>
          <a href={url} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{cta} <span aria-hidden="true">{external ? '↗' : '→'}</span></a>
        </article>;
      })}
    </section>

    <SiteFooter locale={locale} />
  </main>;
}
