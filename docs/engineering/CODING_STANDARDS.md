# Estándares de código

## Mínimo código posible (estilo ponytail)

Antes de escribir código, sube esta escalera y párate en el primer peldaño que resuelva el problema:

1. ¿Hace falta? (YAGNI)
2. ¿Ya existe en el repo? Reutilízalo.
3. ¿Lo resuelve la librería estándar?
4. ¿Lo resuelve la plataforma (HTML/CSS nativo, APIs del navegador)?
5. ¿Lo resuelve una dependencia ya instalada?
6. ¿Cabe en una línea?
7. Solo entonces, la solución mínima.

Arregla la causa raíz, no el síntoma. Prefiere borrar a añadir. Sin abstracciones ni dependencias que nadie pidió.

## TypeScript y React

- `strict` siempre. Sin `any`, sin `@ts-ignore`.
- Componentes funcionales, un archivo por componente en `src/components/`, `PascalCase.tsx`, exportación con nombre.
- Datos del evento solo en `src/data/event.ts`. Textos visibles junto al componente, en un objeto `{ es, en }` con las mismas claves.
- Nada que dependa del navegador (`window`, `Date.now()`, `localStorage`) durante el render: va en `useEffect`, porque la página se prerenderiza.
- `localStorage` siempre dentro de `try/catch`.
- Enlaces externos: `target="_blank" rel="noreferrer"`.

## CSS

- Estilos de una página en `src/styles.css` bajo un prefijo (`.cs-*` para la coming soon). Sin CSS-in-JS.
- Colores como variables del bloque, con versión clara y oscura (ver `docs/design/DESIGN.md`).
- Tailwind se usa solo por su reset. No mezcles utilidades de Tailwind con las clases propias sin decidirlo antes.
- Animaciones con CSS nativo; cada una con su alternativa en `prefers-reduced-motion`.

## Nombres

| Qué | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `ComingSoon` |
| Funciones, variables | camelCase | `localeOf`, `remaining` |
| Constantes de módulo | UPPER_SNAKE | `START` |
| Clases CSS | kebab-case con prefijo | `.cs-count` |
| Ramas | `feature/…`, `fix/…`, `chore/…` | `feature/pagina-ponentes` |

## Comentarios

En español, cortos, explican el porqué (no el qué). Si un comentario describe una decisión de producto, que también esté en `docs/architecture/DECISIONS.md`.

## Errores

Hoy no hay red ni backend: el único fallo previsto es el almacenamiento (`try/catch`). Cuando haya llamadas externas: valida en el límite (entrada del usuario, respuesta de la API), muestra un mensaje útil y no registres datos personales.
