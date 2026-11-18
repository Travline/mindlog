# Base de datos y migraciones

La API utiliza Turso mediante `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`. Desarrollo también se conecta directamente a la base configurada: las operaciones modifican datos reales. No compartas credenciales ni incluyas secretos en archivos versionados.

Desde `apps/api`, configura `.env`, verifica la base de destino y ejecuta `pnpm migrate` para aplicar manualmente las migraciones pendientes. El script registra nombre y checksum en `schema_migrations`, rechaza cambios en migraciones ya aplicadas y ejecuta cada migración y su registro en una transacción. No edites migraciones aplicadas: agrega otra con un número mayor. Haz una copia de seguridad antes de cambios que afecten datos existentes.

La migración inicial crea usuarios, tableros, miembros, columnas, tickets y asignaciones con sus relaciones e índices. Una eliminación de tablero, columna o ticket elimina explícitamente sus dependencias dentro de una transacción; al retirar un miembro se borran sus asignaciones en el tablero. Las migraciones no se ejecutan al iniciar la API ni al desplegarla. Para verificar el mecanismo, usa una URL `file:` temporal; no uses producción para pruebas.

La migración de notificaciones añade el historial por usuario y los tokens de dispositivos. El historial conserva una referencia numérica al tablero incluso si se elimina, para poder informar que ya no está disponible. La operación de alta o asignación y sus eventos se confirman juntas. Aplica esta migración explícitamente antes de desplegar la API que la usa.
