# Instrucciones para el proyecto

- Usa pnpm. Cada aplicación se instala y ejecuta desde su propio directorio; no uses workspaces ni Turborepo.
- Actualiza la documentación relacionada con cada cambio importante, en el mismo cambio.
- Documenta las decisiones de producto y las reglas visuales vigentes en `docs/architecture.md` y `docs/mobile-design.md`, y actualízalas junto con los cambios relacionados.
- No escribas pruebas para todo ni las ejecutes por rutina: elige las necesarias y ejecútalas al finalizar la implementación de planes o metas.
- No revises Git constantemente; es un proyecto individual.
- Mantén las aplicaciones independientes, sin esquemas ni paquetes compartidos.
- Conserva la arquitectura modular y por capas de la API y aplica Node.js Best Practices de forma proporcionada.
- No ejecutes migraciones automáticamente al arrancar ni durante el despliegue. La base Turso de producción se modifica solo mediante migraciones explícitas.
- La aplicación móvil debe poder abrirse en Expo Go para Android y utilizar modo claro en blanco y negro; las prioridades de tickets son una excepción de color acordada.
- Documenta cada endpoint nuevo o modificado con comentarios JSDoc `@openapi` junto a su ruta, incluyendo parámetros, cuerpo, respuestas y autenticación; actualiza los esquemas comunes cuando corresponda.
