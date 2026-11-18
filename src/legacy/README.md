# Legacy: web anterior (código muerto)

Primera versión de la web, hecha por Jorge: landing con wordmark animado (GSAP), programa, FAQ, formularios de demostración y páginas `/about`, `/partners` y `/prototype`.

- Se guarda solo como referencia. **No se compila** (`tsconfig.json` excluye `src/legacy`) y nada fuera de esta carpeta debe importarla.
- Los archivos son copia de `main` en el commit `83aab2f`. Para verla funcionando: `git switch --detach 83aab2f && npm install && npm run dev`.
- Para reactivar alguna pieza hay que reinstalar `gsap` y `@gsap/react` (eliminadas de `package.json`) y moverla fuera de esta carpeta.
- Los formularios (`services/forms.ts`) son demostraciones y no envían nada.

**Se borra** cuando la nueva web cubra lo que aquí tenía valor (programa, FAQ, about, partners). Decisión registrada en `docs/architecture/DECISIONS.md`.
