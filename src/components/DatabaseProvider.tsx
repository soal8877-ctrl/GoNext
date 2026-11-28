import { Component, type ErrorInfo, type ReactNode, Suspense } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { SQLiteProvider } from 'expo-sqlite';

import { DatabaseErrorFallback } from '@/components/DatabaseErrorFallback';
import { DATABASE_NAME } from '@/db/constants';
import { migrateDatabase } from '@/db/migrate';

function DatabaseLoading() {
  const { t } = useTranslation();

  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={t('database.preparingA11y')}>
      <ActivityIndicator animating size="large" />
      <Text style={styles.loadingText}>{t('database.preparing')}</Text>
    </View>
  );
}

function isOpfsAccessHandleError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('createSyncAccessHandle') || message.includes('Access Handle');
}

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { error: Error | null };

class DatabaseErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error('[SQLite] init error:', error);
  }

  private handleAction = () => {
    if (Platform.OS === 'web' && typeof globalThis.location?.reload === 'function') {
      globalThis.location.reload();
      return;
    }
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      const showWebReloadHint = Platform.OS === 'web' && isOpfsAccessHandleError(error);
      return (
        <DatabaseErrorFallback
          error={error}
          showWebReloadHint={showWebReloadHint}
          onAction={this.handleAction}
        />
      );
    }
    return this.props.children;
  }
}

type DatabaseProviderProps = {
  children: ReactNode;
};

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const canUseSqlite = Platform.OS !== 'web' || typeof document !== 'undefined';

  if (!canUseSqlite) {
    return <DatabaseLoading />;
  }

  return (
    <DatabaseErrorBoundary>
      <Suspense fallback={<DatabaseLoading />}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase} useSuspense>
          {children}
        </SQLiteProvider>
      </Suspense>
    </DatabaseErrorBoundary>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
});