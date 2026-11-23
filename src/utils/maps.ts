import { Linking, Platform } from 'react-native';

function googleMapsWebUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export async function openPlaceOnMap(
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  const title = encodeURIComponent(label ?? 'Место');
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