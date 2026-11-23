import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseProvider } from '@/components/DatabaseProvider';
import { RootNavigator } from '@/components/RootNavigator';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <DatabaseProvider>
          <RootNavigator />
        </DatabaseProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
