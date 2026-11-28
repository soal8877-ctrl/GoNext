import type { SQLiteDatabase } from 'expo-sqlite';

import { translate } from '@/i18n';

import { boolToSql } from '@/db/json';
import { mapTripRow, type TripRow } from '@/db/rows';
import type { CreateTripInput, Trip, UpdateTripInput } from '@/types/entities';

export async function listTrips(db: SQLiteDatabase): Promise<Trip[]> {
  const rows = await db.getAllAsync<TripRow>(
    'SELECT * FROM trips ORDER BY is_current DESC, start_date DESC, created_at DESC, id DESC'
  );
  return rows.map(mapTripRow);
}

export async function getTripById(db: SQLiteDatabase, id: number): Promise<Trip | null> {
  const row = await db.getFirstAsync<TripRow>('SELECT * FROM trips WHERE id = ?', id);
  return row ? mapTripRow(row) : null;
}

export async function getCurrentTrip(db: SQLiteDatabase): Promise<Trip | null> {
  const row = await db.getFirstAsync<TripRow>(
    'SELECT * FROM trips WHERE is_current = 1 ORDER BY id DESC LIMIT 1'
  );
  return row ? mapTripRow(row) : null;
}

export async function createTrip(db: SQLiteDatabase, input: CreateTripInput): Promise<Trip> {
  const createdAt = new Date().toISOString();
  const wantsCurrent = input.current ?? false;

  let tripId = 0;

  await db.withTransactionAsync(async () => {
    if (wantsCurrent) {
      await db.runAsync('UPDATE trips SET is_current = 0');
    }

    const result = await db.runAsync(
      `INSERT INTO trips (title, description, start_date, end_date, created_at, is_current)
       VALUES (?, ?, ?, ?, ?, ?)`,
      input.title,
      input.description ?? '',
      input.startDate ?? null,
      input.endDate ?? null,
      createdAt,
      boolToSql(wantsCurrent)
    );
    tripId = result.lastInsertRowId;
  });

  const trip = await getTripById(db, tripId);
  if (!trip) {
    throw new Error(translate('errors.tripReadFailed'));
  }
  return trip;
}

export async function updateTrip(
  db: SQLiteDatabase,
  id: number,
  input: UpdateTripInput
): Promise<Trip | null> {
  const existing = await getTripById(db, id);
  if (!existing) {
    return null;
  }

  const nextCurrent =
    input.current !== undefined ? input.current : existing.current;

  await db.withTransactionAsync(async () => {
    if (nextCurrent) {
      await db.runAsync('UPDATE trips SET is_current = 0');
    }

    await db.runAsync(
      `UPDATE trips SET
        title = ?,
        description = ?,
        start_date = ?,
        end_date = ?,
        is_current = ?
      WHERE id = ?`,
      input.title ?? existing.title,
      input.description ?? existing.description,
      input.startDate !== undefined ? input.startDate : existing.startDate,
      input.endDate !== undefined ? input.endDate : existing.endDate,
      boolToSql(nextCurrent),
      id
    );
  });

  return getTripById(db, id);
}

export async function setTripCurrent(
  db: SQLiteDatabase,
  tripId: number,
  current: boolean
): Promise<Trip | null> {
  const existing = await getTripById(db, tripId);
  if (!existing) {
    return null;
  }

  await db.withTransactionAsync(async () => {
    if (current) {
      await db.runAsync('UPDATE trips SET is_current = 0');
      await db.runAsync('UPDATE trips SET is_current = 1 WHERE id = ?', tripId);
    } else {
      await db.runAsync('UPDATE trips SET is_current = 0 WHERE id = ?', tripId);
    }
  });

  return getTripById(db, tripId);
}

export async function deleteTrip(db: SQLiteDatabase, id: number): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM trips WHERE id = ?', id);
  return result.changes > 0;
}