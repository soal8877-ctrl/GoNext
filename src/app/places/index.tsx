import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { ScreenShell } from '@/components/ScreenShell';
import { screenStyles } from '@/constants/screen';

export default function PlacesListScreen() {
  return (
    <ScreenShell title="Места" showBack>
      <View style={screenStyles.body}>
        <Text variant="bodyLarge">Список мест появится на этапе 3. Пока здесь заглушка.</Text>
      </View>
    </ScreenShell>
  );
}