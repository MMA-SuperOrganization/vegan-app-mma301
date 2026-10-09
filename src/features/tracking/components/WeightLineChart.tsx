import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { AppText } from '@/components';
import { colors, spacing } from '@/theme';
import type { WeightChartPoint } from '../trackingState';

export interface WeightLineChartProps {
  points: WeightChartPoint[];
  /** Label under a point, e.g. "7 ngày · 65,4". */
  labelFor: (point: WeightChartPoint) => string;
  accessibilityLabel: string;
  height?: number;
}

const PADDING = 10;
const RANGE_PADDING_KG = 0.5;

/** Line chart with the area below filled; x follows elapsed days. */
export function WeightLineChart({
  points,
  labelFor,
  accessibilityLabel,
  height = 120,
}: WeightLineChartProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) =>
    setWidth(event.nativeEvent.layout.width);

  const weights = points.map((point) => point.weightKg);
  const minKg = Math.min(...weights) - RANGE_PADDING_KG;
  const maxKg = Math.max(...weights) + RANGE_PADDING_KG;
  const firstDaysAgo = points[0]?.daysAgo ?? 0;
  const innerWidth = Math.max(0, width - PADDING * 2);
  const innerHeight = height - PADDING * 2;

  const coords = points.map((point) => ({
    x:
      PADDING +
      (firstDaysAgo === 0
        ? innerWidth / 2
        : ((firstDaysAgo - point.daysAgo) / firstDaysAgo) * innerWidth),
    y: PADDING + ((maxKg - point.weightKg) / (maxKg - minKg)) * innerHeight,
  }));
  const linePath = coords
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x},${y}`)
    .join(' ');
  const baseline = height - PADDING;
  const areaPath =
    coords.length > 1
      ? `${linePath} L${coords[coords.length - 1].x},${baseline} L${coords[0].x},${baseline} Z`
      : '';

  const labelIndexes =
    points.length <= 3
      ? points.map((_, index) => index)
      : [0, Math.floor(points.length / 2), points.length - 1];

  return (
    <View accessible accessibilityLabel={accessibilityLabel}>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 && points.length > 0 ? (
          <Svg width={width} height={height}>
            {[0.25, 0.5, 0.75].map((fraction) => (
              <Line
                key={fraction}
                x1={PADDING}
                x2={width - PADDING}
                y1={PADDING + innerHeight * fraction}
                y2={PADDING + innerHeight * fraction}
                stroke={colors.border.default}
                strokeWidth={1}
              />
            ))}
            {areaPath ? <Path d={areaPath} fill={colors.primary[100]} /> : null}
            {coords.length > 1 ? (
              <Path
                d={linePath}
                stroke={colors.primary[700]}
                strokeWidth={2.5}
                fill="none"
              />
            ) : null}
            {coords.map(({ x, y }, index) => (
              <Circle
                key={points[index].date}
                cx={x}
                cy={y}
                r={5}
                fill={
                  index === coords.length - 1
                    ? colors.primary[700]
                    : colors.accent.orange
                }
              />
            ))}
          </Svg>
        ) : null}
      </View>
      <View style={styles.labels}>
        {labelIndexes.map((index) => (
          <AppText
            key={points[index].date}
            variant="caption"
            color={colors.text.secondary}
          >
            {labelFor(points[index])}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
