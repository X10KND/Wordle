-- D1 schema for multiplayer Wordle
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS rooms (
  code TEXT PRIMARY KEY,
  creator_player_id TEXT,
  rounds_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'lobby', -- lobby | in_progress | finished
  created_at INTEGER NOT NULL,
  started_at INTEGER
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_creator INTEGER NOT NULL DEFAULT 0,
  joined_at INTEGER NOT NULL,
  total_guesses INTEGER NOT NULL DEFAULT 0,
  total_time_ms INTEGER NOT NULL DEFAULT 0,
  finished_at INTEGER,
  FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_code);

CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL,
  round_index INTEGER NOT NULL,
  word TEXT NOT NULL,
  UNIQUE(room_code, round_index),
  FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_rounds_room ON rounds(room_code);

CREATE TABLE IF NOT EXISTS guesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL,
  player_id TEXT NOT NULL,
  round_index INTEGER NOT NULL,
  guess TEXT NOT NULL,
  result TEXT NOT NULL, -- JSON array of marks
  created_at INTEGER NOT NULL,
  FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_guesses_room_player_round ON guesses(room_code, player_id, round_index, created_at);

