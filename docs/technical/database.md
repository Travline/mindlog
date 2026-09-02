# Despliegue y desarrollo
Se utilizará Turso para el despliegue de la base de datos y local se conectará directamente a esa base de datos.

# Esquema
Usuarios de todo el sistema, no habrá roles como tal
- users
  - user_id TEXT PK (UUID)
  - email TEXT UNIQUE NOT NULL
  - username TEXT NOT NULL
  - created_at DATETIME

Tableros kanban de proyectos (cada tablero es un proyecto)
- boards
  - board_id AUTOINCREMENT PK
  - title TEXT NOT NULL
  - description TEXT
  - owner_id TEXT NOT NULL FK users(user_id)
  - created_at DATETIME

Usuarios que tienen acceso a los tableros pero no lo crearon
- board_members
  - board_id TEXT PK FK
  - user_id TEXT PK FK
  - joined_at DATETIME

Estas son las listas de un tablero (En Progreso, Terminado, etc)
- board_columns
  - column_id AUTINCREMENT PK
  - board_id INTEGER NOT NULL FK
  - title TEXT NOT NULL

Los tickets de las tareas del proyecto
- cards
  - card_id AUTOINCREMENT
  - column_id INTEGER NOT NULL FK
  - title TEXT NOT NULL
  - description TEXT
  - priority TEXT DEFAULT 'Media' CHECK ('Baja', 'Media', 'Alta')
  - due_date DATETIME
  - created_at DATETIME

Usuario al que se le asignó una tarea
- card_assigments
  - card_id INTEGER NOT NULL PK FK
  - user_id TEXT NOT NULL PK FK

Posts del registro de decisiones del proyecto
- posts
  - post_id AUTOINCREMENT PK
  - user_id TEXT NOT NULL FK
  - board_id INTEGER NOT NULL FK
  - title TEXT NOT NULL
  - content TEXT NOT NULL
  - created_at DATETIME
  
# Relación entre tablas  
| Relación                     | Cardinal |
| ---------------------------- | -------- |
| `users` → `boards`           | 1:N      |
| `users` → `board_members`    | 1:N      |
| `boards` → `board_members`   | 1:N      |
| `boards` → `board_columns`   | 1:N      |
| `board_columns` → `cards`    | 1:N      |
| `cards` → `card_assignments` | 1:N      |
| `users` → `card_assignments` | 1:N      |
| `users` → `posts`            | 1:N      |
| `boards` → `posts`           | 1:N      |

# Índices
Para mantener consultas rápidas cuando escala el número de filas de registros se crearán los siguientes índices
- idx_boards_owner_id (owner_id)
- idx_board_columns_board_id (board_id)
- idx_cards_column_id (column_id)
- idx_posts_board_id (board_id)