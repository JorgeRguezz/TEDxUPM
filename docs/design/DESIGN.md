# Diseño

Fuente de verdad visual. Si cambias algo de esto en el código, cambia también este archivo.

## Principios

- **Minimalista.** Pocas piezas, mucho aire. Si un elemento no ayuda a que alguien recuerde la fecha, colabore o proponga una charla, sobra.
- **Identidad TEDx reconocible**: rojo TED sobre negro (o blanco), la X como pieza gráfica.
- **Real, no plantilla.** Fotos propias (ETSII, Sala de la Máquina), cifras propias, textos que no valgan para cualquier otro evento.
- Referencia principal: TEDxAmsterdam. Estudio completo en `referencias/index.html`.

## Color (tokens en `.cs`, `src/styles.css`)

| Token | Oscuro | Claro | Uso |
|---|---|---|---|
| `--bg` | `#000` | `#fff` | Fondo. Puro, sin grises |
| `--fg` | `#fff` | `#000` | Texto principal |
| `--muted` | `#8c8c8c` | `#6b6b6b` | Texto secundario |
| `--red` | `#eb0028` | `#eb0028` | Acento: X, etiquetas, subrayados, foco |
| `--edge` / `--glow` | rojo oscuro translúcido | rojo muy suave | Degradado lateral y del pie |

El tema sigue al sistema; el botón lo fija (`data-theme` en `<html>`). Todo color nuevo debe tener versión clara y oscura.

## Tipografía

Inter (`@fontsource/inter`, pesos 400, 500, 600, 700; no cargues otros sin añadirlos en `main.tsx`).
- Números del contador: 400, grandes (`clamp(46px, 7.5vw, 96px)`), cifras tabulares.
- Etiquetas: mayúsculas, 600–700, `letter-spacing` 0.12–0.24em, 11–14px.
- Titulares (`h2`): 600, `letter-spacing` negativo. La etiqueta «Próximamente» del `h1` sigue el estilo de etiqueta (700).
- Texto corrido: 16px, 400, `--muted`, máximo ~46 caracteres por línea en bloques.

## Movimiento

- X: trazo que recorre la figura en bucle (`cs-run`, 9s) y brillo suave (`cs-glow`).
- Bloques inferiores: aparecen ligados al scroll (`animation-timeline: view()`), terminan cuando el elemento entra entero.
- Botones: el subrayado rojo rellena el botón; la flecha sale en diagonal.
- Siempre: respeta `prefers-reduced-motion` (todo se desactiva) y no bloquees el scroll ni retrases el contenido.

## Accesibilidad (mínimos)

Contraste AA. Objetivos táctiles de 44px. Foco visible (contorno de 2px; rojo en botones). Un solo `h1`. Textos alternativos o `aria-hidden` en lo decorativo. Contador con `role="timer"` y etiqueta. Probar a 1440px y 390px sin scroll horizontal.

## Normas TED que afectan al diseño

- Nombre completo «TEDxUniversidad Politecnica Madrid» en público. «TEDxUPM» solo interno.
- Sin logos ni nombres de partners en la home. Van en `/partners`, y más pequeños que el logo TEDx.
- Logo UPM nunca junto al wordmark ni en la cabecera (pendiente de confirmar con TED).
- Pie obligatorio: «This independent TEDx event is operated under license from TED.»
- Un partner no puede dar charla ni decidir contenido.

## Qué no (decisiones del equipo)

- Textos de relleno o que valgan para cualquier evento («mentes brillantes», «Ideas que abren perspectivas. Personas que conectan.»).
- Degradados sin relación con el tema, dibujos de órbitas, etiquetas «01 /…» en cada sección, burbujas «SCROLL DOWN».
- Rejillas vacías de «speakers coming soon», cifras prestadas de TED, fotos de stock o generadas.
- Líneas grises separando bloques (se quitaron a petición).

> Pendiente de revisar con el equipo: la X tiene brillo y hay un indicador de scroll en el hero; el estudio desaconseja ambos.
