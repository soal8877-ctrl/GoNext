import { Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

type DatabaseErrorFallbackProps = {
  error: Error;
  onAction: () => void;
  showWebReloadHint: boolean;
};

export function DatabaseErrorFallback({
  error,
  onAction,
  showWebReloadHint,
}: DatabaseErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.center}>
      <Text style={styles.message}>{t('database.openFailed')}</Text>
      <Text style={styles.hint}>
        {showWebReloadHint ? t('database.webRefreshHint') : error.message}
      </Text>
      <Button mode="filled" onPress={onAction} style={styles.action}>
        {Platform.OS === 'web' ? t('database.reloadPage') : t('database.retry')}
      </Button>
    </View>
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