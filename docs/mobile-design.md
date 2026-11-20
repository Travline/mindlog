# Diseño e interacción móvil

Estas son las decisiones vigentes de Mindlog. Actualiza este documento cuando cambien las reglas visuales o de interacción.

## Apariencia y navegación

- La app usa modo claro. Los fondos de pantallas, áreas seguras y ventanas son blanco puro (`#ffffff`); el texto y las acciones principales son negros, con grises para bordes, fondos seleccionados y texto secundario.
- Las prioridades son la excepción de color: Baja usa verde (`#dcfce7` / `#166534`), Media ámbar (`#fef3c7` / `#92400e`) y Alta rojo (`#fee2e2` / `#991b1b`), con colores de fondo y texto respectivamente.
- La navegación hacia atrás usa un chevrón a la izquierda del título, centrado verticalmente. Los accesos a opciones usan tres puntos y tienen una etiqueta accesible.
- Las acciones de columnas y tickets se muestran superpuestas al contenido, con fondo blanco, una X de cierre, separador tenue bajo el título y opciones centradas con iconos. La acción de eliminar usa rojo y conserva sus confirmaciones.
- Los campos de texto comparten un mínimo de 48 puntos de altura y 16 puntos de padding horizontal. Las búsquedas usan placeholder y una X para limpiar cuando contienen texto.
- Mostrar indicadores mientras se cargan datos o se guardan cambios; deshabilitar el envío repetido durante la espera. No añadir demoras artificiales a cambios de vista inmediatos.

## Tableros y columnas

- La descripción y administración del tablero están en la vista de más opciones. El dueño administra el tablero y sus miembros; los demás ven los nombres sin correos y pueden abandonar el tablero.
- Se muestra una columna a la vez. Su nombre y chevrón abren el selector; la opción actual tiene fondo gris claro y check a la derecha. La primera columna se selecciona al abrir el tablero y la selección se conserva al actualizar sus datos.
- El selector incluye **+ Añadir nueva columna** en la misma lista, con mayor peso de fuente. Si no hay columnas, se muestra el estado vacío y un botón **Crear columna**.
- Encima de la tarjeta de columna, «Filtros y orden» se despliega mediante un chevrón para mostrar los filtros de prioridad y el selector de orden. Las opciones seleccionadas usan sombreado, sin checks, y los controles son negros, blancos y grises. Inicialmente están seleccionadas todas las prioridades y el orden Recientes; si no hay coincidencias, se ofrece restablecer prioridades. Agitar activa Fecha y prioridad y muestra una indicación breve; el panel indica el orden activo cuando procede, sin ofrecerlo como opción manual.
- La columna muestra sus opciones junto al nombre y, debajo, un botón negro de ancho completo **+ Crear ticket**. Eliminar una columna y sus tickets requiere dos confirmaciones.

## Tickets y responsables

- Las etiquetas de prioridad y fecha de vencimiento aparecen debajo del título y muestran solo sus valores. La fecha es opcional y se elige mediante un calendario; puede quitarse.
- Las acciones del ticket incluyen editar, mover cuando haya otra columna, asignar y eliminar. Eliminar requiere confirmación.
- La asignación permite buscar integrantes por nombre, seleccionar varios y guardar; los responsables existentes aparecen seleccionados. Los seleccionados tienen fondo gris claro y check a la derecha.
- **Ver responsables** aparece solo cuando hay personas asignadas, con texto gris y un chevrón previo. Abre una ventana con los nombres y el número de responsables.

## Notificaciones

- En «Mis tableros», los accesos a notificaciones y perfil usan iconos negros con etiquetas accesibles. El icono de notificaciones muestra un contador negro con texto blanco solo si hay eventos sin leer; visualmente se limita a 99+. Las notificaciones no leídas usan fondo gris claro y texto destacado; al tocarlas se marcan como leídas y abren el tablero. Si ya no se puede acceder, se explica al usuario.
- Si el permiso o el canal están desactivados, la bandeja explica cómo activarlos y ofrece abrir los ajustes del dispositivo. Los avisos push requieren una compilación Android instalada; el historial funciona también en Expo Go.

## Invitaciones por QR

- «Mis tableros» ofrece escanear un QR dentro de la app. Después de escanear se muestra el nombre del tablero y se solicita confirmación. Si el permiso de cámara está bloqueado, se ofrece abrir los ajustes.
- Solo el dueño ve el botón para mostrar o regenerar el QR y la lista de solicitudes pendientes dentro de la configuración del tablero. Cada solicitud permite aceptar o rechazar. Regenerar el QR requiere confirmación y conserva las solicitudes recibidas.
- Las notificaciones de una solicitud abren la configuración del dueño; las de aceptación abren el tablero y las de rechazo muestran el resultado en «Mis tableros».
