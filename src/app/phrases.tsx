import { FlatList, StyleSheet, View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { ScreenShell } from '@/components/ScreenShell';
import { TRAVEL_PHRASES } from '@/constants/travelPhrases';
import { screenPadding } from '@/constants/screen';

export default function PhrasesScreen() {
  const { t, i18n } = useTranslation();
  const uiEn = i18n.language === 'en';

  return (
    <ScreenShell title={t('phrases.title')} showBack>
      <View style={styles.listWrap}>
        <Text variant="bodyMedium" style={styles.hint}>
          {t('phrases.hint')}
        </Text>
        <FlatList
          data={TRAVEL_PHRASES}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Divider}
          renderItem={({ item, index }) => (
            <List.Item
              title={uiEn ? item.en : item.ru}
              description={uiEn ? item.ru : item.en}
              titleNumberOfLines={2}
              descriptionNumberOfLines={2}
              left={() => (
                <View style={styles.indexBadge}>
                  <Text variant="labelMedium">{index + 1}</Text>
                </View>
              )}
            />
          )}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
    paddingHorizontal: screenPadding,
  },
  listContent: {
    paddingBottom: 24,
  },
  hint: {
    marginVertical: 8,
    opacity: 0.8,
  },
  indexBadge: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});