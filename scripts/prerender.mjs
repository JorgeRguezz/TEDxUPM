import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { render } from '../.prerender/entry-server.js';

const template = await readFile('dist/index.html', 'utf8');
const origin = process.env.SITE_ORIGIN || 'https://tedx-madrid-2027-development.dappledgrove2.chatgpt.site';
for (const locale of ['es', 'en']) {
  for (const page of ['', 'about/', 'partners/', 'prototype/']) {
    const path = `/${locale}/${page}`;
    const title = `TEDxUniversidad Politecnica Madrid · ${page === 'partners/' ? (locale === 'es' ? 'Colabora' : 'Partnerships') : page === 'about/' ? 'About TEDx' : page === 'prototype/' ? 'Motion study' : '26.02.2027'}`;
    let html = template.replace('lang="es"', `lang="${locale}"`).replace(/<title>.*?<\/title>/, `<title>${title}</title>`).replace('<!--app-html-->', render(path));
    const description = locale === 'es' ? 'Ideas que abren perspectivas. Personas que conectan. Madrid, 26 febrero 2027.' : 'Ideas that open perspectives. People who connect. Madrid, 26 February 2027.';
    html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`);
    html = html.replace('</head>', `<link rel="canonical" href="${origin}${path}" /><link rel="alternate" hreflang="es" href="${origin}/es/${page}" /><link rel="alternate" hreflang="en" href="${origin}/en/${page}" /><meta name="robots" content="noindex,nofollow" /><meta property="og:title" content="${title}" /><meta property="og:description" content="${description}" /><meta property="og:type" content="website" /><meta property="og:url" content="${origin}${path}" /></head>`);
    const dir = resolve('dist', locale, page);
    await mkdir(dir, { recursive: true });
    await writeFile(resolve(dir, 'index.html'), html);
  }
}
await writeFile('dist/index.html', template.replace('<!--app-html-->', render('/es/')).replace('</head>', '<meta name="robots" content="noindex,nofollow" /><link rel="canonical" href="'+origin+'/es/" /></head>'));
console.log('Prerendered ES/EN landing, About, Partners and motion-study pages.');
