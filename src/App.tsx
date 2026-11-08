import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { copy, event, href, routeInfo, schedule, type Locale, type Page } from './data/event';
import { Wordmark } from './components/Wordmark';
import { DemoForm } from './components/DemoForm';

const Arrow = () => <span aria-hidden="true">↗</span>;
const Label = ({ children }: { children: React.ReactNode }) => <p className="eyebrow">{children}</p>;

export function App({ initialPath }: { initialPath: string }) {
  const [path, setPath] = useState(initialPath);
  const { locale, page } = routeInfo(path);
  const c = copy[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const immersiveOpening = page === 'home';
  const headerVisible = !immersiveOpening || hasScrolled;
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
    [c.event, `${href(locale)}#event`], [c.programme, `${href(locale)}#programme`], [c.venue, `${href(locale)}#venue`],
    [c.partners, href(locale, 'partners')], [c.about, href(locale, 'about')],
  ];
  return <>
    <a className="skip-link" href="#main">{c.skip}</a>
    <header className={`site-header${immersiveOpening ? ' site-header--landing' : ''}${headerVisible ? ' is-visible' : ''}`} inert={!headerVisible} aria-hidden={!headerVisible}>
      <a className="brand-small" href={href(locale)} aria-label={event.name}><strong>TED<span className="brand-x">x</span></strong><span>Universidad<br />Politecnica Madrid</span></a>
      <nav className="desktop-nav" aria-label={locale === 'es' ? 'Navegación principal' : 'Main navigation'}>{nav.map(([label, url]) => <a key={url} href={url} aria-current={(url === href(locale, page) && page !== 'home') ? 'page' : undefined}>{label}</a>)}</nav>
      <div className="header-tools"><div className="locale-switch" aria-label={locale === 'es' ? 'Idioma' : 'Language'}>{(['es', 'en'] as Locale[]).map(l => <a key={l} lang={l} href={href(l, page)} onClick={e => switchLocale(e, l)} aria-current={locale === l ? 'true' : undefined}>{l.toUpperCase()}</a>)}</div>
        <a className="header-cta" href={`${href(locale)}#updates`}>{c.updates}<Arrow /></a>
        <button id="menu-toggle" className="menu-toggle" type="button" aria-controls="mobile-nav" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? c.close : c.menu}<span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
      </div>
      <nav id="mobile-nav" className="mobile-nav" hidden={!menuOpen} aria-label={locale === 'es' ? 'Menú móvil' : 'Mobile menu'}>{nav.map(([label, url]) => <a key={url} href={url} onClick={() => setMenuOpen(false)}>{label}<Arrow /></a>)}<a href={`${href(locale)}#updates`} onClick={() => setMenuOpen(false)}>{c.updates}<Arrow /></a></nav>
      {immersiveOpening && <div className="reading-progress" aria-hidden="true"><span ref={progressFill} className="reading-progress-fill" /></div>}
    </header>
    <main id="main">
      {page === 'home' ? <Home locale={locale} /> : page === 'partners' ? <Partners locale={locale} /> : page === 'about' ? <About locale={locale} /> : <Prototype locale={locale} />}
    </main>
    <Footer locale={locale} />
    <div className={`development-badge${!headerVisible ? ' development-badge--quiet' : ''}`} aria-hidden={!headerVisible}><span className="status-dot" />{c.demo}</div>
  </>;
}

function Home({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [scrollHint, setScrollHint] = useState<'waiting' | 'visible' | 'leaving' | 'hidden'>('waiting');
  const finishIntro = useCallback(() => {
    setScrollHint(current => current === 'waiting' ? (window.scrollY > 4 ? 'hidden' : 'visible') : current);
  }, []);
  useEffect(() => {
    const dismissHint = () => {
      if (window.scrollY <= 4) return;
      setScrollHint(current => current === 'visible' ? 'leaving' : current === 'waiting' ? 'hidden' : current);
      window.removeEventListener('scroll', dismissHint);
    };
    window.addEventListener('scroll', dismissHint, { passive: true });
    dismissHint();
    return () => window.removeEventListener('scroll', dismissHint);
  }, []);
  return <>
    <section className="hero hero-opening section-dark" aria-label={event.name}>
      <div className="hero-wordmark"><Wordmark locale={locale} immersive onComplete={finishIntro} /></div>
      {(scrollHint === 'visible' || scrollHint === 'leaving') && <div
        className={`scroll-prompt${scrollHint === 'leaving' ? ' scroll-prompt--leaving' : ''}`}
        aria-hidden="true"
        onAnimationEnd={e => {
          if (e.target === e.currentTarget && e.animationName === 'scroll-prompt-exit') setScrollHint('hidden');
        }}
      >
        <span className="scroll-prompt-label">SCROLL DOWN</span>
        <span className="scroll-prompt-bubble"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4v15m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      </div>}
    </section>
    <section id="introduction" className="hero-details section-dark" aria-labelledby="hero-message">
      <noscript><nav className="no-script-nav"><a href={href(locale === 'es' ? 'en' : 'es')}>{locale === 'es' ? 'English' : 'Español'}</a><a href={href(locale, 'partners')}>{c.partners}</a><a href={href(locale, 'about')}>{c.about}</a></nav></noscript>
      <div className="event-details"><time dateTime={event.date}>{c.date}</time><span>ETSII UPM · Madrid</span></div>
      <div className="hero-bottom">
        <h1 id="hero-message">{c.headline[0]} <em>{c.headline[1]}</em><br />{c.headline[2]} <em>{c.headline[3]}</em></h1>
        <div className="hero-intro"><p>{c.description}</p><a href="#updates" className="text-link">{c.updates}<Arrow /></a></div>
      </div>
      <a className="scroll-cue" href="#event"><span aria-hidden="true">↓</span>{c.scroll}<span className="hero-index">01 — 07</span></a>
    </section>
    <section id="event" className="section-light section-pad">
      <Label>{c.eventLabel}</Label>
      <div className="section-intro"><h2>{c.eventTitle}</h2><div><p className="lead">{c.eventBody}</p><p className="muted">{c.eventFoot}</p></div></div>
      <div className="topic-list">{c.disciplines.map(([title, body], i) => <article className="topic" key={title}><span className="topic-number">0{i + 1}</span><div><h3>{title}</h3><p>{body}</p></div><span className="topic-plus" aria-hidden="true">↗</span></article>)}</div>
      <p className="small muted topics-note">{c.topicsNote}</p>
    </section>
    <section className="experience-section section-dark section-pad">
      <div className="experience-text"><Label>{c.experienceLabel}</Label><h2>{c.experienceTitle}</h2><p className="lead muted-light">{c.experienceBody}</p><div className="experience-tags">{c.experienceTags.map((tag, i) => <span key={tag}><small>0{i+1}</small>{tag}</span>)}</div></div>
      <div className="conversation-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" /><div className="orbit orbit-four" /><span className="art-label label-top">AUDITORIO</span><div className="red-stage" /><span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span><span className="art-label label-bottom">SALA DE LA MÁQUINA</span><div className="art-rule" /></div>
    </section>
    <section id="programme" className="section-light section-pad">
      <Label>{c.programmeLabel}</Label><div className="programme-heading"><h2>{c.programmeTitle}</h2><span className="tag">{c.draft}</span></div>
      <div className="schedule">{schedule.map(([start, es, en, end, kind]) => <div className={`schedule-row ${kind}`} key={start}><time>{start}<small>— {end}</small></time><h3>{locale === 'es' ? es : en}</h3><span className="schedule-type" aria-hidden="true">{kind === 'talk' ? '↗' : '○'}</span></div>)}</div>
      <p className="small muted">{c.timeNote}</p>
    </section>
    <section id="updates" className="signup-section section-pad">
      <div><Label>{c.signupLabel}</Label><h2>{c.signupTitle}</h2><p className="lead muted">{c.signupBody}</p></div><DemoForm locale={locale} />
    </section>
    <section id="venue" className="section-light section-pad venue-section">
      <div className="venue-poster" aria-hidden="true"><div className="poster-top">ETSII <span>UPM</span></div><div className="poster-grid"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div><div className="poster-bottom"><strong>MAD<br />RID.</strong><span>26<br />FEB<br />2027</span></div></div>
      <div className="venue-copy"><Label>{c.venueLabel}</Label><h2>{c.venueTitle}</h2><p>{c.venueBody}</p><address><strong>{event.venue}</strong><br />{event.address}</address><a href={event.directions} className="text-link" target="_blank" rel="noreferrer">{c.directions}<Arrow /></a><p className="small muted">{c.access}</p></div>
    </section>
    <section className="partner-invite section-dark section-pad"><Label>{c.partnerLabel}</Label><div className="section-intro"><h2>{c.partnerTitle}</h2><div><p className="lead muted-light">{c.partnerBody}</p><a className="button button-white" href={href(locale, 'partners')}>{c.partnerCta}<Arrow /></a></div></div></section>
    <section className="section-light section-pad tedx-section"><div><Label>{c.tedxLabel}</Label><h2>{c.tedxTitle}</h2></div><div><p className="lead">{c.tedxBody}</p><a className="text-link" href="https://www.ted.com/tedx">{c.tedxLink}<Arrow /></a></div></section>
    <section id="faq" className="section-light section-pad faq-section"><div><Label>{c.faqLabel}</Label><h2>{c.faqTitle}</h2></div><div>{c.faqs.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
  </>;
}

function Partners({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <>
    <section className="subpage-hero section-dark section-pad"><Label>{c.partners}</Label><h1>{c.partnerPageTitle}</h1><p className="lead muted-light">{c.partnerPageIntro}</p><a href="#contact" className="text-link">{c.contactTitle}<Arrow /></a></section>
    <section className="section-light section-pad"><div className="partner-types">{c.partnerTypes.map(([name, title, body], i) => <article key={name}><Label>0{i + 1} / {name}</Label><h2>{title}</h2><p>{body}</p></article>)}</div><div className="contributions"><p>{c.contributions}</p><p className="small muted">{c.partnerTerms}</p></div></section>
    <section id="contact" className="section-light section-pad contact-section"><div><Label>{c.partners}</Label><h2>{c.contactTitle}</h2></div><DemoForm locale={locale} partnership /></section>
  </>;
}

function About({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <>
    <section className="subpage-hero section-dark section-pad"><Label>{c.about}</Label><h1>{c.aboutTitle}</h1><p className="lead muted-light">{c.aboutIntro}</p></section>
    <section className="section-light section-pad about-copy"><article><Label>01 / TEDx</Label><h2>{c.tedxTitle}</h2><p className="lead">{c.aboutTedx}</p><a className="text-link" href="https://www.ted.com/tedx">{c.tedxLink}<Arrow /></a></article><article><Label>02 / TED</Label><h2>Ideas worth spreading.</h2><p className="lead">{c.aboutTed}</p><a className="text-link" href="https://www.ted.com/about/our-organization">{c.aboutSource}<Arrow /></a></article></section>
    <section className="section-light section-pad team-section"><Label>{c.team}</Label><h2>{c.organized}</h2><div className="team-grid"><article><span>01</span><h3>Azul Snaider</h3><p>{c.organizer}</p></article><article><span>02</span><h3>Mariano Lorenzo</h3><p>{c.coorganizer}</p></article></div><a className="text-link" href={event.officialUrl}>{c.official}<Arrow /></a></section>
  </>;
}

function Prototype({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [replay, setReplay] = useState(0);
  const [speed, setSpeed] = useState(0.25);
  return <section className="prototype section-dark section-pad"><Label>{c.prototype}</Label><Wordmark locale={locale} prototype replay={replay} speed={speed} /><div className="prototype-controls"><button className="button button-white" type="button" onClick={() => setReplay(v => v + 1)}>{c.replay}<span aria-hidden="true">↻</span></button><label>{locale === 'es' ? 'Velocidad' : 'Speed'}<select value={speed} onChange={e => { setSpeed(Number(e.target.value)); setReplay(v => v + 1); }}><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option></select></label></div><p className="small muted-light">{c.prototypeNote}</p></section>;
}

function Footer({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <footer className="site-footer section-dark"><div className="footer-top"><a href={href(locale)} className="footer-name">{event.name}</a><div><a href={href(locale, 'about')}>{c.about}</a><a href={href(locale, 'partners')}>{c.partners}</a><a href={event.officialUrl}>{c.official}<Arrow /></a></div></div><div className="footer-bottom"><p>This independent TEDx event is operated under license from TED.</p><span>Madrid · 2027</span></div><p className="footer-credit">designed by Jorge Rodríguez, TelecoEmprende</p></footer>;
}
