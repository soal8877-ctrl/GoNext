import { Component, type ErrorInfo, type ReactNode, Suspense } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SQLiteProvider } from 'expo-sqlite';

import { DATABASE_NAME } from '@/db/constants';
import { migrateDatabase } from '@/db/migrate';

function DatabaseLoading() {
  return (
    <View style={styles.center}>
      <Text style={styles.loadingText}>Подготовка базы данных…</Text>
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
    console.error('[SQLite] Ошибка инициализации:', error);
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
        <View style={styles.center}>
          <Text style={styles.message}>Не удалось открыть базу данных</Text>
          <Text style={styles.hint}>
            {showWebReloadHint
              ? 'На web так бывает после быстрого обновления кода (Fast Refresh). Обновите страницу полностью — F5.'
              : error.message}
          </Text>
          <Button mode="filled" onPress={this.handleAction} style={styles.action}>
            {Platform.OS === 'web' ? 'Обновить страницу' : 'Повторить'}
          </Button>
        </View>
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
  message: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    opacity: 0.85,
    fontSize: 14,
  },
  action: {
    marginTop: 8,
  },
});