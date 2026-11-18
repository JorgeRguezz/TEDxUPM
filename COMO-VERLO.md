# Cómo ver las propuestas de diseño

Hay dos ramas con trabajo de diseño. Ninguna se publica en la web oficial: producción sale de `main`, y la carpeta `referencias/` no entra en el build (`dist/`).

## 1. Rama `referencias`: portfolio y demos en HTML

Son páginas HTML sueltas. No hay que instalar ni arrancar nada.

```sh
git fetch origin
git switch referencias
git pull
```

Luego abre los archivos en el navegador (en macOS con `open`, en Windows con doble clic):

| Archivo | Qué es |
|---|---|
| `referencias/index.html` | Portfolio de referencias de webs TEDx, decisiones del equipo y normas TED |
| `referencias/demos/index.html` | Demo de landing (versión de la X de luz) |
| `referencias/demos/cabeceras.html` | Cuatro opciones de cabecera |
| `referencias/demos/suizo-cartel.html` | Demo en estilo cartel suizo, con página de Partners (enlace "Partners" del menú) |

La tipografía (Inter) se carga de Google Fonts, así que sin internet se verá con la fuente del sistema.

## 2. Rama `rediseno-cartel`: la web de verdad (React) con el estilo cartel

Esta sí hay que arrancarla en local. Necesita Node.js 20 o superior.

```sh
git fetch origin
git switch rediseno-cartel
git pull
npm install        # solo la primera vez
npm run dev
```

Abre http://127.0.0.1:5173/es/ (o `/en/`).

- **Portada:** abajo a la derecha hay un selector **A · B · C** con tres propuestas. También se puede abrir directamente con `?hero=a`, `?hero=b` o `?hero=c`. Ninguna está decidida.
- **Ponentes:** solo salen los tres confirmados. La X de cada ficha será el enlace a la descripción del ponente cuando exista.
- **Partners:** `/es/partners/` lleva el logo de BBVA como Experience Partner.

## Antes de llevar algo a `main`

- **BBVA no ha firmado.** Según `docs/prds/WP-01-logo-bbva.md`, su logo no puede llegar a producción. La rama `rediseno-cartel` lo tiene en `/partners/`.
- **Nombre del evento.** En la web pública va siempre "TEDxUniversidad Politecnica Madrid". El "TEDxUPM" grande del pie hay que confirmarlo con TED.
- **Formularios.** Siguen siendo de demostración: no guardan ni envían nada.
- **Selector A/B/C.** Hay que quitarlo cuando se elija portada.
