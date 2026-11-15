import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { ScreenShell } from '@/components/ScreenShell';
import { screenStyles } from '@/constants/screen';

export default function TripsListScreen() {
  return (
    <ScreenShell title="Поездки" showBack>
      <View style={screenStyles.body}>
        <Text variant="bodyLarge">Список поездок появится на этапе 4. Пока здесь заглушка.</Text>
      </View>
    </ScreenShell>
  );
}