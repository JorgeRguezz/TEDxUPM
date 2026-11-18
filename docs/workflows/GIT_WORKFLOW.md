# Flujo de git

## Ramas

```
feature/*, fix/*, chore/*  ──PR──>  dev  ──PR──>  staging  ──PR──>  main
                                  (integración)  (revisión equipo)   (producción)
```

| Rama | Para qué | Quién fusiona | Vercel |
|---|---|---|---|
| `main` | Producción (tedxupm.vercel.app) | Una persona, tras revisar `staging` | Producción |
| `staging` | Lo que se va a publicar, para que el equipo lo vea | Una persona, tras revisar `dev` | Preview fija de la rama |
| `dev` | Integración diaria | Autor del PR, con typecheck y build en verde | Preview fija de la rama |
| `feature/…`, `fix/…`, `chore/…` | Una tarea | — | Preview por rama |

- Las ramas de trabajo salen siempre de `dev` y vuelven a `dev`.
- Nunca se hace commit directo en `dev`, `staging` ni `main`.
- Un arreglo urgente en producción: `fix/…` desde `main`, PR a `main` y luego se baja a `staging` y `dev`.
- Ramas de diseño o demos que no deben llegar a producción (p. ej. partners sin firmar) no se fusionan: se enseñan con su preview.
- Al fusionar, se borra la rama de trabajo.

## Commits

- Mensaje en inglés o español, en imperativo, una línea clara (+ cuerpo si hace falta el porqué).
- **Prohibido** `Co-Authored-By:` y `Claude-Session:` en commits y PR. El hook `.claude/hooks/block-coauthor.sh` lo bloquea para los agentes; las personas lo revisan en el PR.
- Un commit = un cambio coherente. Nada de secretos, `dist/` ni `node_modules/`.

## PR

- Título corto; descripción con qué cambia, cómo se comprobó (ver `docs/quality/DEFINITION_OF_DONE.md`) y la URL de preview.
- `dev → staging` y `staging → main` con la skill `release`.

## Comandos de referencia

```sh
git switch dev && git pull
git switch -c feature/mi-tarea
# … trabajo, npm run typecheck && npm run build …
git push -u origin feature/mi-tarea
gh pr create --base dev --title "…" --body "…"
```
