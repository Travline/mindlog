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
- La columna muestra sus opciones junto al nombre y, debajo, un botón negro de ancho completo **+ Crear ticket**. Eliminar una columna y sus tickets requiere dos confirmaciones.

## Tickets y responsables

- Las etiquetas de prioridad y fecha de vencimiento aparecen debajo del título y muestran solo sus valores. La fecha es opcional y se elige mediante un calendario; puede quitarse.
- Las acciones del ticket incluyen editar, mover cuando haya otra columna, asignar y eliminar. Eliminar requiere confirmación.
- La asignación permite buscar integrantes por nombre, seleccionar varios y guardar; los responsables existentes aparecen seleccionados. Los seleccionados tienen fondo gris claro y check a la derecha.
- **Ver responsables** aparece solo cuando hay personas asignadas, con texto gris y un chevrón previo. Abre una ventana con los nombres y el número de responsables.
