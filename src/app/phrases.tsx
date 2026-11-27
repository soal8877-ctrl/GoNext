import { FlatList, StyleSheet, View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';

import { ScreenShell } from '@/components/ScreenShell';
import { TRAVEL_PHRASES } from '@/constants/travelPhrases';
import { screenPadding } from '@/constants/screen';

/** Экран «Выражения» (PROJECT.md §4.4): фиксированный список, без БД и сети. */
export default function PhrasesScreen() {
  return (
    <ScreenShell title="Выражения" showBack>
      <View style={styles.listWrap}>
        <Text variant="bodyMedium" style={styles.hint}>
          Десять частых фраз для поездки. Работает без интернета.
        </Text>
        <FlatList
          data={TRAVEL_PHRASES}
          keyExtractor={(_, index) => String(index)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Divider}
          renderItem={({ item, index }) => (
            <List.Item
              title={item.en}
              description={item.ru}
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