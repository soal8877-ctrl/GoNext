import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Constants from 'expo-constants';

import { ScreenShell } from '@/components/ScreenShell';
import { screenStyles } from '@/constants/screen';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenShell title="Настройки" showBack>
      <View style={screenStyles.body}>
        <Text variant="bodyLarge">
          GoNext — дневник туриста.{'\n\n'}
          Все данные хранятся только на этом устройстве. Интернет для основной работы не
          требуется.{'\n\n'}
          Версия: {version}
        </Text>
      </View>
    </ScreenShell>
  );
}