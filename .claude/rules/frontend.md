---
paths:
  - "src/**"
  - "index.html"
  - "scripts/prerender.mjs"
---

# Frontend

- Lee `docs/design/DESIGN.md` antes de tocar UI y `docs/engineering/CODING_STANDARDS.md` antes de tocar código.
- Usa la skill `impeccable:impeccable` para trabajo de diseño y la escalera de `docs/engineering/CODING_STANDARDS.md` para mantener el código mínimo.
- La página se prerenderiza: nada de `window`, `Date.now()` ni `localStorage` durante el render.
- Todo texto visible existe en `es` y `en`. Todo color, en tema claro y oscuro. Toda animación, con alternativa `prefers-reduced-motion`.
- No importes nada de `src/legacy/` ni lo edites.
- Al terminar: `npm run typecheck`, `npm run build` y mirar la página a 1440px y 390px.
