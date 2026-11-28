import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { translate } from '@/i18n';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.85,
  allowsEditing: false,
};

export type PickPermissionResult =
  | { ok: true }
  | { ok: false; message: string };

async function ensureLibraryPermission(): Promise<PickPermissionResult> {
  if (Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 33) {
    return { ok: true };
  }

  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted || current.accessPrivileges === 'limited') {
    return { ok: true };
  }
  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (requested.granted || requested.accessPrivileges === 'limited') {
    return { ok: true };
  }
  return {
    ok: false,
    message: translate('picker.galleryDenied'),
  };
}

async function ensureCameraPermission(): Promise<PickPermissionResult> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) {
    return { ok: true };
  }
  const requested = await ImagePicker.requestCameraPermissionsAsync();
  if (requested.granted) {
    return { ok: true };
  }
  return {
    ok: false,
    message: translate('picker.cameraDenied'),
  };
}

export async function pickImageFromLibrary(): Promise<
  { uri: string } | { cancelled: true } | { error: string }
> {
  if (Platform.OS === 'web') {
    return { error: translate('picker.webLibrary') };
  }
  const permission = await ensureLibraryPermission();
  if (!permission.ok) {
    return { error: permission.message };
  }
  const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled || result.assets.length === 0) {
    return { cancelled: true };
  }
  return { uri: result.assets[0].uri };
}

export async function takePhotoWithCamera(): Promise<
  { uri: string } | { cancelled: true } | { error: string }
> {
  if (Platform.OS === 'web') {
    return { error: translate('picker.webCamera') };
  }
  const permission = await ensureCameraPermission();
  if (!permission.ok) {
    return { error: permission.message };
  }
  const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
  if (result.canceled || result.assets.length === 0) {
    return { cancelled: true };
  }
  return { uri: result.assets[0].uri };
}