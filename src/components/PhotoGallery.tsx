import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text } from 'react-native-paper';

import { pickImageFromLibrary, takePhotoWithCamera } from '@/photos/picker';
import { deletePhotoFileAsync, resolvePhotoUri, savePickedImageAsync, type PhotoCategory } from '@/photos/storage';

type PhotoGalleryProps = {
  title?: string;
  photos: string[];
  category: PhotoCategory;
  ownerId: number;
  onPhotosChange: (photos: string[]) => Promise<void>;
  onNotify: (message: string) => void;
};

export function PhotoGallery({
  title = 'Фотографии',
  photos,
  category,
  ownerId,
  onPhotosChange,
  onNotify,
}: PhotoGalleryProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const addFromSource = async (source: 'library' | 'camera') => {
    setPickerOpen(false);
    setBusy(true);
  await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      const picked =
        source === 'library' ? await pickImageFromLibrary() : await takePhotoWithCamera();
      if ('error' in picked) {
        onNotify(picked.error);
        return;
      }
      if ('cancelled' in picked) {
        return;
      }
      const relative = await savePickedImageAsync(picked.uri, category, ownerId);
      await onPhotosChange([...photos, relative]);
    } catch (e) {
      onNotify(e instanceof Error ? e.message : 'Не удалось сохранить фото.');
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async (relativePath: string) => {
    setBusy(true);
    try {
      await deletePhotoFileAsync(relativePath);
      await onPhotosChange(photos.filter((p) => p !== relativePath));
    } catch {
      onNotify('Не удалось удалить фото.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text variant="titleSmall">{title}</Text>
      {photos.length === 0 ? (
        <Text variant="bodyMedium" style={styles.hint}>
          Пока нет фото
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
          {photos.map((relative) => (
            <View key={relative} style={styles.thumbWrap}>
              <Image source={{ uri: resolvePhotoUri(relative) }} style={styles.thumb} />
              <IconButton
                icon="close"
                size={18}
                style={styles.remove}
                disabled={busy}
                onPress={() => void removePhoto(relative)}
              />
            </View>
          ))}
        </ScrollView>
      )}
      <Button mode="outlined" icon="image-plus" disabled={busy} onPress={() => setPickerOpen(true)}>
        Добавить фото
      </Button>

      <Portal>
        <Dialog visible={pickerOpen} onDismiss={() => setPickerOpen(false)}>
          <Dialog.Title>Добавить фото</Dialog.Title>
          <Dialog.Content>
            <View style={styles.pickerActions}>
              <Button mode="tonal" onPress={() => void addFromSource('library')}>
                Из галереи
              </Button>
              <Button mode="tonal" onPress={() => void addFromSource('camera')}>
                Сделать снимок
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPickerOpen(false)}>Отмена</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  hint: {
    opacity: 0.8,
  },
  strip: {
    gap: 8,
    paddingVertical: 4,
  },
  thumbWrap: {
    position: 'relative',
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
  },
  remove: {
    position: 'absolute',
    top: -4,
    right: -8,
    margin: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  pickerActions: {
    gap: 10,
    paddingTop: 4,
  },
});