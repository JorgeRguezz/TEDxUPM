# Decisiones

Registro breve. Una entrada por decisión: fecha, qué, por qué, consecuencia. Las nuevas van arriba.

## 2026-11-18 · Ramas dev, staging y main
`main` es producción (Vercel ya publica desde ahí). Se crean `dev` (integración) y `staging` (validación con el equipo). Todo cambio entra por PR `feature/* → dev → staging → main`. Detalle en `docs/workflows/GIT_WORKFLOW.md`.

## 2026-11-18 · La web pública es solo la coming soon
Por la PRD WP-02: hasta tener identidad, ponentes y entradas, el público ve fecha, lugar, contador y las llamadas a empresas y ponentes. Las rutas `/about`, `/partners` y `/prototype` dejan de publicarse.

## 2026-11-18 · La web de Jorge pasa a `src/legacy/`
Se conserva como referencia, fuera del build, y se borrará cuando la nueva web cubra su contenido. Se eliminan `gsap` y `@gsap/react`, que solo usaba esa versión, y el `logo_upm_blanco.png` suelto de la raíz (hay copia en `referencias/demos/img/`).

## 2026-11-18 · El estudio de referencias y las PRD entran en `main`, sin el logo de BBVA
BBVA no ha firmado: su logo no puede llegar a `main` ni a producción. Se quitó `bbva-blanco.png` y el nombre en las demos HTML. Las PRD lo mencionan como plan (WP-01), lo cual es interno. La rama `rediseno-cartel` (Abril) sí lo lleva y no se fusiona tal cual.

## 2026-11-18 · Coming soon minimalista
Negro puro en oscuro, blanco puro en claro, rojo TED. La X de luz (idea de Abril) en bucle. Contador con segundos (decisión del equipo de web, aunque el estudio proponía solo días y horas). Ver `docs/design/DESIGN.md`.
