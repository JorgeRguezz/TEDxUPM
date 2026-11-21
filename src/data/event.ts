export type Locale = 'es' | 'en';
export type Page = 'home' | 'partners';

export const event = {
  name: 'TEDxUniversidad Politécnica Madrid',
  date: '2027-02-26',
  venue: 'ETSII · Universidad Politécnica de Madrid',
  address: 'Calle de José Gutiérrez Abascal, 2 · Madrid',
  officialUrl: 'https://www.ted.com/tedx/events/68819',
  directions: 'https://www.google.com/maps/search/?api=1&query=Calle+de+Jose+Gutierrez+Abascal+2+Madrid',
  domain: 'tedxuniversidadpolitecnicamadrid.es',
  email: 'tedxupm@upm.es',
  instagram: 'https://www.instagram.com/tedx.upm/',
  linkedin: 'https://www.linkedin.com/company/tedxuniversidad-polit%C3%A9cnica-de-madrid/',
};

export const localeOf = (path: string): Locale => (path.split('/')[1] === 'en' ? 'en' : 'es');
export const pageOf = (path: string): Page => (path.split('/')[2] === 'partners' ? 'partners' : 'home');
export const href = (locale: Locale, page: Page = 'home') => `/${locale}/${page === 'home' ? '' : `${page}/`}`;
