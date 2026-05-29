// saflash — Core database initialization and schema
import * as SQLite from 'expo-sqlite';

let db = null;

export async function openDatabase() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('saflash.db');
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call openDatabase() first.');
  }
  return db;
}

export async function initDatabase() {
  const database = await openDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  // ── Words table ───────────────────────────
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS words (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      english_word    TEXT    NOT NULL,
      spanish_trans   TEXT    NOT NULL,
      phonetic        TEXT,
      category        TEXT    NOT NULL,
      subcategory     TEXT,
      frequency_rank  INTEGER NOT NULL,
      difficulty      TEXT    DEFAULT 'A1',
      image_url       TEXT,
      audio_url       TEXT,
      example_en      TEXT,
      example_es      TEXT,
      is_seeded       INTEGER DEFAULT 1,
      created_at      TEXT    DEFAULT (datetime('now'))
    );
  `);

  // ── Phrases table ─────────────────────────
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS phrases (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      phrase_en       TEXT    NOT NULL,
      phrase_es       TEXT    NOT NULL,
      category        TEXT    NOT NULL,
      context         TEXT,
      difficulty      TEXT    DEFAULT 'A1',
      image_url       TEXT,
      audio_url       TEXT,
      is_seeded       INTEGER DEFAULT 1,
      created_at      TEXT    DEFAULT (datetime('now'))
    );
  `);

  // ── User progress table ───────────────────
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      card_type       TEXT    NOT NULL,
      card_id         INTEGER NOT NULL,
      status          TEXT    DEFAULT 'new',
      ease_factor     REAL    DEFAULT 2.5,
      interval_days   INTEGER DEFAULT 1,
      repetitions     INTEGER DEFAULT 0,
      next_review     TEXT,
      last_review     TEXT,
      correct_count   INTEGER DEFAULT 0,
      wrong_count     INTEGER DEFAULT 0,
      is_favorite     INTEGER DEFAULT 0,
      UNIQUE(card_type, card_id)
    );
  `);

  // ── Study sessions table ──────────────────
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      session_date    TEXT    NOT NULL,
      session_type    TEXT    NOT NULL,
      cards_studied   INTEGER DEFAULT 0,
      cards_correct   INTEGER DEFAULT 0,
      cards_medium    INTEGER DEFAULT 0,
      cards_hard      INTEGER DEFAULT 0,
      duration_secs   INTEGER DEFAULT 0,
      created_at      TEXT    DEFAULT (datetime('now'))
    );
  `);

  // ── User config table ─────────────────────
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS user_config (
      id              INTEGER PRIMARY KEY DEFAULT 1,
      first_launch    INTEGER DEFAULT 1,
      daily_goal      INTEGER DEFAULT 20,
      streak_days     INTEGER DEFAULT 0,
      last_study_date TEXT,
      total_studied   INTEGER DEFAULT 0,
      onboarding_done INTEGER DEFAULT 0,
      notifications   INTEGER DEFAULT 1,
      notif_hour      INTEGER DEFAULT 9
    );
  `);

  // ── Indexes ───────────────────────────────
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_words_category    ON words(category);
    CREATE INDEX IF NOT EXISTS idx_words_difficulty  ON words(difficulty);
    CREATE INDEX IF NOT EXISTS idx_words_frequency   ON words(frequency_rank);
    CREATE INDEX IF NOT EXISTS idx_phrases_category  ON phrases(category);
    CREATE INDEX IF NOT EXISTS idx_progress_review   ON user_progress(next_review);
    CREATE INDEX IF NOT EXISTS idx_progress_status   ON user_progress(status);
    CREATE INDEX IF NOT EXISTS idx_progress_card     ON user_progress(card_type, card_id);
  `);

  // Ensure user_config row exists
  const configRow = await database.getFirstAsync(
    'SELECT id FROM user_config WHERE id = 1'
  );
  if (!configRow) {
    await database.runAsync(
      'INSERT INTO user_config (id) VALUES (1)'
    );
  }

  return database;
}

export async function closeDatabase() {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
