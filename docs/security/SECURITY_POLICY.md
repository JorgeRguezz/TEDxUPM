# Seguridad y datos

Hoy la web recoge un único dato personal (el correo de la lista de novedades, ver abajo) y su único secreto es el token del almacén. Este documento fija las reglas para cuando los tenga (entradas, pagos, directorio de asistentes), porque esos sistemas manejarán pagos y datos personales de estudiantes y asistentes.

## Permisos para agentes

**Permitido**: leer el código, ejecutar `npm run dev|typecheck|build|preview`, `git status|diff|log`, crear o editar archivos del repo dentro de la tarea.

**Requiere aprobación humana**: `git push` (pregunta siempre), fusionar en `staging` o `main`, desplegar en Vercel, borrar ramas, añadir o actualizar dependencias, cambiar `vercel.json`, `.claude/` o el prerender, cualquier cosa con pagos, autenticación o datos personales.

**Prohibido**: leer, escribir o subir `.env*`; poner secretos en el código o en commits; `git push --force` y `rm -rf`; añadir coautores a commits; publicar logos de partners sin contrato o ponentes sin confirmar; registrar datos personales en logs.

Lo que se puede forzar está en `.claude/settings.json` (permisos) y `.claude/hooks/` (bloqueos). El resto depende de estas normas y de la revisión del PR.

## Secretos

- Solo en variables de entorno de Vercel (`vercel env`) o en `.env.local` (ignorado por git). Nunca en el repo.
- Si un secreto llega a un commit: se rota de inmediato. Borrarlo del historial no basta.

## Datos personales (RGPD)

Antes de lanzar cualquier formulario real:
- Política de privacidad publicada y enlazada junto al formulario.
- Pedir solo lo necesario (minimización). Decir para qué y cuánto tiempo se guarda.
- Proveedor con contrato de encargado de tratamiento y datos en la UE si es posible.
- Derecho de acceso y borrado con un proceso definido.
- El directorio de asistentes (WP-07) es opt-in y cada persona controla qué es visible.

### Lista de novedades (activa)

- Formulario en la home → `POST /api/subscribe` (`api/subscribe.ts`). Guarda el correo en minúsculas en el conjunto ordenado `subscribers` de Upstash Redis (integración de Vercel Marketplace); la puntuación es la fecha de consentimiento.
- Variables de entorno (las crea la integración, nunca en el repo): `KV_REST_API_URL` y `KV_REST_API_TOKEN`. Sin ellas el endpoint responde 503 y no guarda nada. Elegir región UE al crear la base.
- Consentimiento expreso (casilla) y aviso de privacidad junto al formulario. Pendiente: política de privacidad completa en una página propia, revisada por el equipo.
- Defensas: solo mismo origen, cuerpo ≤ 2 KB, casilla obligatoria, campo trampa para bots. El correo no se registra en logs. Sin límite por IP (usar Vercel Firewall si hay abuso).
- Baja y supresión: se piden a tedxupm@upm.es y se borran con `ZREM subscribers <correo>`.
- El envío de correos (Resend) aún no existe: cuando llegue, cada envío debe llevar enlace de baja.

## Pagos y entradas (futuro, WP-05/06)

- Nunca procesar tarjetas en nuestro código: pasarela externa (Stripe, Luma…).
- Webhooks verificados por firma e idempotentes.
- QR firmados y de un solo uso, para que no se puedan falsificar.
- Mínimo privilegio en las claves de API; claves de prueba fuera de producción.

## Incidentes

Si se sospecha una filtración: avisar al equipo, rotar credenciales, revisar qué datos se expusieron y, si son personales, valorar la notificación a la AEPD en 72h.
