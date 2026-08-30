# Despliegue y desarrollo
Se utilizará Turso para el despliegue de la base de datos pero para desarrollo en local se utilizará un local.db (base de datos en archivo), puedes gestionarlo con una herramienta para sqlite o directamente con turso cli (este último tiene version de Windows o puedes usar WSL).
El uso de <a href="https://docs.turso.tech/sql-reference/cli/getting-started">Turso CLI</a> ayuda a levantar un servicio como el de producción pero en local en vez de acceder directamente a leer la base de datos como archivo y eso permite no tener una doble configuración de conexión.

# Esquema
