import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseProvider } from '@/components/DatabaseProvider';
import { RootNavigator } from '@/components/RootNavigator';
import { AppThemeProvider } from '@/theme/ThemePreferenceContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <DatabaseProvider>
          <RootNavigator />
        </DatabaseProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}
