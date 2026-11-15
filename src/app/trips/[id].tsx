import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';

import { ScreenShell } from '@/components/ScreenShell';
import { screenStyles } from '@/constants/screen';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenShell title="Поездка" showBack>
      <View style={screenStyles.body}>
        <Text variant="bodyLarge">
          Маршрут поездки «{id ?? '—'}» — заглушка до этапа 4.
        </Text>
      </View>
    </ScreenShell>
  );
}