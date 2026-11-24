import type { SQLiteDatabase } from 'expo-sqlite';

import { boolToSql, stringifyStringArray } from '@/db/json';
import { mapTripPlaceRow, type TripPlaceRow } from '@/db/rows';
import type { CreateTripPlaceInput, TripPlace, UpdateTripPlaceInput } from '@/types/entities';

export type TripPlaceWithPlace = TripPlace & {
  placeName: string;
};

type TripPlaceJoinRow = TripPlaceRow & { place_name: string };

async function getNextSortOrder(db: SQLiteDatabase, tripId: number): Promise<number> {
  const row = await db.getFirstAsync<{ max_order: number | null }>(
    'SELECT MAX(sort_order) AS max_order FROM trip_places WHERE trip_id = ?',
    tripId
  );
  const max = row?.max_order ?? 0;
  return max + 1;
}

export async function listTripPlaces(db: SQLiteDatabase, tripId: number): Promise<TripPlace[]> {
  const rows = await db.getAllAsync<TripPlaceRow>(
    'SELECT * FROM trip_places WHERE trip_id = ? ORDER BY sort_order ASC, id ASC',
    tripId
  );
  return rows.map(mapTripPlaceRow);
}

export async function listTripPlacesWithPlaces(
  db: SQLiteDatabase,
  tripId: number
): Promise<TripPlaceWithPlace[]> {
  const rows = await db.getAllAsync<TripPlaceJoinRow>(
    `SELECT tp.*, p.name AS place_name
     FROM trip_places tp
     INNER JOIN places p ON p.id = tp.place_id
     WHERE tp.trip_id = ?
     ORDER BY tp.sort_order ASC, tp.id ASC`,
    tripId
  );
  return rows.map((row) => ({
    ...mapTripPlaceRow(row),
    placeName: row.place_name,
  }));
}

export async function getTripPlaceById(
  db: SQLiteDatabase,
  id: number
): Promise<TripPlace | null> {
  const row = await db.getFirstAsync<TripPlaceRow>('SELECT * FROM trip_places WHERE id = ?', id);
  return row ? mapTripPlaceRow(row) : null;
}

export async function addPlaceToTrip(
  db: SQLiteDatabase,
  input: CreateTripPlaceInput
): Promise<TripPlace> {
  const sortOrder = input.order ?? (await getNextSortOrder(db, input.tripId));
  const photos = input.photos ?? [];

  const result = await db.runAsync(
    `INSERT INTO trip_places (
      trip_id, place_id, sort_order, visited, visit_date, notes, photos_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    input.tripId,
    input.placeId,
    sortOrder,
    boolToSql(input.visited ?? false),
    input.visitDate ?? null,
    input.notes ?? '',
    stringifyStringArray(photos)
  );

  const tripPlace = await getTripPlaceById(db, result.lastInsertRowId);
  if (!tripPlace) {
    throw new Error('Не удалось прочитать пункт маршрута.');
  }
  return tripPlace;
}

export async function updateTripPlace(
  db: SQLiteDatabase,
  id: number,
  input: UpdateTripPlaceInput
): Promise<TripPlace | null> {
  const existing = await getTripPlaceById(db, id);
  if (!existing) {
    return null;
  }

  const next = {
    order: input.order ?? existing.order,
    visited: input.visited ?? existing.visited,
    visitDate: input.visitDate !== undefined ? input.visitDate : existing.visitDate,
    notes: input.notes ?? existing.notes,
    photos: input.photos ?? existing.photos,
  };

  await db.runAsync(
    `UPDATE trip_places SET
      sort_order = ?,
      visited = ?,
      visit_date = ?,
      notes = ?,
      photos_json = ?
    WHERE id = ?`,
    next.order,
    boolToSql(next.visited),
    next.visitDate,
    next.notes,
    stringifyStringArray(next.photos),
    id
  );

  return getTripPlaceById(db, id);
}

export async function removePlaceFromTrip(db: SQLiteDatabase, id: number): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM trip_places WHERE id = ?', id);
  return result.changes > 0;
}

/** Сдвиг порядка: меняет местами sort_order с соседним пунктом. */
export async function moveTripPlace(
  db: SQLiteDatabase,
  tripPlaceId: number,
  direction: 'up' | 'down'
): Promise<void> {
  const current = await getTripPlaceById(db, tripPlaceId);
  if (!current) {
    return;
  }

  const siblings = await listTripPlaces(db, current.tripId);
  const index = siblings.findIndex((item) => item.id === tripPlaceId);
  if (index < 0) {
    return;
  }

  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) {
    return;
  }

  const other = siblings[swapIndex];

  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE trip_places SET sort_order = ? WHERE id = ?', other.order, current.id);
    await db.runAsync('UPDATE trip_places SET sort_order = ? WHERE id = ?', current.order, other.id);
  });
}