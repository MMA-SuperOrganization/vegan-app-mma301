import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';
import type { MacroKey } from '../trackingState';

export interface MacroSlice {
  key: MacroKey;
  label: string;
  percent: number;
  grams: string;
}

export interface MacroDonutChartProps {
  slices: MacroSlice[];
  accessibilityLabel: string;
  size?: number;
}

const MACRO_COLORS: Record<MacroKey, string> = {
  carbs: colors.primary[500],
  protein: colors.accent.orange,
  fat: colors.status.info,
};

const STROKE_WIDTH = 18;

/** Donut of the energy split, with a text legend so color is not the only cue. */
export function MacroDonutChart({
  slices,
  accessibilityLabel,
  size = 132,
}: MacroDonutChartProps) {
  const r = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <View style={styles.row} accessible accessibilityLabel={accessibilityLabel}>
      <Svg width={size} height={size} style={styles.chart}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.background.muted}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {slices.map((slice) => {
          const length = (slice.percent / 100) * circumference;
          const dashOffset = -offset;
          offset += length;
          return slice.percent > 0 ? (
            <Circle
              key={slice.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={MACRO_COLORS[slice.key]}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={dashOffset}
              fill="none"
            />
          ) : null;
        })}
      </Svg>
      <View style={styles.legend}>
        {slices.map((slice) => (
          <View key={slice.key} style={styles.legendRow}>
            <View
              style={[styles.swatch, { backgroundColor: MACRO_COLORS[slice.key] }]}
            />
            <View style={styles.legendText}>
              <AppText variant="bodyStrong">
                {slice.label} {slice.percent}%
              </AppText>
              <AppText variant="caption" color={colors.text.secondary}>
                {slice.grams}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  // Start the first slice at 12 o'clock.
  chart: { transform: [{ rotate: '-90deg' }] },
  legend: { flex: 1, gap: spacing.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  swatch: { width: 12, height: 12, borderRadius: radius.full },
  legendText: { flex: 1 },
});
