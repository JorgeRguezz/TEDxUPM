import { useEffect, useState } from 'react';
import { copy, event, href, schedule, speakers, type Locale } from '../data/event';
import { DemoForm } from './DemoForm';
import '../poster.css';

// Home como serie de carteles suizos. Figura principal: la X, construida con dos barras.
const BAR_A = '4,4 32,4 96,96 68,96';   // "\"
const BAR_B = '68,4 96,4 32,96 4,96';   // "/"
const X = '4,4 32,4 50,34 68,4 96,4 66,50 96,96 68,96 50,66 32,96 4,96 34,50';

const t = {
  es: {
    lead: ['Ideas que abren perspectivas.', 'Personas que conectan.'], edition: 'Primera edición', scroll: 'Desliza',
    where: 'ETSII · Madrid', day: 'Viernes',
    updates: 'Recibir novedades', partner: 'Colabora',
    talks: 'charlas', blocks: [['Deep tech', '10:00'], ['Inteligencia artificial', '12:15'], ['Liderazgo', '15:00'], ['Divulgación', '17:15']],
    dayNote: 'Cuatro bloques. Cuatro charlas por bloque. De 12 a 18 minutos cada una.',
    speakers: 'Ponentes', speakersNote: 'Más nombres a medida que confirmen.',
    programme: 'Programa', talk: 'Auditorio', pause: 'Sala de la Máquina', provisional: 'Provisional',
    venue: 'Escuela Técnica Superior de Ingenieros Industriales', directions: 'Cómo llegar',
    rooms: [['Auditorio', 'Más de 450 personas. Las 16 charlas y la clausura.'], ['Sala de la Máquina', 'Desayuno, comida, networking y retos en los descansos.']],
    signup: 'Que no se te pase.', signupBody: 'Te avisamos cuando abran las inscripciones.',
  },
  en: {
    lead: ['Ideas that open perspectives.', 'People who connect.'], edition: 'First edition', scroll: 'Scroll',
    where: 'ETSII · Madrid', day: 'Friday',
    updates: 'Get updates', partner: 'Partner with us',
    talks: 'talks', blocks: [['Deep tech', '10:00'], ['Artificial intelligence', '12:15'], ['Leadership', '15:00'], ['Science communication', '17:15']],
    dayNote: 'Four sessions. Four talks each. 12 to 18 minutes per talk.',
    speakers: 'Speakers', speakersNote: 'More names as they confirm.',
    programme: 'Programme', talk: 'Auditorium', pause: 'Sala de la Máquina', provisional: 'Provisional',
    venue: 'School of Industrial Engineering', directions: 'Get directions',
    rooms: [['Auditorium', 'Over 450 people. All 16 talks and the closing.'], ['Sala de la Máquina', 'Breakfast, lunch, networking and challenges during breaks.']],
    signup: "Don't miss it.", signupBody: "We'll let you know when registration opens.",
  },
};


type Variant = 'a' | 'b' | 'c';
type Copy = (typeof t)['es'];

function HeroCopy({ p, locale }: { p: Copy; locale: Locale }) {
  return <div className="hx-copy">
    <p className="hx-meta"><span>{p.edition}</span><time dateTime={event.date}>26.02.2027</time><span>{p.where}</span></p>
    <h1><span>{p.lead[0]}</span> <span className="ph-red">{p.lead[1]}</span></h1>
    <div className="hx-links"><a href="#ph-signup">{p.updates}</a><a href={href(locale, 'partners')}>{p.partner}</a></div>
  </div>;
}

// A · Retícula: 144 X pequeñas; las de las dos diagonales en rojo forman una X grande.
function HeroGrid({ p, locale }: { p: Copy; locale: Locale }) {
  const cols = 16, rows = 9;
  const cells = Array.from({ length: cols * rows }, (_, k) => {
    const r = Math.floor(k / cols), c = k % cols, x = c / (cols - 1), y = r / (rows - 1);
    const red = Math.abs(x - y) < 0.07 || Math.abs(x + y - 1) < 0.07;
    const d = Math.hypot(x - .5, y - .5);
    return { k, red, delay: d * 900 };
  });
  return <section className="hx hx-grid" aria-labelledby="hx-title">
    <div className="hx-cells" aria-hidden="true">{cells.map(cell => <svg key={cell.k} viewBox="0 0 100 100" className={cell.red ? 'red' : ''} style={{ animationDelay: `${cell.delay}ms` }}><polygon points={X} /></svg>)}</div>
    <div id="hx-title" className="hx-copy-wrap"><HeroCopy p={p} locale={locale} /></div>
  </section>;
}

// B · Foto + X: la máquina de Watt de la ETSII en B/N con una X roja encima.
function HeroPhoto({ p, locale }: { p: Copy; locale: Locale }) {
  return <section className="hx hx-photo" aria-labelledby="hx-title">
    <div id="hx-title" className="hx-copy-wrap"><HeroCopy p={p} locale={locale} /></div>
    <figure>
      <img src="/img/maquina-watt-bn.jpg" alt={locale === 'es' ? 'La máquina de vapor de Watt de la ETSII' : 'The Watt steam engine at ETSII'} />
      <svg viewBox="0 0 100 100" aria-hidden="true"><polygon className="ph-bar ph-bar-b" points={BAR_B} /><polygon className="ph-bar ph-bar-a" points={BAR_A} /></svg>
      <figcaption>{locale === 'es' ? 'Máquina de vapor · Sala de la Máquina, ETSII' : 'Steam engine · Sala de la Máquina, ETSII'}</figcaption>
    </figure>
  </section>;
}

// C · Tipografía en X: dos bandas de texto que se cruzan y se desplazan.
function HeroBands({ p, locale }: { p: Copy; locale: Locale }) {
  const band = (text: string) => Array.from({ length: 6 }, (_, i) => <span key={i}>{text}<i aria-hidden="true">×</i></span>);
  return <section className="hx hx-bands" aria-labelledby="hx-title">
    <div className="hx-band hx-band-a" aria-hidden="true"><div>{band(p.lead[0])}{band(p.lead[0])}</div></div>
    <div className="hx-band hx-band-b" aria-hidden="true"><div>{band(p.lead[1])}{band(p.lead[1])}</div></div>
    <div id="hx-title" className="hx-copy-wrap"><HeroCopy p={p} locale={locale} /></div>
  </section>;
}

export function PosterHome({ locale }: { locale: Locale }) {
  const p = t[locale], c = copy[locale];
  const [variant, setVariant] = useState<Variant>('a');
  useEffect(() => {
    const v = new URLSearchParams(location.search).get('hero');
    if (v === 'a' || v === 'b' || v === 'c') setVariant(v);
  }, []);
  const choose = (v: Variant) => { setVariant(v); history.replaceState(null, '', `?hero=${v}${location.hash}`); };
  return <>
    {/* 1 · Portada: tres propuestas (A retícula, B foto + X, C tipografía en X) */}
    {variant === 'a' ? <HeroGrid p={p} locale={locale} /> : variant === 'b' ? <HeroPhoto p={p} locale={locale} /> : <HeroBands p={p} locale={locale} />}
    <div className="ph-switch" role="group" aria-label="Propuesta de portada">
      {(['a', 'b', 'c'] as Variant[]).map(v => <button key={v} type="button" aria-pressed={variant === v} onClick={() => choose(v)}>{v.toUpperCase()}</button>)}
    </div>

    {/* 2 · 16 charlas = 16 X en una retícula 4×4 */}
    <section className="ph-day" id="event" aria-labelledby="ph-day-title">
      <h2 id="ph-day-title" className="ph-sixteen"><span>16</span><small>{p.talks}</small></h2>
      <ol className="ph-grid">
        {p.blocks.map(([name, time]) => <li key={name}>
          <span className="ph-grid-time">{time}</span>
          <span className="ph-grid-xs" aria-hidden="true">{[0, 1, 2, 3].map(i => <svg key={i} viewBox="0 0 100 100"><polygon points={X} /></svg>)}</span>
          <span className="ph-grid-name">{name}</span>
        </li>)}
      </ol>
      <p className="ph-note">{p.dayNote}</p>
    </section>

    {/* 3 · Ponentes: fotos juntas, B/N con un detalle en rojo */}
    <section className="ph-speakers" id="speakers" aria-labelledby="ph-speakers-title">
      <div className="ph-section-head"><h2 id="ph-speakers-title">{p.speakers}</h2><p>{p.speakersNote}</p></div>
      <div className="ph-speaker-grid">
        {speakers.map(s => <article className="ph-speaker" key={s.name}>
          <img src={s.photo} alt={s.name} loading="lazy" />
          {/* X que gira al pasar el ratón. Cuando exista la ficha de cada ponente, esta X será el enlace a ella. */}
          <svg className="ph-speaker-x" viewBox="0 0 100 100" aria-hidden="true"><polygon points={X} /></svg>
          <div className="ph-speaker-text">
            <h3>{s.name}</h3>
            <p>{s.topic[locale]}</p>
            {s.url && <a href={s.url} target="_blank" rel="noreferrer">{c.learnMore}</a>}
          </div>
        </article>)}
      </div>
    </section>

    {/* 4 · Programa */}
    <section className="ph-programme" id="programme" aria-labelledby="ph-programme-title">
      <div className="ph-section-head"><h2 id="ph-programme-title">{p.programme}</h2><p>{p.provisional}</p></div>
      <ol className="ph-rows">
        {schedule.map(([start, es, en, end, kind]) => <li key={start} className={kind}>
          <time>{start}–{end}</time>
          <span>{locale === 'es' ? es : en}</span>
          <small>{kind === 'talk' ? p.talk : p.pause}</small>
        </li>)}
      </ol>
    </section>

    {/* 5 · Sede */}
    <section className="ph-venue" id="venue" aria-labelledby="ph-venue-title">
      <img className="ph-venue-art" src="/img/sala-maquina.svg" alt={locale === 'es' ? 'Ilustración de la Sala de la Máquina de la ETSII' : 'Illustration of Sala de la Máquina at ETSII'} loading="lazy" />
      <div className="ph-venue-copy">
        <h2 id="ph-venue-title">{p.venue}</h2>
        <address>{event.address}</address>
        <dl>{p.rooms.map(([room, body]) => <div key={room}><dt>{room}</dt><dd>{body}</dd></div>)}</dl>
        <a href={event.directions} target="_blank" rel="noreferrer">{p.directions}</a>
      </div>
    </section>

    {/* 6 · Novedades */}
    <section className="ph-signup" id="ph-signup" aria-labelledby="ph-signup-title">
      <h2 id="ph-signup-title">{p.signup}</h2>
      <div><p>{p.signupBody}</p><DemoForm locale={locale} /></div>
    </section>
  </>;
}

export function PosterFooter({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <footer className="ph-footer">
    <div className="ph-footer-links">
      <a href={href(locale, 'about')}>{c.about}</a>
      <a href={href(locale, 'partners')}>{c.partners}</a>
      <a href={event.officialUrl}>{c.official}</a>
      <a href={event.instagram} target="_blank" rel="noreferrer">Instagram</a>
      <a href={event.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
    </div>
    <p className="ph-sign" aria-label={event.name}><span className="ph-sign-red">TEDx</span><span>UPM</span></p>
    <div className="ph-footer-bottom"><span>{event.name}</span><span>This independent TEDx event is operated under license from TED.</span></div>
  </footer>;
}
