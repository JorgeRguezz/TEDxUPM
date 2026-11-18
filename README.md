# TEDxUniversidad Politecnica Madrid · web

Web del evento (26 de febrero de 2027, ETSII, Madrid). Hoy publica una página «coming soon» en español e inglés.

## Arrancar

```sh
npm install
npm run dev        # http://127.0.0.1:5173/es/
```

## Comprobar y construir

```sh
npm run typecheck
npm run build      # dist/ con /es/ y /en/ prerenderizadas
npm run preview
```

`SITE_ORIGIN` cambia el origen de las URL canónicas. Las páginas llevan `noindex` mientras estemos en fase 1.

## Dónde está cada cosa

- Normas para personas y agentes: [`CLAUDE.md`](CLAUDE.md) y [`docs/`](docs).
- Ramas y publicación (dev → staging → main): [`docs/workflows/GIT_WORKFLOW.md`](docs/workflows/GIT_WORKFLOW.md).
- Planificación por paquetes de trabajo: [`docs/prds/ROADMAP.md`](docs/prds/ROADMAP.md).
- Estudio de referencias de diseño: abre `referencias/index.html` en el navegador ([`COMO-VERLO.md`](COMO-VERLO.md)).
- Web anterior (código muerto, pendiente de borrar): [`src/legacy/`](src/legacy/README.md).
