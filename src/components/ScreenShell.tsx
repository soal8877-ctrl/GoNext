import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

import { SCREEN_BACKGROUND_IMAGE } from '@/constants/background';
import { useThemePreference } from '@/theme/ThemePreferenceContext';

type ScreenShellProps = {
  title: string;
  showBack?: boolean;
  children: ReactNode;
};

export function ScreenShell({ title, showBack = false, children }: ScreenShellProps) {
  const theme = useTheme();
  const { showBackgroundImage } = useThemePreference();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: showBackgroundImage ? 'transparent' : theme.colors.background },
      ]}
    >
      {showBackgroundImage ? (
        <>
          <Image
            source={SCREEN_BACKGROUND_IMAGE}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          <View
            style={[StyleSheet.absoluteFill, styles.lightOverlay]}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </>
      ) : null}
      <View style={styles.foreground}>
        <Appbar.Header elevated>
          {showBack ? <Appbar.BackAction onPress={() => router.back()} /> : null}
          <Appbar.Content title={title} />
        </Appbar.Header>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  lightOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  foreground: {
    flex: 1,
  },
});