import type { SQLiteDatabase } from 'expo-sqlite';

import { translate } from '@/i18n';

import { boolToSql, stringifyStringArray } from '@/db/json';
import { mapPlaceRow, type PlaceRow } from '@/db/rows';
import type { CreatePlaceInput, Place, UpdatePlaceInput } from '@/types/entities';

export async function listPlaces(db: SQLiteDatabase): Promise<Place[]> {
  const rows = await db.getAllAsync<PlaceRow>(
    'SELECT * FROM places ORDER BY created_at DESC, id DESC'
  );
  return rows.map(mapPlaceRow);
}

export async function getPlaceById(db: SQLiteDatabase, id: number): Promise<Place | null> {
  const row = await db.getFirstAsync<PlaceRow>('SELECT * FROM places WHERE id = ?', id);
  return row ? mapPlaceRow(row) : null;
}

export async function createPlace(db: SQLiteDatabase, input: CreatePlaceInput): Promise<Place> {
  const createdAt = new Date().toISOString();
  const photos = input.photos ?? [];

  const result = await db.runAsync(
    `INSERT INTO places (
      name, description, visit_later, liked, latitude, longitude, photos_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    input.name,
    input.description ?? '',
    boolToSql(input.visitLater ?? false),
    boolToSql(input.liked ?? false),
    input.latitude ?? null,
    input.longitude ?? null,
    stringifyStringArray(photos),
    createdAt
  );

  const place = await getPlaceById(db, result.lastInsertRowId);
  if (!place) {
    throw new Error(translate('errors.placeReadFailed'));
  }
  return place;
}

export async function updatePlace(
  db: SQLiteDatabase,
  id: number,
  input: UpdatePlaceInput
): Promise<Place | null> {
  const existing = await getPlaceById(db, id);
  if (!existing) {
    return null;
  }

  const next = {
    name: input.name ?? existing.name,
    description: input.description ?? existing.description,
    visitLater: input.visitLater ?? existing.visitLater,
    liked: input.liked ?? existing.liked,
    latitude: input.latitude !== undefined ? input.latitude : existing.latitude,
    longitude: input.longitude !== undefined ? input.longitude : existing.longitude,
    photos: input.photos ?? existing.photos,
  };

  await db.runAsync(
    `UPDATE places SET
      name = ?,
      description = ?,
      visit_later = ?,
      liked = ?,
      latitude = ?,
      longitude = ?,
      photos_json = ?
    WHERE id = ?`,
    next.name,
    next.description,
    boolToSql(next.visitLater),
    boolToSql(next.liked),
    next.latitude,
    next.longitude,
    stringifyStringArray(next.photos),
    id
  );

  return getPlaceById(db, id);
}

export async function deletePlace(db: SQLiteDatabase, id: number): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM places WHERE id = ?', id);
  return result.changes > 0;
}