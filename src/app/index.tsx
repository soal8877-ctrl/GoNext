import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { type Href, router } from 'expo-router';

import { ScreenShell } from '@/components/ScreenShell';
import { screenStyles } from '@/constants/screen';

const MENU_ITEMS = [
  { label: 'Места', href: '/places' as const },
  { label: 'Поездки', href: '/trips' as const },
  { label: 'Следующее место', href: '/next-place' as const },
  { label: 'Выражения', href: '/phrases' as const },
  { label: 'Настройки', href: '/settings' as const },
] as const;

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ScreenShell title="GoNext">
      <View style={screenStyles.body}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Дневник туриста
        </Text>
        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <Button
              key={item.href}
              mode="tonal"
              onPress={() => router.push(item.href as Href)}
              contentStyle={styles.menuButtonContent}
            >
              {item.label}
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