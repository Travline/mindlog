CREATE TABLE board_invites (board_id INTEGER PRIMARY KEY NOT NULL REFERENCES boards(board_id), code TEXT NOT NULL UNIQUE);
CREATE TABLE join_requests (
  request_id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL REFERENCES boards(board_id),
  user_id TEXT NOT NULL REFERENCES users(user_id),
  status TEXT NOT NULL CHECK(status IN ('pending','accepted','rejected')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT
);
CREATE UNIQUE INDEX idx_one_pending_request ON join_requests(board_id,user_id) WHERE status='pending';
CREATE INDEX idx_join_requests_board ON join_requests(board_id,status);
CREATE TABLE notifications_new (
  notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(user_id), board_id INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('board_member','card_assigned','join_requested','join_accepted','join_rejected')),
  message TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, read_at TEXT
);
INSERT INTO notifications_new SELECT notification_id,user_id,board_id,kind,message,created_at,read_at FROM notifications;
DROP TABLE notifications;
ALTER TABLE notifications_new RENAME TO notifications;
CREATE INDEX idx_notifications_user ON notifications(user_id, notification_id DESC);
