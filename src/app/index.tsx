import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Snackbar, Text, useTheme } from 'react-native-paper';

export default function Home() {
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="headlineSmall">Привет, Алексей!</Text>
        <Button mode="filled" onPress={() => setSnackbarVisible(true)}>
          Нажми меня
        </Button>
      </View>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)}>
        Кнопка нажата
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
});
