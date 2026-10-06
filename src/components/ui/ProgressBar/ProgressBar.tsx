import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { coreTokens } from '@/theme';
import { progressRatio } from './progress';

export interface ProgressBarProps {
  value: number;
  max: number;
  tone?: 'energy' | 'water';
  height?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}
/** Derived-master track and fill from Summary; not a SummaryCard. */
export function ProgressBar({
  value,
  max,
  tone = 'energy',
  height = coreTokens.progress.height,
  style,
  testID,
  accessibilityLabel = 'Tiến trình',
}: ProgressBarProps) {
  const t = coreTokens.progress;
  const ratio = progressRatio(value, max);
  return (
    <View
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
      style={[
        tone === 'water' ? t.waterTrack : t.track,
        { height, width: '100%', overflow: 'hidden' },
        style,
      ]}
    >
      <View
        style={[
          tone === 'water' ? t.waterFill : t.fill,
          { height: '100%', width: `${ratio * 100}%` },
        ]}
      />
    </View>
  );
}
