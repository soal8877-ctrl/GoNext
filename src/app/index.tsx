import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { type Href, router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenShell } from '@/components/ScreenShell';
import { screenStyles } from '@/constants/screen';

const MENU_ITEMS = [
  { labelKey: 'menu.places', href: '/places' as const },
  { labelKey: 'menu.trips', href: '/trips' as const },
  { labelKey: 'menu.nextPlace', href: '/next-place' as const },
  { labelKey: 'menu.phrases', href: '/phrases' as const },
  { labelKey: 'menu.settings', href: '/settings' as const },
] as const;

export default function HomeScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <ScreenShell title="GoNext">
      <View style={screenStyles.body}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('home.tagline')}
        </Text>
        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <Button
              key={item.href}
              mode="tonal"
              onPress={() => router.push(item.href as Href)}
              contentStyle={styles.menuButtonContent}
            >
              {t(item.labelKey)}
            </Button>
          ))}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  menu: {
    marginTop: 8,
    gap: 10,
  },
  menuButtonContent: {
    paddingVertical: 6,
  },
});