# Mindlog

Aplicación del curso Desarrollo Móvil para gestionar tareas en tableros compartidos. Cada aplicación se instala de forma independiente con pnpm, sin workspaces.

## Requisitos

Node.js 22.13 o posterior, pnpm, una cuenta Expo/EAS y un teléfono Android. El entorno principal usa una Development Build; Expo Go permanece disponible para funcionalidades compatibles.

## API

En `apps/api`, configura `.env` a partir de `.env.example` con la URL y el token de Turso y un `JWT_SECRET` aleatorio de al menos 32 bytes. Para pnpm 12 instala con `pnpm install --ignore-scripts`; inicia con `pnpm dev`. La API escucha en `PORT` y `GET /health` indica que está disponible. Swagger UI está en `/docs` y el documento OpenAPI generado en `/openapi.json`.

Aplica las migraciones manualmente con `pnpm migrate` antes de usar una base vacía. Este comando modifica la base indicada en `.env`: verifica su destino antes de ejecutarlo. Consulta [base de datos](docs/database.md), [API](docs/api.md) y el [manual de despliegue en Vercel](docs/deploy-vercel.md).

Si el puerto ya está ocupado, detén el servicio que lo usa o cambia `PORT` en `apps/api/.env` y el puerto de `EXPO_PUBLIC_DEV_API_URL` en `apps/mobile/.env`. Comprueba que un contenedor anterior de Mindlog no esté usando el mismo puerto con `docker ps`.

## Mobile

En `apps/mobile`, configura `.env` a partir de `.env.example` e instala con `pnpm install`. Instala una Development Build y usa `pnpm start` para la API de desarrollo o `pnpm start -- --api=prod` para otra API configurada. Abre la Development Build y conecta con Metro; Fast Refresh aplica los cambios JavaScript/TypeScript. `pnpm start -- --go` permite usar Expo Go para funciones compatibles. Consulta [desarrollo, APK y notificaciones](docs/deploy-vercel.md#8-desarrollo-y-pruebas-android-con-eas).

`EXPO_PUBLIC_DEV_API_URL` debe apuntar a la IP de la computadora visible para el teléfono (no `localhost`); `EXPO_PUBLIC_PROD_API_URL` debe apuntar a la API desplegada. Las variables `EXPO_PUBLIC_*` son públicas y no deben contener secretos. Véanse [arquitectura](docs/architecture.md) y [decisiones visuales de la app](docs/mobile-design.md).
