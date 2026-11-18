# Definición de terminado

Una tarea está terminada cuando todo esto es cierto **y se ha comprobado en esta sesión**:

- [ ] Hace lo que se pidió, ni más ni menos.
- [ ] `npm run typecheck` sin errores.
- [ ] `npm run build` termina y prerenderiza `/es/` y `/en/`.
- [ ] La página se ha mirado en escritorio (1440px) y móvil (390px), en tema oscuro y claro, sin scroll horizontal.
- [ ] Con `prefers-reduced-motion` no hay animaciones.
- [ ] Se respetan `docs/design/DESIGN.md` y las normas TED (skill `ted-compliance` antes de publicar).
- [ ] Ningún partner ni ponente sin confirmar en lo público: `grep -ri bbva dist` vacío.
- [ ] Sin secretos ni datos personales en el diff.
- [ ] Documentación actualizada si cambió algo que describe.
- [ ] El informe final dice qué se comprobó y qué no.

No hay tests automáticos todavía. Cuando se añada lógica con reglas (entradas, pagos, QR), esa lógica llega con tests y este documento se amplía con el comando.

Si una comprobación no se pudo hacer, se dice explícitamente y por qué. Nunca se da por buena una comprobación no ejecutada.
