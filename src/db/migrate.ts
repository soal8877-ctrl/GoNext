import type { SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_VERSION } from './constants';

const SCHEMA_V1 = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  visit_later INTEGER NOT NULL DEFAULT 0 CHECK (visit_later IN (0, 1)),
  liked INTEGER NOT NULL DEFAULT 0 CHECK (liked IN (0, 1)),
  latitude REAL,
  longitude REAL,
  photos_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date TEXT,
  end_date TEXT,
  created_at TEXT NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 0 CHECK (is_current IN (0, 1))
);

CREATE TABLE IF NOT EXISTS trip_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL,
  place_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL,
  visited INTEGER NOT NULL DEFAULT 0 CHECK (visited IN (0, 1)),
  visit_date TEXT,
  notes TEXT NOT NULL DEFAULT '',
  photos_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE RESTRICT,
  UNIQUE (trip_id, place_id)
);

CREATE INDEX IF NOT EXISTS idx_trip_places_trip_id ON trip_places(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_places_sort ON trip_places(trip_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_trips_is_current ON trips(is_current);
`;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version >= DATABASE_VERSION) {
    await db.execAsync('PRAGMA foreign_keys = ON');
    return;
  }

  if (version === 0) {
    await db.execAsync(SCHEMA_V1);
    version = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  await db.execAsync('PRAGMA foreign_keys = ON');
}