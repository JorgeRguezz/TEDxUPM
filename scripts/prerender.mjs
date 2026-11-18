import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { render } from '../.prerender/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const origin = (process.env.SITE_ORIGIN || (vercelHost ? `https://${vercelHost}` : 'http://127.0.0.1:5173')).replace(/\/$/, '');
const title = 'TEDxUniversidad Politecnica Madrid · 26.02.2027';
const description = { es: 'TEDxUniversidad Politecnica Madrid. 26 de febrero de 2027, ETSII, Madrid.', en: 'TEDxUniversidad Politecnica Madrid. 26 February 2027, ETSII, Madrid.' };
const page = (locale) => template
  .replace('lang="es"', `lang="${locale}"`)
  .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description[locale]}" />`)
  .replace('<!--app-html-->', render(`/${locale}/`))
  .replace('</head>', `<link rel="canonical" href="${origin}/${locale}/" /><link rel="alternate" hreflang="es" href="${origin}/es/" /><link rel="alternate" hreflang="en" href="${origin}/en/" /><meta name="robots" content="noindex,nofollow" /><meta property="og:title" content="${title}" /><meta property="og:description" content="${description[locale]}" /><meta property="og:type" content="website" /><meta property="og:url" content="${origin}/${locale}/" /></head>`);

for (const locale of ['es', 'en']) {
  await mkdir(resolve('dist', locale), { recursive: true });
  await writeFile(resolve('dist', locale, 'index.html'), page(locale));
}
await writeFile('dist/index.html', page('es'));
console.log('Prerendered the ES/EN coming soon page.');
