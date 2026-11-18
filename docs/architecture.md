# Arquitectura y tecnologías

Mindlog ofrece cuentas, tableros compartidos, columnas y tickets sin bandeja ni drag and drop. Desde el icono de más opciones de la cabecera, el dueño administra el tablero y sus miembros; los demás integrantes pueden consultar nombres sin correos y abandonar el tablero. La descripción del tablero se muestra en estas vistas. Dueño e integrantes editan columnas, tickets y asignaciones. En cada tablero se muestra una columna a la vez: su nombre despliega el selector, que también permite crear columnas; la primera se selecciona al abrirlo. Si el tablero está vacío, se ofrece directamente crear la primera columna. Los tickets se muestran en orden de creación y se mueven con un selector. Eliminar una columna elimina sus tickets después de dos confirmaciones.

## Organización

`apps/mobile` y `apps/api` son proyectos independientes con pnpm y sin paquetes ni esquemas compartidos. Cada aplicación define sus propios contratos y dependencias.

## API

Express 5 y TypeScript se organizan por dominios. Las rutas procesan HTTP, los servicios aplican validaciones y reglas de acceso, y los repositorios encapsulan las consultas y transacciones. La configuración, el registro y el manejo de errores son comunes. `src/app.ts` exporta Express para Vercel; `src/server.ts` inicia el servidor local. Turso se accede con `@libsql/client`. Las contraseñas usan scrypt con salt aleatorio y las sesiones son JWT firmados con expiración de siete días, sin almacenar contraseñas ni tokens en registros. Véase [API y despliegue](api.md).

## Mobile

Expo SDK 58, Expo Router, gluestack-ui y NativeWind; diseño claro en blanco y negro, con colores para las prioridades. Las reglas visuales y decisiones de interacción están en [diseño móvil](mobile-design.md). El logo está en `assets/icons/Logo.tsx`. La configuración de pnpm fija `lightningcss` en 1.30.1 para compatibilidad con NativeWind. La sesión se guarda con Expo SecureStore; al vencer se pide iniciar sesión otra vez. Los errores de red permiten reintentar sin borrar la sesión.

La fecha opcional de un ticket se selecciona con `@react-native-community/datetimepicker`, incluido en Expo Go, y se envía como fecha local `AAAA-MM-DD`. El formulario permite quitarla. Los campos de texto comparten el mismo espaciado horizontal.

Los fondos de las pantallas, áreas seguras y ventanas usan blanco puro (`#ffffff`), definido también en el contenedor de navegación.

La app muestra indicadores durante la recuperación de sesión, el acceso a tableros y las operaciones de red; los formularios indican cuándo están guardando e impiden envíos repetidos mientras esperan la respuesta. La columna seleccionada ofrece un botón para crear tickets y un menú para editarla o eliminarla. Cada ticket reúne sus acciones en un menú superpuesto y muestra la prioridad y la fecha como etiquetas. La prioridad se selecciona entre Baja (verde), Media (ámbar) y Alta (rojo). Desde las acciones se pueden buscar integrantes por nombre y seleccionar varios responsables; al abrir la asignación aparecen marcados los responsables guardados. El enlace de responsables solo aparece cuando hay al menos una persona asignada y su ventana muestra la cantidad. La cabecera usa una flecha a la izquierda para volver.

Metro utiliza `react-native-compat.js` para conservar los componentes de NativeWind y exponer las APIs de React Native 0.88 que aún no exporta `react-native-css`, como `NativeComponentRegistry`, requerido por Expo Router. Tras cambiar la configuración de Metro, reinicia Expo para aplicarla.

SDK 58 requiere una versión compatible de Expo Go en Android. Las notificaciones y otros requisitos se planificarán después.
