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
    <a href={href(locale)} className="cs-brand" aria-label={event.name}><TedxMark /><span>Universidad<br />Politécnica Madrid</span></a>
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
    <p className="cs-sign"><TedxMark /><span className="sr-only">TEDx</span><span>Universidad Politécnica Madrid</span></p>
    <p>{p.about} <a href="https://www.ted.com/tedx" target="_blank" rel="noreferrer">{p.more} ↗</a></p>
    <div className="cs-end">
      <p className="cs-legal">This independent TEDx event is operated under license from TED.</p>
      <nav className="cs-social" aria-label={p.social}>
        <a href={`mailto:${event.email}`}>{event.email}</a>
        <a href={event.instagram} target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.3" cy="6.7" r="1.2" /></svg>
          Instagram ↗
        </a>
        <a href={event.linkedin} target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M5 2h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm1 7.5V18h2.6V9.5Zm1.3-4.1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm3 4.1V18h2.6v-4.2c0-1.1.2-2.1 1.6-2.1s1.4 1.2 1.4 2.2V18h2.6v-4.7c0-2.2-.5-4-3.2-4-1.3 0-2.2.7-2.6 1.4V9.5Z" /></svg>
          LinkedIn ↗
        </a>
      </nav>
    </div>
  </footer>;
}
