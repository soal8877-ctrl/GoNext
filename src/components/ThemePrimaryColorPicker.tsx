import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';

import { screenPadding } from '@/constants/screen';
import { PRIMARY_COLOR_PRESETS } from '@/theme/primaryColorPresets';

type ThemePrimaryColorPickerProps = {
  value: string;
  onChange: (presetId: string) => void;
};

const CIRCLE_SIZE = 40;

function checkIconColor(swatchHex: string): string {
  const hex = swatchHex.replace('#', '');
  if (hex.length !== 6) {
    return '#FFFFFF';
  }
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#1D1B20' : '#FFFFFF';
}

export function ThemePrimaryColorPicker({ value, onChange }: ThemePrimaryColorPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <Text variant="bodyMedium" style={styles.hint}>
        Основной цвет интерфейса (кнопки, акценты)
      </Text>
      <View style={styles.grid} accessibilityRole="radiogroup">
        {PRIMARY_COLOR_PRESETS.map((preset) => {
          const selected = preset.id === value;
          return (
            <Pressable
              key={preset.id}
              onPress={() => onChange(preset.id)}
              accessibilityRole="radio"
              accessibilityLabel={preset.label}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.hit,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.circle,
                  { backgroundColor: preset.swatch },
                  selected && { borderColor: theme.colors.outline, borderWidth: 3 },
                ]}
              >
                {selected ? (
                  <Icon source="check" size={22} color={checkIconColor(preset.swatch)} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: screenPadding,
    paddingBottom: 8,
    gap: 8,
  },
  hint: {
    opacity: 0.85,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  hit: {
    padding: 4,
  },
  pressed: {
    opacity: 0.85,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});