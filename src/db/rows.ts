import { boolFromSql, parseStringArrayJson } from './json';
import type { Place, Trip, TripPlace } from '@/types/entities';

export type PlaceRow = {
  id: number;
  name: string;
  description: string;
  visit_later: number;
  liked: number;
  latitude: number | null;
  longitude: number | null;
  photos_json: string;
  created_at: string;
};

export type TripRow = {
  id: number;
  title: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  is_current: number;
};

export type TripPlaceRow = {
  id: number;
  trip_id: number;
  place_id: number;
  sort_order: number;
  visited: number;
  visit_date: string | null;
  notes: string;
  photos_json: string;
};

export function mapPlaceRow(row: PlaceRow): Place {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    visitLater: boolFromSql(row.visit_later),
    liked: boolFromSql(row.liked),
    latitude: row.latitude,
    longitude: row.longitude,
    photos: parseStringArrayJson(row.photos_json),
    createdAt: row.created_at,
  };
}

export function mapTripRow(row: TripRow): Trip {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    current: boolFromSql(row.is_current),
  };
}

export function mapTripPlaceRow(row: TripPlaceRow): TripPlace {
  return {
    id: row.id,
    tripId: row.trip_id,
    placeId: row.place_id,
    order: row.sort_order,
    visited: boolFromSql(row.visited),
    visitDate: row.visit_date,
    notes: row.notes,
    photos: parseStringArrayJson(row.photos_json),
  };
}