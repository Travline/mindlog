# API y despliegue

## Swagger y OpenAPI

La especificación OpenAPI 3 se genera automáticamente al cargar la aplicación en desarrollo, en el servidor compilado y en Vercel. `GET /openapi.json` entrega el documento y `GET /docs` abre Swagger UI, donde se puede proporcionar un JWT con **Authorize** y probar las rutas. Los comentarios JSDoc `@openapi` se mantienen junto a cada ruta y los esquemas compartidos están en `src/config/openapi.ts`; documenta todo endpoint nuevo o modificado en el mismo cambio.

`vercel.json` incluye los archivos TypeScript fuente que se necesitan para generar la especificación al iniciar la función. Los recursos de Swagger UI se sirven mediante rutas explícitas, sin depender de `express.static`.

## Contrato

Las solicitudes y respuestas usan JSON. Las rutas protegidas requieren `Authorization: Bearer <token>`. Los errores responden `{ "error": "mensaje" }` con códigos HTTP 400, 401, 403, 404, 409 o 500 según corresponda. Los identificadores de tableros, columnas y tickets son números; los de usuarios son UUID.

- `POST /auth/register` recibe `username`, `email` y `password` (mínimo ocho caracteres); `POST /auth/login` recibe correo y contraseña. Ambas responden con `token` y `user`.
- `GET /auth/me` y `PUT /auth/me` consultan o editan `username` y `email` del usuario autenticado.
- `GET /boards` lista los tableros accesibles; `POST /boards` crea uno con `title` y `description` opcional. `GET`, `PUT` y `DELETE /boards/:boardId` consultan, editan o eliminan un tablero. El detalle incluye miembros, columnas, tickets y asignaciones.
- `POST /boards/:boardId/members` agrega un usuario registrado mediante `email`. `DELETE /boards/:boardId/members/:userId` retira un miembro: lo ejecuta el dueño o el propio miembro. El dueño no puede ser retirado. Al salir se eliminan las asignaciones de ese usuario en el tablero.
- `POST /boards/:boardId/columns` crea una columna; `PUT` y `DELETE /boards/:boardId/columns/:columnId` la editan o eliminan junto a sus tickets.
- `POST /boards/:boardId/columns/:columnId/cards` crea un ticket. `PUT` y `DELETE /boards/:boardId/cards/:cardId` lo editan o eliminan; para moverlo, el PUT incluye `column_id` de una columna del mismo tablero. Los campos son `title`, `description`, `priority` (`Baja`, `Media` o `Alta`) y `due_date` opcional (`AAAA-MM-DD`).
- `PUT /boards/:boardId/cards/:cardId/assignments` recibe `user_ids` y sustituye los responsables. Cada responsable debe pertenecer al tablero.

El dueño es el único que edita o elimina el tablero y administra a otros miembros. Dueño y miembros pueden editar columnas y tickets. Los usuarios ajenos no pueden acceder al tablero. El cierre de sesión elimina el token del dispositivo; un token emitido sigue siendo válido hasta su expiración de siete días.

## Vercel y Turso

Consulta el [manual de despliegue en Vercel](deploy-vercel.md) para preparar Turso, configurar los entornos, aplicar migraciones y verificar la API y la aplicación móvil.

## Notificaciones

La API autenticada ofrece `PUT /notifications/devices` y `DELETE /notifications/devices` con `{ "token": "ExponentPushToken[...]" }`, `GET /notifications` para el historial y `PUT /notifications/{notificationId}/read` para marcar una notificación propia. La especificación completa está en `/docs`. Un token identifica un dispositivo y se reasocia a la última cuenta que lo registra. Los push son intentos inmediatos, sin reintentos ni revisión periódica de comprobantes; el historial se guarda aunque Expo falle.

## Solicitudes de unión por QR

El dueño obtiene o regenera el código con `GET` o `PUT /invitations/boards/{boardId}/code`. La cuenta solicitante usa `POST /invitations/preview` y `POST /invitations/requests` con `{ "code": "..." }`. El dueño consulta `GET /invitations/boards/{boardId}/requests` y decide con `PUT /invitations/boards/{boardId}/requests/{requestId}` y `{ "decision": "accept" | "reject" }`. Las rutas requieren sesión; la documentación completa y esquemas están en `/docs`. Los códigos son secretos de invitación, no deben registrarse ni incluirse en URLs o logs.
