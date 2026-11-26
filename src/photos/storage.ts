import * as LegacyFS from 'expo-file-system/legacy';

export const PHOTOS_ROOT = 'gonext-photos';

export type PhotoCategory = 'places' | 'trip-visits';

function requireDocumentDirectory(): string {
  const base = LegacyFS.documentDirectory;
  if (!base) {
    throw new Error('Локальное хранилище недоступно.');
  }
  return base;
}

export function buildRelativePhotoPath(
  category: PhotoCategory,
  ownerId: number,
  fileName: string
): string {
  return `${category}/${ownerId}/${fileName}`;
}

export function resolvePhotoUri(relativePath: string): string {
  if (relativePath.startsWith('file://') || relativePath.startsWith('http')) {
    return relativePath;
  }
  return `${requireDocumentDirectory()}${PHOTOS_ROOT}/${relativePath}`;
}

export async function savePickedImageAsync(
  sourceUri: string,
  category: PhotoCategory,
  ownerId: number
): Promise<string> {
  const extension = guessExtension(sourceUri);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const relative = buildRelativePhotoPath(category, ownerId, fileName);
  const directoryUri = `${requireDocumentDirectory()}${PHOTOS_ROOT}/${category}/${ownerId}/`;
  const destinationUri = `${directoryUri}${fileName}`;

  await LegacyFS.makeDirectoryAsync(directoryUri, { intermediates: true });
  await copyUriToDestination(sourceUri, destinationUri);

  const info = await LegacyFS.getInfoAsync(destinationUri);
  if (!info.exists || (info.size != null && info.size <= 0)) {
    throw new Error('Файл фото не сохранился. Попробуйте другое изображение.');
  }

  return relative;
}

async function copyUriToDestination(sourceUri: string, destinationUri: string): Promise<void> {
  try {
    await LegacyFS.copyAsync({ from: sourceUri, to: destinationUri });
    return;
  } catch {
    // content:// на Android часто не копируется copyAsync — читаем как base64
  }

  try {
    const base64 = await LegacyFS.readAsStringAsync(sourceUri, {
      encoding: LegacyFS.EncodingType.Base64,
    });
    await LegacyFS.writeAsStringAsync(destinationUri, base64, {
      encoding: LegacyFS.EncodingType.Base64,
    });
  } catch (e) {
    throw new Error(
      e instanceof Error ? e.message : 'Не удалось скопировать выбранное фото в память приложения.'
    );
  }
}

export async function deletePhotoFileAsync(relativePath: string): Promise<void> {
  const uri = resolvePhotoUri(relativePath);
  await LegacyFS.deleteAsync(uri, { idempotent: true });
}

function guessExtension(uri: string): string {
  const match = /\.(\w+)(?:\?|$)/.exec(uri);
  const ext = match?.[1]?.toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp' || ext === 'heic') {
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  return 'jpg';
}