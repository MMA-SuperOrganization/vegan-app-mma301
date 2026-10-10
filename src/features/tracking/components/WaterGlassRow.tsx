import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing } from '@/theme';

export interface WaterGlassRowProps {
  total: number;
  filled: number;
  /** Label for the row, e.g. "5 / 8 ly". */
  accessibilityLabel: string;
  /** Label for each empty glass button, e.g. "Thêm 1 ly (250 ml)". */
  addGlassLabel: string;
  onAddGlass: () => void;
}

const GLASS_WIDTH = 28;
const GLASS_HEIGHT = 36;
/** Tapered glass outline. */
const GLASS_PATH = 'M3,3 L25,3 L22,33 L6,33 Z';
/** Lower ~60% of the glass, following the tapered sides. */
const WATER_PATH = 'M4.2,15 L23.8,15 L22,33 L6,33 Z';
/** Light top of a drunk glass, sampled from the Figma "Water portion"; not in the palette. */
const DRUNK_GLASS_TOP = '#DCEFF4';

const GLASS_COLORS = {
  drunk: {
    outline: colors.status.info,
    top: DRUNK_GLASS_TOP,
    water: colors.status.info,
  },
  empty: {
    outline: colors.border.strong,
    top: colors.background.muted,
    water: colors.background.surface,
  },
};

/** Row of glasses; tapping any empty glass logs one more glass. */
export function WaterGlassRow({
  total,
  filled,
  accessibilityLabel,
  addGlassLabel,
  onAddGlass,
}: WaterGlassRowProps) {
  return (
    <View
      style={styles.row}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="summary"
    >
      {Array.from({ length: total }, (_, index) => {
        const isFilled = index < filled;
        const palette = isFilled ? GLASS_COLORS.drunk : GLASS_COLORS.empty;
        const glass = (
          <Svg width={GLASS_WIDTH} height={GLASS_HEIGHT}>
            <Path d={GLASS_PATH} fill={palette.top} />
            <Path d={WATER_PATH} fill={palette.water} />
            <Path
              d={GLASS_PATH}
              fill="none"
              stroke={palette.outline}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </Svg>
        );
        return isFilled ? (
          <View key={index} style={styles.glass} importantForAccessibility="no">
            {glass}
          </View>
        ) : (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={addGlassLabel}
            onPress={onAddGlass}
            hitSlop={4}
            style={({ pressed }) => [styles.glass, pressed && styles.pressed]}
          >
            {glass}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  glass: { padding: spacing.xs },
  pressed: { opacity: 0.6 },
});
