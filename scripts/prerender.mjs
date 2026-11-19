import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { render } from '../.prerender/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const origin = (process.env.SITE_ORIGIN || (vercelHost ? `https://${vercelHost}` : 'http://127.0.0.1:5173')).replace(/\/$/, '');
const pages = {
  '': { title: '26.02.2027', es: 'TEDxUniversidad Politecnica Madrid. 26 de febrero de 2027, ETSII, Madrid.', en: 'TEDxUniversidad Politecnica Madrid. 26 February 2027, ETSII, Madrid.' },
  'partners/': { title: 'Partners', es: 'Cómo colaborar con TEDxUniversidad Politecnica Madrid: tres formas de participar en la jornada del 26 de febrero de 2027.', en: 'How to partner with TEDxUniversidad Politecnica Madrid: three ways to take part on 26 February 2027.' },
};
const html = (locale, page) => template
  .replace('lang="es"', `lang="${locale}"`)
  .replace(/<title>.*?<\/title>/, `<title>TEDxUniversidad Politecnica Madrid · ${pages[page].title}</title>`)
  .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${pages[page][locale]}" />`)
  .replace('<!--app-html-->', render(`/${locale}/${page}`))
  .replace('</head>', `<link rel="canonical" href="${origin}/${locale}/${page}" /><link rel="alternate" hreflang="es" href="${origin}/es/${page}" /><link rel="alternate" hreflang="en" href="${origin}/en/${page}" /><meta name="robots" content="noindex,nofollow" /><meta property="og:title" content="TEDxUniversidad Politecnica Madrid · ${pages[page].title}" /><meta property="og:description" content="${pages[page][locale]}" /><meta property="og:type" content="website" /><meta property="og:url" content="${origin}/${locale}/${page}" /></head>`);

for (const locale of ['es', 'en']) {
  for (const page of Object.keys(pages)) {
    await mkdir(resolve('dist', locale, page), { recursive: true });
    await writeFile(resolve('dist', locale, page, 'index.html'), html(locale, page));
  }
}
await writeFile('dist/index.html', html('es', ''));
console.log('Prerendered the ES/EN coming soon and partners pages.');
