# Sistema

## Qué hay hoy

Sitio estático prerenderizado. Una sola página («coming soon») en dos idiomas. Sin backend, sin base de datos, sin formularios que envíen datos, sin analítica.

```
index.html ──> src/main.tsx ──> App ──> ComingSoon(locale)
                    │                       └── data/event.ts, components/TedxMark, assets/wordmark.json
                    └── styles.css (reset Tailwind + globales + .cs-*)
```

## Build

`npm run build` hace tres pasos:

1. `vite build` → `dist/` (cliente).
2. `vite build --ssr src/entry-server.tsx --outDir .prerender` → función `render(path)`.
3. `node scripts/prerender.mjs` → escribe `dist/es/index.html`, `dist/en/index.html` y `dist/index.html` (español) con el HTML ya renderizado, título, descripción, canonical, hreflang, Open Graph y `noindex`.

En el navegador, `main.tsx` hidrata el HTML existente (`hydrateRoot`).

## Rutas

| URL | Contenido |
|---|---|
| `/`, `/es/` | Coming soon en español |
| `/en/` | Coming soon en inglés |

El idioma sale del primer segmento de la URL (`localeOf` en `src/data/event.ts`). El selector ES/EN son enlaces normales (recarga completa).

## Estado en el cliente

- Contador: `null` durante el prerender (el servidor no sabe la hora del visitante) y se actualiza cada segundo tras hidratar. Objetivo: `2027-02-26T09:00:00+01:00`.
- Tema claro/oscuro: sigue `prefers-color-scheme`; el botón guarda la elección en `localStorage` (`theme`) y un script en `index.html` la aplica antes de pintar.

## Despliegue

Vercel (`vercel.json`: framework vite, `cleanUrls`, `trailingSlash`). `main` es producción; cualquier otra rama subida genera un preview. Ver `docs/workflows/GIT_WORKFLOW.md`.

## Dependencias

Producción: `react`, `react-dom`, `@fontsource/inter` (pesos 400–700). Desarrollo: `vite`, `@vitejs/plugin-react`, `tailwindcss` + `@tailwindcss/vite`, `typescript`, tipos.

## Lo que vendrá (no existe)

Entradas y pagos, QR y check-in, directorio de asistentes, acreditaciones: ver `docs/prds/`. Cuando exista backend habrá que ampliar este documento y `docs/security/`.
