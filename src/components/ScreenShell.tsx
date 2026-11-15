import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

type ScreenShellProps = {
  title: string;
  showBack?: boolean;
  children: ReactNode;
};

export function ScreenShell({ title, showBack = false, children }: ScreenShellProps) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        {showBack ? <Appbar.BackAction onPress={() => router.back()} /> : null}
        <Appbar.Content title={title} />
      </Appbar.Header>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});