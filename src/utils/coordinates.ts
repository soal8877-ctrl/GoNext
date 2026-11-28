import { translate } from '@/i18n';

export type CoordParseResult =
  | { ok: true; value: number | null }
  | { ok: false; message: string };

export function parseOptionalLatitude(input: string): CoordParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }
  const value = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(value)) {
    return { ok: false, message: translate('validation.latitudeNaN') };
  }
  if (value < -90 || value > 90) {
    return { ok: false, message: translate('validation.latitudeRange') };
  }
  return { ok: true, value };
}

export function parseOptionalLongitude(input: string): CoordParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }
  const value = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(value)) {
    return { ok: false, message: translate('validation.longitudeNaN') };
  }
  if (value < -180 || value > 180) {
    return { ok: false, message: translate('validation.longitudeRange') };
  }
  return { ok: true, value };
}

type CoordComponentParseResult = { ok: true; value: number } | { ok: false; message: string };

function parseCoordinateComponent(raw: string): CoordComponentParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: translate('validation.coordsNeedTwo') };
  }
  const normalized = trimmed.includes('.') ? trimmed : trimmed.replace(',', '.');
  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    return { ok: false, message: translate('validation.coordsNaN') };
  }
  return { ok: true, value };
}

export type CoordinatePairParseResult =
  | { ok: true; latitude: number | null; longitude: number | null }
  | { ok: false; message: string };

/** Парсит «широта, долгота» из одной строки (как в Google Maps: `55.744920, 37.604677`). */
export function parseOptionalCoordinatePair(input: string): CoordinatePairParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: true, latitude: null, longitude: null };
  }

  let parts: string[];
  if (trimmed.includes(',')) {
    parts = trimmed.split(',').map((p) => p.trim()).filter(Boolean);
  } else {
    parts = trimmed.split(/[\s;]+/).filter(Boolean);
  }

  if (parts.length !== 2) {
    return {
      ok: false,
      message: translate('validation.coordsPairExample'),
    };
  }

  const lat = parseCoordinateComponent(parts[0]);
  if (!lat.ok) {
    return { ok: false, message: lat.message };
  }
  if (lat.value < -90 || lat.value > 90) {
    return { ok: false, message: translate('validation.latitudeRange') };
  }

  const lon = parseCoordinateComponent(parts[1]);
  if (!lon.ok) {
    return { ok: false, message: lon.message };
  }
  if (lon.value < -180 || lon.value > 180) {
    return { ok: false, message: translate('validation.longitudeRange') };
  }

  return { ok: true, latitude: lat.value, longitude: lon.value };
}

export function formatCoordinatePairForInput(
  latitude: number | null,
  longitude: number | null
): string {
  if (!hasCoordinates(latitude, longitude)) {
    return '';
  }
  return `${latitude}, ${longitude}`;
}

export function hasCoordinates(
  latitude: number | null,
  longitude: number | null
): boolean {
  return latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude);
}

export function getCoordinates(
  latitude: number | null,
  longitude: number | null
): { latitude: number; longitude: number } | null {
  if (!hasCoordinates(latitude, longitude)) {
    return null;
  }
  return { latitude: latitude as number, longitude: longitude as number };
}