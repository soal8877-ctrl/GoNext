import { SQLiteProvider } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/components/RootNavigator';
import { DATABASE_NAME } from '@/db/constants';
import { migrateDatabase } from '@/db/migrate';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onInit={migrateDatabase}
        onError={(error) => {
          console.error('[SQLite] Ошибка инициализации:', error);
          void SplashScreen.hideAsync();
        }}
      >
        <PaperProvider>
          <RootNavigator />
        </PaperProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
