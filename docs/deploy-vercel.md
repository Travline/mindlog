# Manual de despliegue de la API en Vercel

Este manual despliega `apps/api` desde un repositorio Git y conecta la aplicación móvil mediante HTTPS. La aplicación móvil se ejecuta por separado en Expo Go; Vercel aloja únicamente la API. Las migraciones de Turso se ejecutan explícitamente desde la computadora, nunca durante el despliegue.

## 1. Requisitos

- Una cuenta de Vercel y el repositorio de Mindlog en un proveedor Git compatible, con permiso para conectarlo.
- Una cuenta de Turso, una base de datos y un token con permisos para aplicar migraciones y operar sobre esa base. Obtén la URL y el token desde Turso y guárdalos de forma segura.
- Node.js 22.13 o posterior y pnpm instalados localmente. Para comprobar la app, un dispositivo Android con una versión de Expo Go compatible con SDK 58.

Prepara una base independiente para cada entorno que quieras probar. Las pruebas de registro y tableros escriben datos reales; evita usar la base de producción para previews o pruebas de desarrollo.

## 2. Preparar la base de datos

1. Crea o selecciona la base de producción en Turso y copia su URL `libsql://...` y su token.
2. En la computadora, instala las dependencias desde `apps/api`:

   ```sh
   cd apps/api
   pnpm install --ignore-scripts
   ```

   Si aún no existe `apps/api/.env`, créalo copiando `.env.example` con `cp .env.example .env`. Si ya existe, conserva su contenido y edítalo directamente.
3. En `apps/api/.env`, coloca la URL y el token de la base que deseas migrar en `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`. Comprueba cuidadosamente el destino. Este archivo también se usa al ejecutar la API local y sus operaciones modificarán esa base.
4. Si la base contiene datos, haz una copia de seguridad antes de aplicar cambios que puedan afectarlos. Ejecuta explícitamente:

   ```sh
   pnpm migrate
   ```

   El comando aplica las migraciones pendientes y registra sus checksums. Si falla, revisa el mensaje y [base de datos y migraciones](database.md) antes de continuar. Tras terminar, vuelve a configurar la base de desarrollo en `.env` si corresponde. Nunca publiques el archivo ni compartas sus credenciales.

## 3. Importar el proyecto en Vercel

1. En el panel de Vercel, selecciona **Add New → Project**, conecta el proveedor Git e importa el repositorio.
2. En **Root Directory**, selecciona `apps/api`. Este directorio contiene su propio `package.json`, `pnpm-lock.yaml` y `vercel.json`; no configures un workspace.
3. Usa la detección de Express y deja los comandos de instalación y compilación y el directorio de salida en sus valores automáticos. Vercel detecta pnpm mediante el lockfile y `src/app.ts` como entrada de Express; `src/server.ts` corresponde al servidor local. No agregues un comando de migración al build.
4. En la configuración general del proyecto, selecciona una versión de Node.js compatible con `>=22.13.0`, por ejemplo Node.js 22 si está disponible. Si la opción aparece después de importar, configúrala y realiza un nuevo despliegue.

Si existe un **Install Command** personalizado de una configuración anterior, retíralo para permitir que Vercel seleccione pnpm a partir del lockfile. Según la [documentación de Vercel](https://vercel.com/docs/package-managers), un comando personalizado `pnpm install` puede seleccionar una versión antigua de pnpm incompatible con el lockfile.

## 4. Configurar variables y desplegar

En **Environment Variables**, agrega estas variables al entorno **Production** antes de desplegar:

| Variable | Valor |
| --- | --- |
| `TURSO_DATABASE_URL` | URL de la base de producción en Turso. |
| `TURSO_AUTH_TOKEN` | Token de acceso a esa base. |
| `JWT_SECRET` | Secreto aleatorio de al menos 32 bytes para firmar sesiones. |

Para generar un secreto, ejecuta localmente `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` y copia el resultado de forma segura. No lo incluyas en el repositorio, la app móvil ni capturas compartidas. Cambiarlo invalida las sesiones firmadas con el anterior.

Selecciona **Deploy** y espera a que termine. Si el proyecto ya fue creado, las variables se administran en **Settings → Environment Variables** y sus cambios requieren un nuevo despliegue. Para **Preview**, configura las mismas claves con una base, token y secreto independientes; aplica las migraciones explícitamente también a esa base. Las variables de Production no se aplican automáticamente a Preview. Consulta [variables de entorno de Vercel](https://vercel.com/docs/environment-variables).

## 5. Verificar la API

1. Copia la URL HTTPS del despliegue, por ejemplo `https://tu-api.vercel.app`.
2. Abre `https://tu-api.vercel.app/health` o ejecuta:

   ```sh
   curl https://tu-api.vercel.app/health
   ```

   Debe responder `{"status":"ok"}`. Este endpoint confirma que la API responde, pero no comprueba la conexión a Turso.
3. Abre `/docs` y `/openapi.json` en esa misma URL. Comprueba que Swagger UI carga y que el documento incluye las rutas.
4. En una base de prueba, verifica el registro, el inicio de sesión y la creación y consulta de un tablero desde Swagger o la aplicación móvil. Son operaciones reales sobre la base configurada. Las rutas protegidas usan el token mediante **Authorize** en Swagger.

## 6. Conectar Expo Go

En `apps/mobile`, crea `.env` a partir de `.env.example` si todavía no existe y configura la URL HTTPS de producción, sin rutas adicionales:

```dotenv
EXPO_PUBLIC_PROD_API_URL=https://tu-api.vercel.app
```

Desde `apps/mobile`, instala las dependencias con `pnpm install` si es necesario e inicia:

```sh
pnpm start -- --api=prod
```

Abre el QR con Expo Go en Android y comprueba el acceso y los tableros. Reinicia este comando después de cambiar la URL. Las variables `EXPO_PUBLIC_*` son públicas: nunca coloques tokens de Turso ni el secreto JWT en ellas.

## 7. Actualizaciones y solución de problemas

- Los cambios enviados a la rama de producción conectada generan un nuevo despliegue de producción; otras ramas suelen generar previews. Si una versión requiere migraciones, revisa su compatibilidad, respalda cuando corresponda y aplícalas explícitamente a la base correcta como paso separado del despliegue.
- Si falla la instalación, revisa el directorio raíz, el lockfile, la versión de Node y el comando de instalación en los registros de build de Vercel.
- Si `/health` falla, revisa el estado del despliegue y los registros de la función. Si responde pero falla el acceso o la creación de tableros, revisa las variables del entorno correcto, el token y las migraciones de la base; `JWT_SECRET` debe tener al menos 32 bytes.
- Si `/docs` o `/openapi.json` fallan, revisa los registros y que `apps/api/vercel.json` se haya incluido: conserva los archivos fuente necesarios para generar OpenAPI.
- Si la app no se conecta, comprueba que usa la URL HTTPS correcta, que el despliegue es accesible desde el dispositivo y que Expo se reinició con `--api=prod`.

Referencias: [Express en Vercel](https://vercel.com/docs/frameworks/backend/express) y [entornos de Vercel](https://vercel.com/docs/deployments/environments).
