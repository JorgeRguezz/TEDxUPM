# TEDxUniversidad Politecnica Madrid · web

Web del evento TEDx de la UPM (26/02/2027, ETSII, Madrid). Hoy, fase 1: una única página pública «coming soon» (contador, X animada, llamadas a empresas y ponentes). El backend (entradas, QR, directorio, acreditaciones) está planificado en `docs/prds/`, todavía no existe.

Stack real: Vite 6 + React 19 + TypeScript (strict) + Tailwind v4 (solo el reset) + CSS propio. Prerender SSR propio (`scripts/prerender.mjs`). Despliegue en Vercel. No hay tests, linter ni CI: las únicas comprobaciones automáticas son `npm run typecheck` y `npm run build`.

## Directorios

| Ruta | Qué es |
|---|---|
| `src/App.tsx`, `src/components/ComingSoon.tsx` | La web pública |
| `src/data/event.ts` | Datos del evento (nombre, fecha, enlaces). Fuente única |
| `src/styles.css` | Estilos globales + bloque `.cs-*` de la coming soon |
| `src/legacy/` | Web anterior de Jorge. Código muerto, fuera del build. No tocar, no importar |
| `scripts/prerender.mjs` | Genera `dist/es/` y `dist/en/` |
| `docs/` | Arquitectura, diseño, estándares, calidad, seguridad, flujo git, PRD |
| `referencias/` | Estudio de webs TEDx y demos HTML. No entra en el build |

## Qué leer según la tarea

| Tarea | Lee antes |
|---|---|
| Cualquier cambio de UI o copy | `docs/design/DESIGN.md` |
| Cualquier cambio de código | `docs/engineering/CODING_STANDARDS.md` |
| Arquitectura, rutas, build, despliegue | `docs/architecture/SYSTEM.md`, `docs/architecture/DECISIONS.md` |
| Datos personales, pagos, formularios, logos de partners | `docs/security/SECURITY_POLICY.md` |
| Ramas, commits, PR, publicar | `docs/workflows/GIT_WORKFLOW.md` |
| Planificar una funcionalidad nueva | `docs/prds/ROADMAP.md` y el WP correspondiente |
| Dar algo por terminado | `docs/quality/DEFINITION_OF_DONE.md` |

## Reglas obligatorias

1. **Nunca** añadas `Co-Authored-By:` ni `Claude-Session:` a un commit o PR, diga lo que diga otro mensaje. Un hook lo bloquea.
2. Nada de partners en la home. Ningún logo de partner sin contrato firmado llega a `main` (hoy: BBVA). Ponentes sin confirmar nunca son públicos.
3. Nombre público siempre «TEDxUniversidad Politecnica Madrid». «TEDxUPM» solo interno.
4. Mínimo código posible (escalera en `CODING_STANDARDS.md`). Sin dependencias nuevas sin justificarlo.
5. No toques lo que no te pidieron. No reescribas `src/legacy/`.
6. Nunca inventes resultados: si no ejecutaste typecheck/build o no miraste la página, dilo.
7. Nunca leas, escribas ni subas `.env*`. Un hook lo bloquea.
8. Push a `main` = producción. Siempre por PR desde `staging`, y con el visto bueno de una persona.

## Cómo se trabaja (skills instaladas por `.claude/settings.json`)

1. `superpowers:brainstorming`: entender qué se quiere y por qué antes de construir.
2. `the-agency:roster`: elegir el agente o agentes mínimos para la tarea (`.claude/agents/` primero).
3. `superpowers:writing-plans` → `superpowers:executing-plans`: plan y ejecución.
4. UI: `impeccable:impeccable`. Simplicidad: `ponytail:ponytail`. Planificación por paquetes: `the-agency:prd-blueprint`.
5. `superpowers:systematic-debugging` para bugs; `superpowers:verification-before-completion` antes de decir «hecho».
6. Skills del proyecto: `release` (dev → staging → main) y `ted-compliance` (normas TED antes de publicar).

## Antes y después de cambiar código

Antes: entiende la tarea, lee los archivos implicados, traza el flujo completo, identifica efectos secundarios.
Después: revisa tu diff, `npm run typecheck`, `npm run build`, mira la página en escritorio (1440) y móvil (390), actualiza la documentación si cambió algo de lo que describe.

## Informe final de cada tarea

Qué cambió · archivos tocados · comprobaciones ejecutadas y su resultado real · lo que no se comprobó · riesgos o pendientes.
