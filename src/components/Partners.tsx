import { useEffect, useRef, useState } from 'react';
import { event, href, type Locale } from '../data/event';
import type { Game, Stand, View } from './hall3d';
import { SiteFooter, SiteHeader } from './Site';
import { TedxMark } from './TedxMark';

// Partners con acuerdo firmado. Solo se añade un logo cuando hay contrato (ver docs/security/SECURITY_POLICY.md).
// Logo en blanco sobre transparente, en public/partners/. En tema claro se tiñe con el color de la marca (`color`).
type Partner = { name: string; tier: 0 | 1 | 2; logo: string; color: string };
const PARTNERS: Partner[] = [];

const t = {
  es: {
    label: 'Partners',
    title: 'Cómo colaborar en la jornada',
    meta: ['26.02.2027', 'ETSII · Madrid', 'Unas 350 personas'],
    intro: 'Primera edición de TEDxUniversidad Politecnica Madrid. Así será el día y así podéis formar parte de él.',
    day: {
      label: 'La jornada',
      title: 'Un día de ideas en la ETSII',
      body: 'Charlas breves en el auditorio y, en las pausas, encuentros en la Sala de la Máquina.',
      facts: [['~350', 'personas previstas'], ['Auditorio', 'charlas'], ['Sala de la Máquina', 'encuentros en las pausas']],
    },
    tiersTitle: 'Tres formas de participar',
    photo: 'Máquina de vapor de balancín de la ETSII (Watt, 1832), en el centro de la Sala de la Máquina',
    hall: { open: 'Explorar la sala en 3D', title: 'Sala de la Máquina · ETSII', hint: 'Flechas o WASD para moverte · arrastra para mirar', close: 'Cerrar', views: { entrance: 'Entrada', machine: 'Junto a la máquina', gallery: 'Galería' }, note: 'Recreación orientativa. Distribución sujeta al plano autorizado.', games: { darts: 'Diana', vr: 'Realidad virtual', arcade: 'Arcade', foosball: 'Futbolín', racing: 'Simulador de carreras', hoops: 'Canasta', claw: 'Máquina de gancho' } as Record<Game, string>, error: 'Tu navegador no puede mostrar la vista 3D.' },
    invites: (n: number) => (n === 1 ? 'invitación al auditorio' : 'invitaciones al auditorio'),
    invitesNote: 'Invitaciones sujetas a registro y aforo. El personal acreditado no tiene asiento automático.',
    lists: ['Qué incluye', 'Qué aporta vuestra empresa', 'Qué definimos juntos'],
    more: 'Ver detalle',
    tiers: [
      {
        name: 'Experience Partner', invites: 4, title: 'Crear una experiencia interactiva',
        body: 'Diseñamos juntos un reto o actividad en un espacio destacado de la Sala de la Máquina. Vuestro equipo la dinamiza.',
        example: 'Los asistentes resuelven un reto breve guiado por vuestro equipo durante las pausas.',
        lists: [
          ['Espacio destacado, según el plano aprobado.', 'TEDxUPM coordina diseño, proveedores, fabricación, transporte y montaje de lo recogido en la ficha técnica aprobada.', 'Identificación en la actividad, ficha web destacada, una publicación o reel aprobado por ambas partes y agradecimientos.', 'Después: fotos autorizadas e informe breve con los resultados disponibles.'],
          ['Definís el objetivo y validáis el concepto.', 'Facilitáis vuestros materiales de marca.', 'Aportáis el equipo que dinamiza la actividad, con acreditación operativa.', 'Si ofrecéis premios o productos, los aportáis vosotros, salvo acuerdo escrito distinto.'],
          ['Antes de producir, acordamos por escrito espacio, equipamiento, montaje, alcance y coste de cada elemento.', 'Qué soportes de reconocimiento se usan, según disponibilidad.', 'Pantallas especiales, software a medida o personal especializado se presupuestan aparte.'],
        ],
      },
      {
        name: 'Partner', invites: 2, title: 'Atender un punto de encuentro',
        body: 'Vuestro equipo prepara y atiende una dinámica sencilla en la zona de networking.',
        example: 'Lleváis un prototipo y hacéis una demostración breve y no comercial durante una pausa, previa aprobación.',
        lists: [
          ['Punto estándar en la zona de networking, según el plano final.', 'TEDxUPM coordina la logística básica y la identificación del espacio.', 'Ficha web, comunicación colectiva y agradecimientos.', 'Programa y señalética, si se realizan.', 'Selección de fotos autorizadas disponibles.'],
          ['Preparáis la dinámica.', 'Aportáis los materiales acordados y vuestro material corporativo aprobado.', 'Desplazáis a las personas que atienden el punto, con acreditación operativa.', 'Seguís las instrucciones técnicas y de montaje.'],
          ['La propuesta individual especifica mobiliario, electricidad, panelería y equipos.', 'Pantallas, fabricación especial, personal especializado o una pieza audiovisual individual se acuerdan como ampliaciones cuando proceda.'],
        ],
      },
      {
        name: 'Supporting Partner', invites: 1, title: 'Hacer posible un servicio de la jornada',
        body: 'Cubrís una necesidad del evento con dinero, productos, servicios o una combinación, sin stand.',
        example: 'Aportáis el café del desayuno o cedéis temporalmente equipos para la jornada.',
        lists: [
          ['TEDxUPM valida la utilidad de la aportación y coordina la entrega o prestación.', 'Referencia en la web de partners y reconocimiento colectivo.', 'Programa, si se edita, y agradecimiento.', 'Resumen general posterior.'],
          ['El dinero, producto o servicio comprometido.', 'Concretáis recursos, cantidades, interlocutor y condiciones de entrega.', 'Entregáis o prestáis lo comprometido en el plazo y el lugar acordados.'],
          ['Si el servicio requiere instalación, atención o reposición, acordamos quién se encarga de cada tarea.', 'La aportación en especie se valora según el gasto real que evita al evento y sus condiciones de suministro.'],
        ],
      },
    ],
    exampleLabel: 'Ejemplo',
    previewTitle: 'Así aparecerá vuestra marca',
    previewBody: 'La página de partners, una vez firmado el acuerdo.',
    partnersTitle: 'Partners 2027',
    slot: 'Tu logo aquí',
    stepsTitle: 'De la reunión a la colaboración',
    steps: [
      ['Reunión de objetivos', 'Elegimos juntos la forma de participar.'],
      ['Ficha técnica', 'Espacio, actividad, materiales y responsables.'],
      ['Propuesta y acuerdo', 'Presupuesto, aprobación y firma. La producción empieza tras el acuerdo.'],
    ],
    rulesTitle: 'Condiciones comunes',
    rules: [
      'Espacios sujetos al plano autorizado, el aforo y la seguridad del recinto.',
      'Fotos y publicaciones, con permisos de imagen y aprobación editorial.',
      'Independencia editorial: los partners no intervienen en ponentes ni programa, y no hay publicidad desde el escenario.',
      'No se ceden datos de asistentes ni se garantizan contactos. Sin exclusividad automática.',
    ],
    cta: 'Escríbenos',
  },
  en: {
    label: 'Partners',
    title: 'How to take part on the day',
    meta: ['26.02.2027', 'ETSII · Madrid', 'About 350 people'],
    intro: 'The first edition of TEDxUniversidad Politecnica Madrid. What the day looks like and how you can be part of it.',
    day: {
      label: 'The day',
      title: 'A day of ideas at ETSII',
      body: 'Short talks in the auditorium and, during the breaks, meetings in the Machine Hall.',
      facts: [['~350', 'people expected'], ['Auditorium', 'talks'], ['Machine Hall', 'meetings during the breaks']],
    },
    tiersTitle: 'Three ways to take part',
    photo: 'The ETSII beam steam engine (Watt, 1832), at the centre of the Machine Hall',
    hall: { open: 'Explore the hall in 3D', title: 'Machine Hall · ETSII', hint: 'Arrow keys or WASD to move · drag to look around', close: 'Close', views: { entrance: 'Entrance', machine: 'By the engine', gallery: 'Gallery' }, note: 'Indicative recreation. Layout subject to the approved floor plan.', games: { darts: 'Darts', vr: 'Virtual reality', arcade: 'Arcade', foosball: 'Table football', racing: 'Racing simulator', hoops: 'Basketball', claw: 'Claw machine' } as Record<Game, string>, error: 'Your browser cannot show the 3D view.' },
    invites: (n: number) => (n === 1 ? 'auditorium invitation' : 'auditorium invitations'),
    invitesNote: 'Invitations subject to registration and capacity. Accredited staff do not get an automatic seat.',
    lists: ['What is included', 'What your company brings', 'What we define together'],
    more: 'See details',
    tiers: [
      {
        name: 'Experience Partner', invites: 4, title: 'Create an interactive experience',
        body: 'We design a challenge or activity together, in a featured space of the Machine Hall. Your team runs it.',
        example: 'Attendees solve a short challenge guided by your team during the breaks.',
        lists: [
          ['Featured space, according to the approved floor plan.', 'TEDxUPM coordinates design, suppliers, production, transport and set-up of what the approved technical sheet includes.', 'Branding at the activity, featured web profile, one post or reel approved by both parties, and acknowledgements.', 'Afterwards: authorised photos and a short report with the available results.'],
          ['You set the goal and validate the concept.', 'You provide your brand materials.', 'You provide the team that runs the activity, with operational accreditation.', 'If you offer prizes or products, you provide them, unless agreed otherwise in writing.'],
          ['Before production, we agree in writing on space, equipment, set-up, scope and the cost of each element.', 'Which recognition formats are used, subject to availability.', 'Special screens, custom software or specialised staff are quoted separately.'],
        ],
      },
      {
        name: 'Partner', invites: 2, title: 'Host a meeting point',
        body: 'Your team prepares and hosts a simple activity in the networking area.',
        example: 'You bring a prototype and give a short, non-commercial demo during a break, once approved.',
        lists: [
          ['Standard spot in the networking area, according to the final floor plan.', 'TEDxUPM coordinates basic logistics and signage for the space.', 'Web profile, group communication and acknowledgements.', 'Programme and signage, if produced.', 'A selection of available authorised photos.'],
          ['You prepare the activity.', 'You bring the agreed materials and your approved corporate materials.', 'You send the people who host the spot, with operational accreditation.', 'You follow the technical and set-up instructions.'],
          ['The individual proposal specifies furniture, power, panels and equipment.', 'Screens, special production, specialised staff or an individual video are agreed as add-ons where appropriate.'],
        ],
      },
      {
        name: 'Supporting Partner', invites: 1, title: 'Make an event service possible',
        body: 'You cover a need of the event with money, products, services or a mix, without a stand.',
        example: 'You provide the breakfast coffee or lend equipment for the day.',
        lists: [
          ['TEDxUPM validates the usefulness of the contribution and coordinates delivery.', 'Mention on the partners page and group recognition.', 'Programme, if printed, and acknowledgement.', 'General summary afterwards.'],
          ['The committed money, product or service.', 'You specify resources, quantities, contact person and delivery terms.', 'You deliver or provide what you committed, at the agreed time and place.'],
          ['If the service needs installation, staffing or restocking, we agree who handles each task.', 'In-kind contributions are valued at the real cost they save the event and their supply terms.'],
        ],
      },
    ],
    exampleLabel: 'Example',
    previewTitle: 'How your brand will appear',
    previewBody: 'The partners page, once the agreement is signed.',
    partnersTitle: '2027 partners',
    slot: 'Your logo here',
    stepsTitle: 'From the meeting to the partnership',
    steps: [
      ['Goals meeting', 'We choose together how you take part.'],
      ['Technical sheet', 'Space, activity, materials and who does what.'],
      ['Proposal and agreement', 'Budget, approval and signature. Production starts after the agreement.'],
    ],
    rulesTitle: 'Common terms',
    rules: [
      'Spaces subject to the authorised floor plan, capacity and venue safety.',
      'Photos and posts, with image permissions and editorial approval.',
      'Editorial independence: partners have no say over speakers or programme, and there is no advertising from the stage.',
      'No attendee data is shared and no contacts are guaranteed. No automatic exclusivity.',
    ],
    cta: 'Get in touch',
  },
};

export function Partners({ locale }: { locale: Locale }) {
  const p = t[locale];

  return <main id="main" className="cs pt">
    <SiteHeader locale={locale} page="partners" />

    <section className="pt-hero" aria-labelledby="pt-title">
      <div>
        <p className="cs-label">{p.label}</p>
        <h1 id="pt-title">{p.title}</h1>
        <p className="pt-meta">{p.meta.map((m, i) => <span key={m}>{i > 0 && <b aria-hidden="true">·</b>}{m}</span>)}</p>
        <p className="pt-intro">{p.intro}</p>
      </div>
      <HallViewer locale={locale} />
    </section>

    <section className="cs-day" aria-labelledby="pt-day-title">
      <div>
        <p className="cs-label">{p.day.label}</p>
        <h2 id="pt-day-title">{p.day.title}</h2>
        <p>{p.day.body}</p>
      </div>
      <dl>
        {p.day.facts.map(([value, label]) => <div key={value}><dt>{value}</dt><dd>{label}</dd></div>)}
      </dl>
    </section>

    <section aria-labelledby="pt-tiers-title">
      <h2 id="pt-tiers-title">{p.tiersTitle}</h2>
      <div className="pt-tiers">
        {p.tiers.map(tier => <article key={tier.name}>
          <p className="cs-label">{tier.name}</p>
          <h3>{tier.title}</h3>
          <p>{tier.body}</p>
          <p className="pt-example"><span>{p.exampleLabel}</span>{tier.example}</p>
          <p className="pt-invites"><strong>{tier.invites}</strong> {p.invites(tier.invites)}</p>
          <details>
            <summary>{p.more}</summary>
            {tier.lists.map((items, i) => <div key={p.lists[i]}>
              <h4>{p.lists[i]}</h4>
              <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>
            </div>)}
          </details>
        </article>)}
      </div>
      <p className="pt-note">{p.invitesNote}</p>
    </section>

    <section className="pt-steps" aria-labelledby="pt-steps-title">
      <h2 id="pt-steps-title">{p.stepsTitle}</h2>
      <ol>{p.steps.map(([title, body]) => <li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ol>
    </section>

    <section className="pt-rules" aria-labelledby="pt-rules-title">
      <h2 id="pt-rules-title">{p.rulesTitle}</h2>
      <ul>{p.rules.map(rule => <li key={rule}>{rule}</li>)}</ul>
    </section>

    {/* Captura simulada de /partners: cómo se verá el logo en la web real, dentro de un navegador. */}
    <section className="pt-preview" aria-labelledby="pt-preview-title">
      <h2 id="pt-preview-title">{p.previewTitle}</h2>
      <p>{p.previewBody}</p>
      <figure className="pt-browser">
        <div className="pt-bar" aria-hidden="true"><i /><i /><i /><span>tedxupm.vercel.app{href(locale, 'partners')}</span></div>
        <div className="pt-screen">
          <p className="pt-screen-brand" aria-hidden="true"><TedxMark /><span>Universidad<br />Politecnica Madrid</span></p>
          <h3>{p.partnersTitle}</h3>
          <ul>
            {p.tiers.map((tier, i) => {
              const logos = PARTNERS.filter(partner => partner.tier === i);
              return <li key={tier.name}>
                <p className="cs-label">{tier.name}</p>
                <div>
                  {logos.map(partner => <span key={partner.name} className="pt-logo" role="img" aria-label={partner.name} style={{ '--logo': `url(${partner.logo})`, '--brand': partner.color } as React.CSSProperties}><img src={partner.logo} alt="" /></span>)}
                  {logos.length === 0 && <span className="pt-slot">{p.slot}</span>}
                </div>
              </li>;
            })}
          </ul>
        </div>
      </figure>
    </section>

    <section className="pt-cta">
      {/* Destino provisional (LinkedIn) hasta tener email de partnerships. */}
      <a href={event.linkedin} target="_blank" rel="noreferrer">{p.cta} <span aria-hidden="true">↗</span></a>
    </section>

    <SiteFooter locale={locale} />
  </main>;
}

// Stands del 3D (4 por lado, pares a la izquierda): el Experience Partner en el sitio destacado, a la izquierda frente a la máquina, el resto puntos de encuentro (Partner).
// Supporting Partner no tiene stand.
const hallStands = (locale: Locale): Stand[] => {
  const tiers = t[locale].tiers, logo = (tier: number) => PARTNERS.find(partner => partner.tier === tier)?.logo;
  // El stand destacado (Experience Partner) no lleva juego: su actividad se diseña con el partner.
  const games: (Game | undefined)[] = ['darts', 'vr', 'arcade', 'foosball', undefined, 'racing', 'hoops', 'claw'];
  return [1, 1, 1, 1, 0, 1, 1, 1].map((tier, i) => { const game = games[i]; return { tier: tiers[tier].name, game, activity: game && t[locale].hall.games[game], logo: tier === 0 ? logo(0) : undefined, featured: tier === 0 }; });
};

// Imagen de la máquina como botón: abre a pantalla completa la recreación 3D de la sala (three.js solo se descarga al abrirla).
function HallViewer({ locale }: { locale: Locale }) {
  const p = t[locale], h = p.hall;
  const dialog = useRef<HTMLDialogElement>(null), stage = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const hall = useRef<{ go: (v: View) => void; dispose: () => void } | null>(null);

  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    let cancelled = false;
    import('./hall3d').then(({ mountHall }) => {
      if (cancelled || !stage.current) return;
      hall.current = mountHall(stage.current, hallStands(locale), p.slot);
      setState('ready');
      stage.current.focus();
    }).catch(() => setState('error'));
    return () => { cancelled = true; hall.current?.dispose(); hall.current = null; setState('loading'); };
  }, [open, locale, p.slot]);

  return <>
    <figure className="pt-hall">
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <img src="/img/maquina-3d.jpg" width="1370" height="934" alt={p.photo} />
        <span>{h.open} <b aria-hidden="true">↗</b></span>
      </button>
    </figure>
    <dialog ref={dialog} className="pt-3d" aria-label={h.title} onClose={() => setOpen(false)}>
      {open && <>
        <div ref={stage} className="pt-3d-stage" tabIndex={0} aria-label={`${h.title}. ${h.hint}`} />
        <header>
          <p><strong>{h.title}</strong><span>{state === 'error' ? h.error : state === 'loading' ? '…' : h.hint}</span></p>
          <button type="button" className="pt-3d-close" onClick={() => dialog.current?.close()}>{h.close} <span aria-hidden="true">✕</span></button>
        </header>
        <footer>
          <nav aria-label={h.title}>
            {(Object.keys(h.views) as View[]).map(v => <button key={v} type="button" disabled={state !== 'ready'} onClick={() => hall.current?.go(v)}>{h.views[v]}</button>)}
          </nav>
          <p>{h.note}</p>
        </footer>
      </>}
    </dialog>
  </>;
}
