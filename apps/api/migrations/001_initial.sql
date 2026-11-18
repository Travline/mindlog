CREATE TABLE users (
  user_id TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL UNIQUE, username TEXT NOT NULL,
  password TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE boards (
  board_id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT,
  owner_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE board_members (
  board_id INTEGER NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (board_id, user_id)
);
CREATE TABLE board_columns (
  column_id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE, title TEXT NOT NULL
);
CREATE TABLE cards (
  card_id INTEGER PRIMARY KEY AUTOINCREMENT,
  column_id INTEGER NOT NULL REFERENCES board_columns(column_id) ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT, priority TEXT NOT NULL DEFAULT 'Media' CHECK (priority IN ('Baja', 'Media', 'Alta')),
  due_date TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE card_assignments (
  card_id INTEGER NOT NULL REFERENCES cards(card_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, PRIMARY KEY (card_id, user_id)
);
CREATE INDEX idx_boards_owner_id ON boards(owner_id);
CREATE INDEX idx_board_members_user_id ON board_members(user_id);
CREATE INDEX idx_board_columns_board_id ON board_columns(board_id);
CREATE INDEX idx_cards_column_id ON cards(column_id);
CREATE INDEX idx_card_assignments_user_id ON card_assignments(user_id);
