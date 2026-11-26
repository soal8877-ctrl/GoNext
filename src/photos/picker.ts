import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.85,
  allowsEditing: false,
};

export type PickPermissionResult =
  | { ok: true }
  | { ok: false; message: string };

async function ensureLibraryPermission(): Promise<PickPermissionResult> {
  // Android 13+ (API 33): системный Photo Picker работает без READ_MEDIA_IMAGES.
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
    message: 'Нет доступа к галерее. Разрешите доступ для Expo Go в настройках телефона.',
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
    message: 'Нет доступа к камере. Разрешите доступ для Expo Go в настройках телефона.',
  };
}

export async function pickImageFromLibrary(): Promise<
  { uri: string } | { cancelled: true } | { error: string }
> {
  if (Platform.OS === 'web') {
    return { error: 'Добавление фото на web не поддерживается. Используйте Expo Go на телефоне.' };
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
    return { error: 'Съёмка на web не поддерживается. Используйте Expo Go на телефоне.' };
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