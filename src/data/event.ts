export type Locale = 'es' | 'en';

export const event = {
  name: 'TEDxUniversidad Politecnica Madrid',
  date: '2027-02-26',
  venue: 'ETSII · Universidad Politécnica de Madrid',
  address: 'Calle de José Gutiérrez Abascal, 2 · Madrid',
  officialUrl: 'https://www.ted.com/tedx/events/68819',
  directions: 'https://www.google.com/maps/search/?api=1&query=Calle+de+Jose+Gutierrez+Abascal+2+Madrid',
  instagram: 'https://www.instagram.com/tedx.upm/',
  linkedin: 'https://www.linkedin.com/company/tedxuniversidad-polit%C3%A9cnica-de-madrid/',
};

export const localeOf = (path: string): Locale => (path.split('/')[1] === 'en' ? 'en' : 'es');
export const href = (locale: Locale) => `/${locale}/`;
