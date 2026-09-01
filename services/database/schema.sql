PRAGMA foreign_keys = ON;

-- =========================================
-- USERS
-- =========================================

CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- BOARDS
-- =========================================

CREATE TABLE boards (
  board_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (owner_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);


-- =========================================
-- BOARD MEMBERS
-- =========================================

CREATE TABLE board_members (
  board_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (board_id, user_id),

  FOREIGN KEY (board_id)
    REFERENCES boards(board_id)
    ON DELETE CASCADE,

  FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);


-- =========================================
-- BOARD COLUMNS
-- =========================================

CREATE TABLE board_columns (
  column_id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL,
  title TEXT NOT NULL,

  FOREIGN KEY (board_id)
    REFERENCES boards(board_id)
    ON DELETE CASCADE
);


-- =========================================
-- CARDS
-- =========================================

CREATE TABLE cards (
  card_id INTEGER PRIMARY KEY AUTOINCREMENT,
  column_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'Media',
  due_date DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CHECK (priority IN ('Baja', 'Media', 'Alta')),

  FOREIGN KEY (column_id)
    REFERENCES board_columns(column_id)
    ON DELETE CASCADE
);


-- =========================================
-- CARD ASSIGNMENTS
-- =========================================

CREATE TABLE card_assignments (
  card_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,

  PRIMARY KEY (card_id, user_id),

  FOREIGN KEY (card_id)
    REFERENCES cards(card_id)
    ON DELETE CASCADE,

  FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);


-- =========================================
-- POSTS
-- =========================================

CREATE TABLE posts (
  post_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  board_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (board_id)
    REFERENCES boards(board_id)
    ON DELETE CASCADE,
  FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_boards_owner_id ON boards(owner_id);
CREATE INDEX idx_board_columns_board_id ON board_columns(board_id);
CREATE INDEX idx_cards_column_id ON cards(column_id);
CREATE INDEX idx_posts_board_id ON posts(board_id);