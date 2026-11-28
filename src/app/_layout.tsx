import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseProvider } from '@/components/DatabaseProvider';
import { RootNavigator } from '@/components/RootNavigator';
import { I18nBootstrap } from '@/i18n/I18nBootstrap';
import { AppThemeProvider } from '@/theme/ThemePreferenceContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <I18nBootstrap>
        <AppThemeProvider>
          <DatabaseProvider>
            <RootNavigator />
          </DatabaseProvider>
        </AppThemeProvider>
      </I18nBootstrap>
    </SafeAreaProvider>
  );
}