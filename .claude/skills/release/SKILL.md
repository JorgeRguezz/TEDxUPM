---
name: release
description: Sube cambios por el flujo dev → staging → main (producción) de la web TEDx UPM con sus comprobaciones. Úsala cuando alguien pida "pasar a staging", "publicar", "subir a producción" o "release".
---

# Release

Flujo: `dev → staging → main`. `main` es producción en Vercel. Ver `docs/workflows/GIT_WORKFLOW.md`.

## Pasos

1. Pregunta qué paso es: `dev → staging` o `staging → main`.
2. Actualiza: `git fetch origin`.
3. Comprueba la rama de origen en local:
   - `git switch <origen> && git pull`
   - `npm run typecheck` y `npm run build`: deben pasar.
   - `grep -ril bbva dist` debe estar vacío (partners sin firmar fuera de producción).
   - Ejecuta la skill `ted-compliance`.
4. Resume qué entra: `git log --oneline origin/<destino>..origin/<origen>`.
5. Comprueba que ningún commit lleva `Co-Authored-By` ni `Claude-Session`: `git log --format=%B origin/<destino>..origin/<origen> | grep -iE "co-authored|claude-session"` debe estar vacío.
6. Propón el PR (no lo ejecutes sin permiso):
   `gh pr create --base <destino> --head <origen> --title "Release <origen> → <destino>" --body "<resumen + URL de preview>"`
7. La fusión (`gh pr merge`) la aprueba y la hace una persona. Para `main`, alguien tiene que haber visto `staging` en su preview.

## Restricciones

- Nunca `--force`, nunca fusionar con comprobaciones en rojo, nunca saltarse `staging` salvo un `fix/…` urgente (ver flujo).

## Salida

Resultado de cada comprobación (real, ejecutada), lista de commits que entran y el comando de PR propuesto.
