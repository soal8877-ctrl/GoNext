import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

import { ScreenShell } from '@/components/ScreenShell';
import { screenStyles } from '@/constants/screen';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenShell title="Место" showBack>
      <View style={screenStyles.body}>
        <Text variant="bodyLarge">
          Карточка места «{id ?? '—'}» — заглушка до этапа 3.
        </Text>
      </View>
    </ScreenShell>
  );
}