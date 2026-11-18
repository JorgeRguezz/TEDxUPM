export type Locale = 'es' | 'en';
export type Page = 'home' | 'about' | 'partners' | 'prototype';

export const event = {
  name: 'TEDxUniversidad Politecnica Madrid',
  date: '2027-02-26',
  venue: 'ETSII · Universidad Politécnica de Madrid',
  address: 'Calle de José Gutiérrez Abascal, 2 · Madrid',
  officialUrl: 'https://www.ted.com/tedx/events/68819',
  instagram: 'https://www.instagram.com/tedx.upm/',
  linkedin: 'https://www.linkedin.com/company/tedxuniversidad-polit%C3%A9cnica-de-madrid/',
  directions: 'https://www.google.com/maps/search/?api=1&query=Calle+de+Jose+Gutierrez+Abascal+2+Madrid',
  signupMode: 'mock' as const,
};

export function routeInfo(path: string): { locale: Locale; page: Page } {
  const segments = path.split('/').filter(Boolean);
  const locale = segments[0] === 'en' ? 'en' : 'es';
  const page = segments[1] === 'about' || segments[1] === 'partners' || segments[1] === 'prototype' ? segments[1] : 'home';
  return { locale, page };
}

export const href = (locale: Locale, page: Page = 'home') => `/${locale}/${page === 'home' ? '' : `${page}/`}`;

export const schedule = [
  ['09:00', 'Acreditaciones y desayuno', 'Registration and breakfast', '09:45', 'break'],
  ['09:45', 'Bienvenida', 'Welcome', '10:00', 'talk'],
  ['10:00', 'Bloque 1 · Deep tech', 'Session 1 · Deep tech', '11:30', 'talk'],
  ['11:30', 'Descanso: café y retos', 'Break: coffee and challenges', '12:15', 'break'],
  ['12:15', 'Bloque 2 · Inteligencia artificial', 'Session 2 · Artificial intelligence', '13:45', 'talk'],
  ['13:45', 'Cierre de la mañana', 'Morning wrap-up', '14:00', 'talk'],
  ['14:00', 'Comida y networking', 'Lunch and networking', '15:00', 'break'],
  ['14:30', 'Acreditación de tarde', 'Afternoon registration', '15:00', 'break'],
  ['15:00', 'Bloque 3 · Liderazgo', 'Session 3 · Leadership', '16:30', 'talk'],
  ['16:30', 'Descanso: merienda y retos', 'Break: snacks and challenges', '17:15', 'break'],
  ['17:15', 'Bloque 4 · Divulgación', 'Session 4 · Science communication', '18:45', 'talk'],
  ['18:45', 'Clausura y sorteos', 'Closing and prize draw', '19:30', 'talk'],
] as const;

// Solo ponentes confirmados: el README prohíbe publicar candidatos.
// url: LinkedIn de cada ponente; vacío hasta tenerlo (no se pinta el enlace).
export const speakers = [
  { name: 'José Manuel Arguijo', photo: '/img/ponentes/jose-manuel-arguijo.jpg', topic: { es: 'Oratoria', en: 'Public speaking' }, url: '' },
  { name: 'Álvaro Marín Malumbres', photo: '/img/ponentes/alvaro-marin-malumbres.jpg', topic: { es: 'Oratoria', en: 'Public speaking' }, url: '' },
  { name: 'Clau · Quiero Ser Ingeniera', photo: '/img/ponentes/clau-qsi.jpg', topic: { es: 'Divulgación de ingeniería', en: 'Engineering outreach' }, url: '' },
] as const;

export const copy = {
  es: {
    skip: 'Saltar al contenido', menu: 'Menú', close: 'Cerrar', event: 'El evento', programme: 'Programa', venue: 'Dónde', partners: 'Colabora', about: 'Sobre TEDx', updates: 'Recibir novedades',
    date: '26 febrero 2027', dateShort: '26.02.2027', city: 'Madrid', eyebrow: 'Una jornada. Nuevas perspectivas.',
    headline: ['Ideas que abren', 'perspectivas.', 'Personas que', 'conectan.'],
    description: 'Una jornada de charlas, experiencias y conversaciones para conectar la comunidad UPM con la ciencia, la tecnología, el emprendimiento y la sociedad.',
    explore: 'Descubre el encuentro', scroll: 'Sigue explorando', demo: 'Vista de desarrollo · formularios de demostración',
    eventLabel: 'EL ENCUENTRO', eventTitle: 'La próxima gran idea puede empezar con una conversación.',
    eventBody: 'Un lugar para mirar más allá de tu disciplina. Para escuchar otras formas de pensar, hacer preguntas nuevas y encontrar personas con las que seguir la conversación.',
    eventFoot: 'Estudiantes, alumni, investigadores, emprendedores y personas con curiosidad. Un encuentro abierto al público.',
    // Draft placeholder descriptions for the topic accordion; editorial review pending.
    disciplines: [
      ['Deep tech', 'Fusión nuclear, espacio y hardware avanzado: lo que se está construyendo ahora en laboratorios y empresas.'],
      ['Inteligencia artificial', 'Robótica móvil, IA aplicada y empresas que han salido de la UPM.'],
      ['Liderazgo', 'Alto rendimiento, gestión de egos y presencia escénica: cómo se dirige a personas y cómo se habla delante de ellas.'],
      ['Divulgación', 'Contar ciencia e ingeniería a quien no es del gremio: impacto social, nuevas narrativas y comunidad.'],
    ],
    topicsNote: 'Cuatro bloques de cuatro charlas, de 12 a 18 minutos cada una.',
    experienceLabel: 'ENTRE LAS CHARLAS', experienceTitle: 'Las ideas no terminan en el escenario.',
    experienceBody: 'El auditorio abre la conversación. En la Sala de la Máquina, el encuentro continúa: nuevas conexiones, experiencias participativas y tiempo para compartir lo que te ha hecho pensar.',
    experienceTags: ['Escuchar', 'Descubrir', 'Conversar', 'Conectar'],
    programmeLabel: 'EL DÍA', programmeTitle: 'Un día para abrir la mirada.', draft: 'Programa provisional', timeNote: 'Hora local de Madrid. Horarios y actividades sujetos a confirmación.',
    signupLabel: 'FORMA PARTE', signupTitle: 'Las próximas ideas, en tu bandeja de entrada.', signupBody: 'Recibe las novedades del evento y el aviso de apertura de inscripciones.',
    email: 'Tu email', name: 'Nombre', company: 'Empresa', message: 'Cuéntanos tu idea', optional: 'opcional', submit: 'Quiero recibir novedades', send: 'Enviar propuesta', sending: 'Enviando…',
    mockNotice: 'Formulario de demostración: no guarda datos ni envía correos.',
    signupNote: 'Apuntarte a la lista no reserva una entrada. Solo comunicaciones sobre este evento.',
    mockSuccess: 'Demostración completada. No se han guardado ni enviado tus datos.',
    formError: 'No se ha podido completar. Puedes volver a intentarlo.',
    venueLabel: 'NOS VEMOS EN MADRID', venueTitle: 'Un escenario con historia. Una comunidad mirando al futuro.',
    venueBody: 'Nos encontramos en la Escuela Técnica Superior de Ingenieros Industriales. Charlas en el auditorio y conversaciones en la Sala de la Máquina.', directions: 'Cómo llegar', access: 'Los detalles de acceso, llegada y accesibilidad se publicarán antes del evento.',
    partnerLabel: 'HAGÁMOSLO POSIBLE', partnerTitle: 'Tu empresa también puede abrir perspectivas.',
    partnerBody: 'Construyamos una colaboración que aporte algo al encuentro: experiencias, recursos y conexiones con la comunidad.', partnerCta: 'Exploremos una colaboración',
    tedxLabel: 'IDEAS QUE SE COMPARTEN', tedxTitle: 'Un encuentro local. Un mundo de ideas.',
    tedxBody: 'TEDx reúne a comunidades locales en eventos organizados de forma independiente para compartir ideas y generar conversación. Este encuentro está organizado por su equipo local bajo licencia de TED.', tedxLink: 'Conoce el programa TEDx',
    faqTitle: 'Antes de encontrarnos.', faqLabel: 'PREGUNTAS FRECUENTES',
    faqs: [
      ['¿Puede asistir público externo a la UPM?', 'Sí. La ficha oficial del evento indica que está abierto al público. Las condiciones de inscripción se anunciarán próximamente.'],
      ['¿Estar en la lista me reserva una entrada?', 'No. La lista sirve para recibir novedades y el aviso de apertura de inscripciones; no garantiza ni reserva una plaza.'],
      ['¿Quiénes serán los ponentes?', 'El programa y los ponentes se anunciarán cuando estén confirmados.'],
      ['¿Habrá contenido en español e inglés?', 'La web está disponible en ambos idiomas. Los idiomas de las charlas y los servicios de interpretación se comunicarán cuando estén confirmados.'],
      ['¿Qué incluye la entrada?', 'Los precios, modalidades y servicios incluidos se comunicarán al abrir las inscripciones.'],
    ],
    speakersNav: 'Ponentes', speakersLabel: 'PONENTES', speakersTitle: 'Primeros nombres.', speakersNote: 'Iremos anunciando el resto de ponentes a medida que confirmen.', learnMore: 'Learn more', follow: 'Síguenos',
    official: 'Ficha oficial en TED.com', organized: 'Organización independiente', team: 'Equipo organizador', organizer: 'Organizadora', coorganizer: 'Coorganizador',
    aboutTitle: 'Las ideas nos reúnen.', aboutIntro: 'Una comunidad local que comparte curiosidad, perspectivas y ganas de conversar.',
    aboutTed: 'TED es una organización dedicada a compartir ideas que amplían nuestra comprensión del mundo. Su trabajo conecta voces de distintas disciplinas y culturas.',
    aboutTedx: 'TEDx permite a equipos locales organizar encuentros independientes bajo licencia. La organización, la selección de ideas y la experiencia de este evento corresponden a su equipo local.',
    aboutSource: 'Más sobre TED y TEDx',
    partnerPageTitle: 'Construyamos la experiencia juntos.', partnerPageIntro: 'Una colaboración empieza con una pregunta: ¿qué podemos aportar juntos a esta comunidad?',
    partnerTypes: [['Experience Partner', 'Una experiencia compartida', 'Cocreación de una activación participativa destacada, fuera del auditorio.'], ['Partner', 'Presencia y conversación', 'Un formato de interacción adaptado a los objetivos y recursos acordados.'], ['Supporting Partner', 'Apoyo que hace posible', 'Contribuciones económicas o en especie que ayudan a construir el encuentro.']],
    contributions: 'Movilidad · Catering · Tecnología · Alojamiento · Producción · Accesibilidad',
    partnerTerms: 'El alcance, el reconocimiento y las invitaciones se acuerdan según cada colaboración y las normas TEDx. El apoyo no otorga influencia editorial ni participación como ponente.',
    contactTitle: 'Todo empieza con una conversación.', back: 'Volver al encuentro',
    prototype: 'Estudio de movimiento', prototypeNote: 'Lettering de prototipo. El arte final utilizará el logotipo vectorial aprobado.', replay: 'Repetir animación', skipAnimation: 'Saltar animación',
  },
  en: {
    skip: 'Skip to content', menu: 'Menu', close: 'Close', event: 'The event', programme: 'Programme', venue: 'Where', partners: 'Partner with us', about: 'About TEDx', updates: 'Get updates',
    date: '26 February 2027', dateShort: '26.02.2027', city: 'Madrid', eyebrow: 'One day. New perspectives.',
    headline: ['Ideas that open', 'perspectives.', 'People who', 'connect.'],
    description: 'A day of talks, experiences and conversations connecting the UPM community with science, technology, entrepreneurship and society.',
    explore: 'Discover the gathering', scroll: 'Keep exploring', demo: 'Development preview · demonstration forms',
    eventLabel: 'THE GATHERING', eventTitle: 'The next big idea could begin with a conversation.',
    eventBody: 'A place to look beyond your discipline. To hear different ways of thinking, ask new questions and meet people to continue the conversation with.',
    eventFoot: 'Students, alumni, researchers, entrepreneurs and curious people. An event open to the public.',
    // Draft placeholder descriptions for the topic accordion; editorial review pending.
    disciplines: [
      ['Deep tech', 'Nuclear fusion, space and advanced hardware: what labs and companies are building right now.'],
      ['Artificial intelligence', 'Mobile robotics, applied AI and companies that grew out of UPM.'],
      ['Leadership', 'High performance, managing egos and stage presence: how to lead people and how to speak in front of them.'],
      ['Science communication', 'Explaining science and engineering to everyone else: social impact, new narratives and community.'],
    ],
    topicsNote: 'Four sessions of four talks, 12 to 18 minutes each.',
    experienceLabel: 'BETWEEN THE TALKS', experienceTitle: 'Ideas don’t end at the edge of the stage.',
    experienceBody: 'The auditorium starts the conversation. In Sala de la Máquina, it continues: new connections, participatory experiences and time to share what made you think.',
    experienceTags: ['Listen', 'Discover', 'Talk', 'Connect'],
    programmeLabel: 'THE DAY', programmeTitle: 'A day to broaden your view.', draft: 'Provisional programme', timeNote: 'Madrid local time. Times and activities are subject to confirmation.',
    signupLabel: 'BE PART OF IT', signupTitle: 'The next ideas, in your inbox.', signupBody: 'Get event updates and hear when registration opens.',
    email: 'Your email', name: 'Name', company: 'Company', message: 'Tell us your idea', optional: 'optional', submit: 'Keep me updated', send: 'Send proposal', sending: 'Sending…',
    mockNotice: 'Demonstration form: no information is stored and no email is sent.',
    signupNote: 'Joining the list does not reserve a ticket. Only updates about this event.',
    mockSuccess: 'Demonstration complete. Your information has not been saved or sent.', formError: 'We could not complete that. Please try again.',
    venueLabel: 'SEE YOU IN MADRID', venueTitle: 'A setting with history. A community looking ahead.',
    venueBody: 'We meet at the School of Industrial Engineering. Talks in the auditorium and conversations in Sala de la Máquina.', directions: 'Get directions', access: 'Arrival details and accessibility information will be published before the event.',
    partnerLabel: 'MAKE IT POSSIBLE', partnerTitle: 'Your company can open perspectives too.', partnerBody: 'Let’s build a partnership that contributes to the gathering: experiences, resources and connections with the community.', partnerCta: 'Explore a partnership',
    tedxLabel: 'IDEAS TO SHARE', tedxTitle: 'A local gathering. A world of ideas.',
    tedxBody: 'TEDx brings local communities together through independently organized events to share ideas and spark conversations. This gathering is organized by its local team under license from TED.', tedxLink: 'Discover the TEDx programme',
    faqTitle: 'Before we meet.', faqLabel: 'FREQUENTLY ASKED QUESTIONS',
    faqs: [
      ['Can people from outside UPM attend?', 'Yes. The official event listing says it is open to the public. Registration conditions will be announced soon.'],
      ['Does joining the list reserve a ticket?', 'No. The list provides updates and news about registration opening; it does not guarantee or reserve a place.'],
      ['Who will be speaking?', 'The programme and speakers will be announced once confirmed.'],
      ['Will content be in Spanish and English?', 'The website is available in both languages. Talk languages and interpretation services will be announced when confirmed.'],
      ['What does a ticket include?', 'Prices, ticket options and included services will be announced when registration opens.'],
    ],
    speakersNav: 'Speakers', speakersLabel: 'SPEAKERS', speakersTitle: 'First names.', speakersNote: 'More speakers will be announced as they confirm.', learnMore: 'Learn more', follow: 'Follow us',
    official: 'Official listing on TED.com', organized: 'Independently organized', team: 'Organizing team', organizer: 'Organizer', coorganizer: 'Co-organizer',
    aboutTitle: 'Ideas bring us together.', aboutIntro: 'A local community sharing curiosity, perspectives and a desire to talk.',
    aboutTed: 'TED is an organization dedicated to sharing ideas that deepen our understanding of the world. Its work connects voices across disciplines and cultures.',
    aboutTedx: 'TEDx enables local teams to organize independent gatherings under license. This event’s organization, selection of ideas and experience are the responsibility of its local team.', aboutSource: 'More about TED and TEDx',
    partnerPageTitle: 'Let’s build the experience together.', partnerPageIntro: 'A partnership starts with a question: what can we contribute to this community together?',
    partnerTypes: [['Experience Partner', 'A shared experience', 'Co-create a prominent participatory activation outside the auditorium.'], ['Partner', 'Presence and conversation', 'An interaction format adapted to the agreed objectives and resources.'], ['Supporting Partner', 'Support that makes it possible', 'Financial or in-kind contributions that help bring the gathering to life.']],
    contributions: 'Mobility · Catering · Technology · Hospitality · Production · Accessibility',
    partnerTerms: 'Scope, recognition and invitations are agreed for each partnership under TEDx rules. Support does not grant editorial influence or a speaking opportunity.',
    contactTitle: 'It starts with a conversation.', back: 'Back to the gathering',
    prototype: 'Motion study', prototypeNote: 'Prototype lettering. The final artwork will use the approved vector logo.', replay: 'Replay animation', skipAnimation: 'Skip animation',
  },
};
