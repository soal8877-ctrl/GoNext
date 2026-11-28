import { Linking, Platform } from 'react-native';

import { translate } from '@/i18n';

function googleMapsWebUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export async function openPlaceOnMap(
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  const title = encodeURIComponent(label ?? translate('common.placeFallback'));
  const webUrl = googleMapsWebUrl(latitude, longitude);

  if (Platform.OS === 'web') {
    await Linking.openURL(webUrl);
    return;
  }

  const primary =
    Platform.OS === 'ios'
      ? `maps://?ll=${latitude},${longitude}&q=${title}`
      : `geo:${latitude},${longitude}?q=${latitude},${longitude}(${title})`;

  try {
    const canOpen = await Linking.canOpenURL(primary);
    if (canOpen) {
      await Linking.openURL(primary);
      return;
    }
  } catch {
    // canOpenURL ненадёжен на части Android-сборок — пробуем geo, затем https
  }

  try {
    await Linking.openURL(primary);
  } catch {
    await Linking.openURL(webUrl);
  }
}

function googleMapsDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
}

/** Построение маршрута в навигаторе (Google Maps / системные карты). */
export async function openPlaceInNavigator(
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  const webUrl = googleMapsDirectionsUrl(latitude, longitude);
  const title = encodeURIComponent(label ?? translate('common.placeFallback'));

  if (Platform.OS === 'web') {
    await Linking.openURL(webUrl);
    return;
  }

  const primary =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${title}`
      : `google.navigation:q=${latitude},${longitude}`;

  try {
    const canOpen = await Linking.canOpenURL(primary);
    if (canOpen) {
      await Linking.openURL(primary);
      return;
    }
  } catch {
    // пробуем запасной URL
  }

  try {
    await Linking.openURL(primary);
  } catch {
    await Linking.openURL(webUrl);
  }
}