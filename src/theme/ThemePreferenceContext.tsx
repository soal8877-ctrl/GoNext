import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DarkTheme, LightTheme, PaperProvider } from 'react-native-paper';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = '@gonext/themeMode';

type ThemePreferenceContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Декоративный фон включается только в светлой теме. */
  showBackgroundImage: boolean;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

export function useThemePreference(): ThemePreferenceContextValue {
  const value = useContext(ThemePreferenceContext);
  if (!value) {
    throw new Error('useThemePreference: оберните приложение в AppThemeProvider');
  }
  return value;
}

type AppThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setModeState(stored);
        }
      } catch {
        // оставляем светлую тему по умолчанию
      }
    })();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const paperTheme = mode === 'dark' ? DarkTheme : LightTheme;
  const showBackgroundImage = mode === 'light';

  const contextValue = useMemo(
    () => ({ mode, setMode, showBackgroundImage }),
    [mode, setMode, showBackgroundImage]
  );

  return (
    <ThemePreferenceContext.Provider value={contextValue}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        {children}
      </PaperProvider>
    </ThemePreferenceContext.Provider>
  );
}