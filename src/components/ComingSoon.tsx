import { useEffect, useState, type FormEvent } from 'react';
import { event, href, type Locale } from '../data/event';
import { SiteFooter, SiteHeader } from './Site';

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
    venue: { label: 'Dónde', title: 'Escuela Técnica Superior de Ingenieros Industriales', cta: 'Cómo llegar', alt: 'Máquina de vapor de Watt de la Sala de la Máquina de la ETSII' },
    day: {
      label: 'La jornada',
      title: 'Un día de charlas en la ETSII',
      body: 'Charlas breves en el auditorio y encuentros en la Sala de la Máquina.',
      facts: [['~350', 'personas'], ['Auditorio', 'charlas'], ['Sala de la Máquina', 'encuentros en las pausas']],
    },
    // Ponentes: la propuesta de charla llega por correo.
    subscribe: {
      label: 'Novedades', title: 'Avisadme de las novedades', email: 'Correo electrónico', send: 'Apuntarme',
      consent: 'Acepto recibir novedades de TEDxUniversidad Politécnica Madrid.',
      privacy: `Responsable: TEDxUniversidad Politécnica Madrid. Finalidad: avisarte de entradas, ponentes y novedades del evento. Conservación: hasta que pidas la baja. Acceso, rectificación y supresión en ${event.email}.`,
      done: 'Listo. Te avisaremos.', error: `No se ha podido guardar. Inténtalo de nuevo o escribe a ${event.email}.`,
    },
    calls: [
      {
        label: 'Para empresas',
        title: 'Haz posible la primera edición',
        body: 'Unas 350 personas entre estudiantes, alumni y profesionales de la UPM pasarán el día en la ETSII. Tu empresa puede estar con ellos de tres formas:',
        points: [
          ['Experience Partner', 'una experiencia interactiva propia en la Sala de la Máquina, diseñada con nosotros.'],
          ['Partner', 'un punto de encuentro con los asistentes en los descansos.'],
          ['Supporting Partner', 'apoyo económico o en especie (catering, transporte, impresión…).'],
        ],
        cta: 'Cómo colaborar',
        url: href('es', 'partners'),
      },
      {
        label: 'Para ponentes',
        title: 'Buscamos ideas, no currículums',
        body: 'Ingeniería, tecnología, investigación, emprendimiento o el propio oficio de comunicar: buscamos ideas propias y con fundamento.',
        cta: 'Propón tu charla',
        url: `mailto:${event.email}?subject=${encodeURIComponent('Propuesta de charla')}`,
      },
    ] as Call[],
  },
  en: {
    soon: 'Coming soon', date: '26.02.2027', place: 'ETSII · Madrid', placeLabel: 'Directions to ETSII, Madrid',
    units: ['days', 'hours', 'min', 'sec'], today: 'The day is here.', countLabel: 'Time left until the event',
    venue: { label: 'Where', title: 'Escuela Técnica Superior de Ingenieros Industriales', cta: 'Directions', alt: 'Watt steam engine in the ETSII Machine Hall' },
    day: {
      label: 'The day',
      title: 'A day of talks at ETSII',
      body: 'Short talks in the auditorium and meetings in the Machine Hall.',
      facts: [['~350', 'people'], ['Auditorium', 'talks'], ['Machine Hall', 'meetings during the breaks']],
    },
    subscribe: {
      label: 'Updates', title: 'Keep me posted', email: 'Email address', send: 'Sign me up',
      consent: 'I agree to receive updates from TEDxUniversidad Politécnica Madrid.',
      privacy: `Controller: TEDxUniversidad Politécnica Madrid. Purpose: telling you about tickets, speakers and event news. Retention: until you ask to unsubscribe. Access, rectification and erasure at ${event.email}.`,
      done: "Done. We'll let you know.", error: `We couldn't save it. Try again or write to ${event.email}.`,
    },
    calls: [
      {
        label: 'For companies',
        title: 'Help build our first edition',
        body: 'Around 350 UPM students, alumni and professionals will spend the day at ETSII. Your company can join them in three ways:',
        points: [
          ['Experience Partner', 'your own interactive experience in the Sala de la Máquina, designed with our team.'],
          ['Partner', 'a meeting point with attendees during the breaks.'],
          ['Supporting Partner', 'financial or in-kind support (catering, travel, printing…).'],
        ],
        cta: 'How to partner',
        url: href('en', 'partners'),
      },
      {
        label: 'For speakers',
        title: "We're after ideas, not résumés",
        body: 'Engineering, technology, research, entrepreneurship, or the craft of speaking itself: bring an original, well-grounded idea.',
        cta: 'Propose a talk',
        url: `mailto:${event.email}?subject=${encodeURIComponent('Talk proposal')}`,
      },
    ] as Call[],
  },
};

export function remaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
}

// Alta en la lista de novedades: POST /api/subscribe (guarda el correo; el envío con Resend llegará más adelante).
function Subscribe({ locale }: { locale: Locale }) {
  const p = t[locale].subscribe;
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState('sending');
    try {
      const r = await fetch('/api/subscribe', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: f.get('email'), consent: f.get('consent') === 'on', website: f.get('website') }),
      });
      setState(r.ok ? 'done' : 'error');
    } catch { setState('error'); }
  };
  return <section className="cs-sub" aria-labelledby="cs-sub-title">
    <p className="cs-label">{p.label}</p>
    <h2 id="cs-sub-title">{p.title}</h2>
    {state === 'done' ? <p role="status" className="cs-sub-msg">{p.done}</p> :
      <form onSubmit={submit}>
        <div className="cs-sub-row">
          <label className="sr-only" htmlFor="cs-email">{p.email}</label>
          <input id="cs-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder={p.email} />
          <button type="submit" disabled={state === 'sending'}>{p.send}</button>
        </div>
        <label className="cs-sub-consent"><input name="consent" type="checkbox" required /> <span>{p.consent}</span></label>
        <input className="cs-sub-hp" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <p className="cs-sub-privacy">{p.privacy}</p>
        {state === 'error' && <p role="alert" className="cs-sub-msg">{p.error}</p>}
      </form>}
  </section>;
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
      {p.calls.map(({ label, title, body, points, cta, url }) => {
        const external = url.startsWith('http');
        return <article key={label}>
          <p className="cs-label">{label}</p>
          <h2>{title}</h2>
          <p>{body}</p>
          {points && <ul className="cs-points">
            {points.map(([name, text]) => <li key={name}><strong>{name}</strong>: {text}</li>)}
          </ul>}
          <a href={url} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{cta} <span aria-hidden="true">{external ? '↗' : '→'}</span></a>
        </article>;
      })}
    </section>

    <section className="cs-venue" aria-labelledby="cs-venue-title">
      <img src="/img/maquina-watt-bn.jpg" alt={p.venue.alt} width={800} height={594} loading="lazy" />
      <div>
        <p className="cs-label">{p.venue.label}</p>
        <h2 id="cs-venue-title">{p.venue.title}</h2>
        <address>Calle de José Gutiérrez Abascal, 2<br />28006 Madrid</address>
        <a href={event.directions} target="_blank" rel="noreferrer">{p.venue.cta} <span aria-hidden="true">↗</span></a>
      </div>
    </section>

    <Subscribe locale={locale} />

    <SiteFooter locale={locale} />
  </main>;
}
