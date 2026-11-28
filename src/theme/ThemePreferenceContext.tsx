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
import { PaperProvider } from 'react-native-paper';

import { buildPaperThemeById } from '@/theme/buildPaperTheme';
import {
  DEFAULT_PRIMARY_COLOR_ID,
  PRIMARY_COLOR_PRESETS,
} from '@/theme/primaryColorPresets';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY_MODE = '@gonext/themeMode';
const STORAGE_KEY_PRIMARY = '@gonext/primaryColorId';

function isPrimaryColorId(id: string): boolean {
  return PRIMARY_COLOR_PRESETS.some((preset) => preset.id === id);
}

type ThemePreferenceContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  primaryColorId: string;
  setPrimaryColorId: (id: string) => void;
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
  const [primaryColorId, setPrimaryColorIdState] = useState(DEFAULT_PRIMARY_COLOR_ID);

  useEffect(() => {
    void (async () => {
      try {
        const [storedMode, storedPrimary] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_MODE),
          AsyncStorage.getItem(STORAGE_KEY_PRIMARY),
        ]);
        if (storedMode === 'light' || storedMode === 'dark') {
          setModeState(storedMode);
        }
        if (storedPrimary && isPrimaryColorId(storedPrimary)) {
          setPrimaryColorIdState(storedPrimary);
        }
      } catch {
        // значения по умолчанию
      }
    })();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void AsyncStorage.setItem(STORAGE_KEY_MODE, next);
  }, []);

  const setPrimaryColorId = useCallback((id: string) => {
    if (!isPrimaryColorId(id)) {
      return;
    }
    setPrimaryColorIdState(id);
    void AsyncStorage.setItem(STORAGE_KEY_PRIMARY, id);
  }, []);

  const paperTheme = useMemo(
    () => buildPaperThemeById(mode, primaryColorId),
    [mode, primaryColorId]
  );
  const showBackgroundImage = mode === 'light';

  const contextValue = useMemo(
    () => ({ mode, setMode, primaryColorId, setPrimaryColorId, showBackgroundImage }),
    [mode, setMode, primaryColorId, setPrimaryColorId, showBackgroundImage]
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