import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { copy, event, href, routeInfo, type Locale, type Page } from './data/event';
import { Wordmark } from './components/Wordmark';
import { DemoForm } from './components/DemoForm';
import { PosterHome, PosterFooter } from './components/PosterHome';
import { Arrow } from './components/Arrow';
import { TedxMark } from './components/TedxMark';

const Label = ({ children }: { children: React.ReactNode }) => <p className="eyebrow">{children}</p>;

export function App({ initialPath }: { initialPath: string }) {
  const [path, setPath] = useState(initialPath);
  const { locale, page } = routeInfo(path);
  const c = copy[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const immersiveOpening = false;
  const headerVisible = true;
  const badgeVisible = page !== 'home' || hasScrolled;
  const progressFill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let maxScroll = 0;
    let frame = 0;
    let previousScrolled: boolean | undefined;
    const updateScroll = () => {
      frame = 0;
      const scrolled = window.scrollY > 4;
      if (scrolled !== previousScrolled) {
        previousScrolled = scrolled;
        setHasScrolled(scrolled);
        if (!scrolled) setMenuOpen(false);
      }
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      if (progressFill.current) progressFill.current.style.transform = `scaleX(${progress})`;
    };
    const scheduleScroll = () => { if (!frame) frame = requestAnimationFrame(updateScroll); };
    const measure = () => {
      maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      scheduleScroll();
    };
    measure();
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', measure);
    const resize = new ResizeObserver(measure);
    resize.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', scheduleScroll);
      window.removeEventListener('resize', measure);
    };
  }, [page]);

  useEffect(() => {
    const onPop = () => { setPath(location.pathname); setMenuOpen(false); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = `${event.name} · ${page === 'partners' ? c.partners : page === 'about' ? c.about : c.date}`;
  }, [locale, page]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenuOpen(false); document.getElementById('menu-toggle')?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const switchLocale = (e: MouseEvent<HTMLAnchorElement>, next: Locale) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const nextPath = href(next, page);
    history.pushState({}, '', `${nextPath}${location.hash}`);
    setPath(nextPath);
    setMenuOpen(false);
  };
  const nav = [
    [c.event, `${href(locale)}#event`], [c.speakersNav, `${href(locale)}#speakers`], [c.programme, `${href(locale)}#programme`], [c.venue, `${href(locale)}#venue`],
    [c.partners, href(locale, 'partners')], [c.about, href(locale, 'about')],
  ];
  return <>
    <a className="skip-link" href="#main">{c.skip}</a>
    <header className={`site-header${immersiveOpening ? ' site-header--landing' : ''}${headerVisible ? ' is-visible' : ''}`} inert={!headerVisible} aria-hidden={!headerVisible}>
      <a className="brand-small" href={href(locale)} aria-label={event.name}><TedxMark /><span>Universidad<br />Politecnica Madrid</span></a>
      <nav className="desktop-nav" aria-label={locale === 'es' ? 'Navegación principal' : 'Main navigation'}>{nav.map(([label, url]) => <a key={url} href={url} aria-current={(url === href(locale, page) && page !== 'home') ? 'page' : undefined}>{label}</a>)}</nav>
      <div className="header-tools"><div className="locale-switch" aria-label={locale === 'es' ? 'Idioma' : 'Language'}>{(['es', 'en'] as Locale[]).map(l => <a key={l} lang={l} href={href(l, page)} onClick={e => switchLocale(e, l)} aria-current={locale === l ? 'true' : undefined}>{l.toUpperCase()}</a>)}</div>
        <a className="header-cta" href={`${href(locale)}#updates`}>{c.updates}<Arrow /></a>
        <button id="menu-toggle" className="menu-toggle" type="button" aria-controls="mobile-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? c.close : c.menu}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
      </div>
      <nav id="mobile-nav" className="mobile-nav" hidden={!menuOpen} aria-label={locale === 'es' ? 'Menú móvil' : 'Mobile menu'}>{nav.map(([label, url]) => <a key={url} href={url} onClick={() => setMenuOpen(false)}>{label}<Arrow /></a>)}<a href={`${href(locale)}#updates`} onClick={() => setMenuOpen(false)}>{c.updates}<Arrow /></a></nav>
      {immersiveOpening && <div className="reading-progress" aria-hidden="true"><span ref={progressFill} className="reading-progress-fill" /></div>}
    </header>
    <main id="main">
      {page === 'home' ? <PosterHome locale={locale} /> : page === 'partners' ? <Partners locale={locale} /> : page === 'about' ? <About locale={locale} /> : <Prototype locale={locale} />}
    </main>
    <PosterFooter locale={locale} />
    <div className={`development-badge${!badgeVisible ? ' development-badge--quiet' : ''}`} aria-hidden={!badgeVisible}><span className="status-dot" />{c.demo}</div>
  </>;
}

function Partners({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <>
    <section className="subpage-hero section-dark section-pad"><Label>{c.partners}</Label><h1>{c.partnerPageTitle}</h1><p className="lead muted-light">{c.partnerPageIntro}</p><a href="#contact" className="text-link">{c.contactTitle}<Arrow /></a></section>
    <section className="section-light section-pad"><div className="partner-types">{c.partnerTypes.map(([name, title, body], i) => <article key={name}><Label>{name}</Label>{i === 0 && <img className="partner-logo" src="/img/partners/bbva.png" alt="BBVA" />}<h2>{title}</h2><p>{body}</p></article>)}</div><div className="contributions"><p>{c.contributions}</p><p className="small muted">{c.partnerTerms}</p></div></section>
    <section id="contact" className="section-light section-pad contact-section"><div><Label>{c.partners}</Label><h2>{c.contactTitle}</h2></div><DemoForm locale={locale} partnership /></section>
  </>;
}

function About({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <>
    <section className="subpage-hero section-dark section-pad"><Label>{c.about}</Label><h1>{c.aboutTitle}</h1><p className="lead muted-light">{c.aboutIntro}</p></section>
    <section className="section-light section-pad about-copy"><article><Label>TEDx</Label><h2>{c.tedxTitle}</h2><p className="lead">{c.aboutTedx}</p><a className="text-link" href="https://www.ted.com/tedx">{c.tedxLink}<Arrow /></a></article><article><Label>TED</Label><h2>Ideas worth spreading.</h2><p className="lead">{c.aboutTed}</p><a className="text-link" href="https://www.ted.com/about/our-organization">{c.aboutSource}<Arrow /></a></article></section>
    <section className="section-light section-pad team-section"><Label>{c.team}</Label><h2>{c.organized}</h2><div className="team-grid"><article><h3>Azul Snaider</h3><p>{c.organizer}</p></article><article><h3>Mariano Lorenzo</h3><p>{c.coorganizer}</p></article></div><a className="text-link" href={event.officialUrl}>{c.official}<Arrow /></a></section>
  </>;
}

function Prototype({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [replay, setReplay] = useState(0);
  const [speed, setSpeed] = useState(0.25);
  return <section className="prototype section-dark section-pad"><Label>{c.prototype}</Label><Wordmark locale={locale} prototype replay={replay} speed={speed} /><div className="prototype-controls"><button className="button button-white" type="button" onClick={() => setReplay(v => v + 1)}>{c.replay}<span aria-hidden="true">↻</span></button><label>{locale === 'es' ? 'Velocidad' : 'Speed'}<select value={speed} onChange={e => { setSpeed(Number(e.target.value)); setReplay(v => v + 1); }}><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option></select></label></div><p className="small muted-light">{c.prototypeNote}</p></section>;
}
