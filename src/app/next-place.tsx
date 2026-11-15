import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { ScreenShell } from '@/components/ScreenShell';
import { screenStyles } from '@/constants/screen';

export default function NextPlaceScreen() {
  return (
    <ScreenShell title="Следующее место" showBack>
      <View style={screenStyles.body}>
        <Text variant="bodyLarge">
          Следующая точка маршрута появится на этапе 5. Нужны SQLite и текущая поездка.
        </Text>
      </View>
    </ScreenShell>
  );
}