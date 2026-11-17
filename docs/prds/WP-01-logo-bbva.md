---
id: WP-01
title: Logo BBVA en /partners
status: specified
size: XS
depends_on: []
owner: hammad
external: false
tasks_done: 0
tasks_total: 3
issue: null
subtitle: Demo reunión BBVA · viernes 20/11
---

# WP-01 — Logo BBVA en /partners

## Contexto

`/es/partners/` y `/en/partners/` ya existen (`src/App.tsx:212`). Muestran tres niveles (`partnerTypes` en `src/data/event.ts`): Experience Partner, Partner y Supporting Partner, cada uno como `<article>` en `.partner-types`. Hoy no hay ningún logo y la home no muestra partners, así que ya cumple la norma TED.

## Objetivo

Que el viernes 20/11 BBVA vea su logo grande bajo "Experience Partner" en /partners, en ES y en EN. Nada más.

## Lógica de negocio

```
regla 1 (norma TED): el logo solo aparece en /partners, nunca en home ni en /about
  /es/          → 0 apariciones de "BBVA"
  /es/partners/ → 1 logo, dentro del artículo "01 / Experience Partner"

regla 2 (BBVA no ha firmado): el logo no va a producción (tedxupm.vercel.app)
  rama `demo-bbva` → deploy de preview en Vercel → esa URL es la que se enseña
  main / producción → 0 apariciones de "BBVA"
```

## Criterios de aceptación

- [ ] El logo SVG oficial está en `public/partners/bbva.svg` con `alt="BBVA"`. Test: `grep -c bbva.svg dist/es/partners/index.html` → 1, y lo mismo en `dist/en/partners/index.html`.
- [ ] No aparece en la home. Test: `grep -ci bbva dist/es/index.html dist/en/index.html` → 0.
- [ ] Se lee bien sobre el fondo de la sección: en blanco si el fondo es oscuro, en azul BBVA si es claro. Test: captura a 1440 px y 390 px con el logo visible y sin overflow horizontal.
- [ ] Hay una URL de preview que el equipo ha abierto antes del viernes y producción sigue sin el logo. Test: `curl -s https://tedxupm.vercel.app/es/partners/ | grep -ci bbva` → 0.

## Casos límite

- Si el SVG no carga, el `alt` "BBVA" mantiene el bloque legible.
- A 320 px el logo ocupa como mucho el 60 % del ancho del artículo y no empuja el texto fuera.

## Fuera de alcance

- Coming soon y contador → WP-02
- Contraseña y estética rojo/negro con modo día/noche → WP-03
- Ponentes → WP-04
- Ticketing y backend → WP-05 a WP-08

## Tests

Los cuatro `grep`/`curl` de los criterios, lanzados después de `npm run build`.
