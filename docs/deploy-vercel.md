# Manual de despliegue de la API en Vercel

Este manual despliega `apps/api` desde un repositorio Git y conecta la aplicación móvil mediante HTTPS. La aplicación móvil se ejecuta por separado en una Development Build o APK preview; Vercel aloja únicamente la API. Las migraciones de Turso se ejecutan explícitamente desde la computadora, nunca durante el despliegue.

## 1. Requisitos

- Una cuenta de Vercel y el repositorio de Mindlog en un proveedor Git compatible, con permiso para conectarlo.
- Una cuenta de Turso, una base de datos y un token con permisos para aplicar migraciones y operar sobre esa base. Obtén la URL y el token desde Turso y guárdalos de forma segura.
- Node.js 22.13 o posterior y pnpm instalados localmente. Para comprobar la app, un dispositivo Android y una Development Build o APK preview.

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
2. En **Root Directory**, selecciona `apps/api`. Desactiva **Include source files outside of the Root Directory in the Build Step**, ya que la API no depende de archivos de otras aplicaciones. Este directorio contiene su propio `package.json`, `pnpm-lock.yaml` y `vercel.json`; no configures un workspace. La opción puede estar activada por defecto; consulta las [preguntas frecuentes de Vercel](https://vercel.com/docs/monorepos/monorepo-faq).
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

## 6. Conectar la Development Build

En `apps/mobile`, crea `.env` a partir de `.env.example` si todavía no existe y configura la URL HTTPS de producción, sin rutas adicionales:

```dotenv
EXPO_PUBLIC_PROD_API_URL=https://tu-api.vercel.app
```

Desde `apps/mobile`, instala las dependencias con `pnpm install` si es necesario e inicia:

```sh
pnpm start -- --api=prod
```

Abre la Development Build instalada y conecta con Metro mediante el QR. Comprueba el acceso y los tableros. Reinicia este comando después de cambiar la URL. Las variables `EXPO_PUBLIC_*` son públicas: nunca coloques tokens de Turso ni el secreto JWT en ellas.

## 7. Actualizaciones y solución de problemas

- Los cambios enviados a la rama de producción conectada generan un nuevo despliegue de producción; otras ramas suelen generar previews. Si una versión requiere migraciones, revisa su compatibilidad, respalda cuando corresponda y aplícalas explícitamente a la base correcta como paso separado del despliegue.
- Si falla la instalación, revisa el directorio raíz, el lockfile, la versión de Node y el comando de instalación en los registros de build de Vercel.
- Si aparece `NODE_TYPESCRIPT_ERROR` para archivos de `../mobile`, confirma que el directorio raíz sea `apps/api`, que la inclusión de archivos fuera del directorio raíz esté desactivada y que el despliegue incluya el `vercel.json` actual. Este excluye `mobile` del rastreo de la función; el build local de la API solo incluye `src/**/*.ts`. El error puede producirse en la fase posterior de empaquetado de Vercel. Si continúa, revisa los registros del nuevo despliegue.
- Si `/health` falla, revisa el estado del despliegue y los registros de la función. Si responde pero falla el acceso o la creación de tableros, revisa las variables del entorno correcto, el token y las migraciones de la base; `JWT_SECRET` debe tener al menos 32 bytes.
- Si `/docs` o `/openapi.json` fallan, revisa los registros y que `apps/api/vercel.json` se haya incluido: conserva los archivos fuente necesarios para generar OpenAPI.
- Si la app no se conecta, comprueba que usa la URL HTTPS correcta, que el despliegue es accesible desde el dispositivo y que Expo se reinició con `--api=prod`.

Referencias: [Express en Vercel](https://vercel.com/docs/frameworks/backend/express) y [entornos de Vercel](https://vercel.com/docs/deployments/environments).

## 8. Desarrollo y pruebas Android con EAS

Desde `apps/mobile`, instala con `pnpm install`. Se usa la CLI local de Expo a través de `pnpm start` (equivalente a `pnpm exec expo start --dev-client` con selección de API) y EAS CLI mediante `pnpm dlx eas-cli`; no se instala nada globalmente. La Development Build permite Fast Refresh y requiere Metro. Preview es un APK autónomo sin Metro. Expo Go sigue disponible con `pnpm start -- --go` para las funciones compatibles, pero no admite push remotas en SDK 58.

### Preparación de Expo y Firebase

1. Con una cuenta Expo, ejecuta `pnpm dlx eas-cli login` y `pnpm dlx eas-cli init` para vincular el proyecto y obtener `extra.eas.projectId` en `app.json`. El paquete Android actual es `com.mindlog.app`; antes de distribuir, elige un identificador propio y usa exactamente el mismo en Firebase. Los dos perfiles comparten identificador y firma: instalar uno puede reemplazar al otro en el mismo teléfono.
2. Crea en Firebase una aplicación Android con ese identificador y descarga `google-services.json`. El archivo está excluido de Git. Configura `GOOGLE_SERVICES_JSON` como variable de archivo secreta en **ambos** entornos EAS, `development` y `preview`. Para un build local puede apuntar a la ruta local. Consulta [variables de entorno EAS](https://docs.expo.dev/eas/environment-variables/).
3. Configura la credencial de cuenta de servicio FCM HTTP v1 del mismo proyecto Firebase en EAS con `pnpm dlx eas-cli credentials`, siguiendo la [guía de Expo](https://docs.expo.dev/push-notifications/fcm-credentials/). La clave privada no debe añadirse al repositorio ni al bundle. Configura también la firma Android mediante EAS cuando lo solicite.
4. Aplica explícitamente las migraciones de la API a una base de pruebas y despliega la API de pruebas. En el entorno EAS `preview`, define `EXPO_PUBLIC_PROD_API_URL` con su URL HTTPS accesible desde los teléfonos. El perfil fija `EXPO_PUBLIC_API_ENV=prod`; aquí `prod` selecciona esa variable y no exige usar la base de producción. No uses `localhost`, una IP privada inaccesible ni datos de producción. Las variables `EXPO_PUBLIC_*` son públicas y quedan incluidas en el bundle.

### Development Build

```sh
pnpm dlx eas-cli build --platform android --profile development
pnpm start -- --api=dev
```

Instala el APK generado en tu Android, abre la Development Build y conecta al Metro de Ubuntu mediante el QR. El teléfono debe poder alcanzar Metro y la API: usa la misma red y una IP LAN válida en `EXPO_PUBLIC_DEV_API_URL`; `localhost` en el teléfono apunta al propio teléfono. Para elegir la URL HTTPS configurada en `EXPO_PUBLIC_PROD_API_URL`, usa `pnpm start -- --api=prod`. Metro usa las variables locales de `.env`, no las del build EAS. Puedes pasar `--tunnel` si la red lo necesita y tienes disponible el soporte de túnel de Expo. Reinicia Metro tras cambiar variables; `--clear` está disponible cuando necesites limpiar caché.

### APK preview para el equipo

```sh
pnpm dlx eas-cli build --platform android --profile preview
```

Descarga el APK o comparte el enlace de instalación de la página del build EAS con los integrantes autorizados. En Android puede ser necesario permitir instalar aplicaciones desde el navegador o gestor de archivos. Cada persona instala el APK, inicia sesión y concede el permiso de notificaciones; no necesita Metro. Antes de distribuir, comprueba que el entorno `preview` contiene la URL pública de la API de pruebas y el archivo Firebase correcto. `pnpm exec expo config --type public` permite revisar la configuración pública local, pero no acredita las variables secretas de EAS.

### Cuándo recompilar

- En Development Build, cambios de JavaScript/TypeScript y estilos compatibles se aplican con Fast Refresh sin regenerar el binario. Cambios de dependencias o configuración nativas, plugins, permisos, identificador o Firebase requieren una nueva build.
- Preview lleva su JavaScript dentro del APK: sin EAS Update configurado, incluso los cambios solo de JavaScript requieren generar y distribuir un APK nuevo. Cambiar una URL `EXPO_PUBLIC_*` incluida en preview también requiere un nuevo bundle/APK.

### Comprobar push entre dispositivos

En dos dispositivos físicos compatibles con servicios de Google y conectados a internet, inicia sesión con cuentas distintas y concede el permiso. Agrega una cuenta al tablero y asígnale un ticket desde la otra; comprueba el aviso con la app abierta, en segundo plano y cerrada, la bandeja y la apertura del tablero. Prueba también permisos denegados o desactivados, cierre de sesión y cambio de cuenta. Android puede retrasar o impedir entregas por conectividad, restricciones de batería y estado de la aplicación; Expo no garantiza entrega ni unicidad. El backend evita duplicar registros para el mismo token y la app sincroniza cambios de token, pero una reinstalación puede dejar un token anterior que no se puede asociar a la instalación nueva.

El envío es inmediato y no usa cron ni otro backend. Se eliminan tokens rechazados en el ticket de respuesta; sin revisar comprobantes posteriores no se detectan todas las desinstalaciones o invalidaciones. El historial se conserva aunque falle el push. Revisa registros de Vercel y configuración FCM si no llega el aviso; la aceptación por Expo no confirma la entrega.
