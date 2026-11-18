CREATE TABLE notifications (
  notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(user_id),
  board_id INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('board_member', 'card_assigned')),
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TEXT
);
CREATE INDEX idx_notifications_user ON notifications(user_id, notification_id DESC);
CREATE TABLE push_devices (
  token TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(user_id),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_push_devices_user ON push_devices(user_id);
