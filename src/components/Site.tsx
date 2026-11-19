import { event, href, type Locale, type Page } from '../data/event';
import { TedxMark } from './TedxMark';

const t = {
  es: {
    lang: 'Idioma', social: 'Redes sociales',
    about: 'TEDx es un programa de eventos locales, organizados de forma independiente, que reúnen a personas para compartir ideas al estilo de TED, la organización sin ánimo de lucro dedicada a difundir ideas en charlas breves.',
    more: 'Qué es TEDx',
  },
  en: {
    lang: 'Language', social: 'Social media',
    about: 'TEDx is a program of local, independently organized events that bring people together to share ideas in the spirit of TED, the nonprofit devoted to spreading ideas in short, powerful talks.',
    more: 'About TEDx',
  },
};

export function SiteHeader({ locale, page }: { locale: Locale; page: Page }) {
  const p = t[locale];
  return <header className="cs-top">
    <a href={href(locale)} className="cs-brand" aria-label={event.name}><TedxMark /><span>Universidad<br />Politecnica Madrid</span></a>
    <div className="cs-tools">
      <nav className="cs-lang" aria-label={p.lang}>
        {(['es', 'en'] as Locale[]).map(l => <a key={l} lang={l} href={href(l, page)} aria-current={l === locale ? 'true' : undefined}>{l.toUpperCase()}</a>)}
      </nav>
    </div>
  </header>;
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const p = t[locale];
  return <footer className="cs-foot">
    {/* Nombre completo en una línea (TED exige el nombre completo; "TEDxUPM" pendiente de confirmar). */}
    <p className="cs-sign"><TedxMark /><span className="sr-only">TEDx</span><span>Universidad Politecnica Madrid</span></p>
    <p>{p.about} <a href="https://www.ted.com/tedx" target="_blank" rel="noreferrer">{p.more} ↗</a></p>
    <div className="cs-end">
      <p className="cs-legal">This independent TEDx event is operated under license from TED.</p>
      <nav className="cs-social" aria-label={p.social}>
        <a href={event.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>
        <a href={event.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
      </nav>
    </div>
  </footer>;
}
