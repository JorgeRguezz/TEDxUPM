---
name: ted-compliance
description: Comprueba que la web TEDx UPM cumple las normas de licencia TEDx antes de publicar (nombre, partners, ponentes, pie legal, logo UPM). Úsala antes de cada release o al tocar textos, logos o páginas públicas.
---

# Normas TED

Requiere un build reciente (`npm run build`). Revisa `dist/` y `src/`.

| # | Norma | Cómo comprobarlo |
|---|---|---|
| 1 | Nombre público completo «TEDxUniversidad Politecnica Madrid» | `grep -rn "TEDxUPM" src dist --include=*.tsx --include=*.html`: no debe salir en texto visible |
| 2 | Sin partners en la home | `grep -ril -E "bbva\|sponsor\|patrocin" dist/index.html dist/es dist/en`: vacío |
| 3 | Partners sin contrato fuera de `main` | `grep -ril bbva dist src public 2>/dev/null`: vacío |
| 4 | Pie legal en inglés | `grep -c "operated under license from TED" dist/es/index.html dist/en/index.html`: 1 en cada uno |
| 5 | Logo UPM no junto al wordmark ni en la cabecera | Revisa la cabecera y el pie en `src/components/` |
| 6 | Ningún ponente sin confirmar | Compara los nombres publicados con la lista confirmada del equipo; si no la tienes, pregúntala |
| 7 | Sin cifras prestadas de TED (suscriptores, visualizaciones) | Lee los textos en `src/components/` |

## Salida

Tabla con cada norma: cumple / no cumple / no comprobado (y por qué), y para cada fallo el `archivo:línea`. Ante la duda (p. ej. logo UPM), indica que hay que confirmarlo con el contacto de TED.
