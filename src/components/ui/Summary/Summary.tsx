import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { capitalize, child, containerStyle, family } from '@/theme';
import { DesignNode } from '../DesignNode';

export type SummaryKind =
  'energy' | 'water' | 'weight' | 'week' | 'grocery' | 'upload' | 'bmi';
export interface SummaryProps {
  kind: SummaryKind;
  overline?: string;
  value: string;
  unit?: string;
  hint?: string;
  /** Normalized progress between 0 and 1, clamped at render time. */
  progress: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  preview?: boolean;
}
export function Summary({
  kind,
  overline,
  value,
  unit,
  hint,
  progress,
  style,
  testID,
  accessibilityLabel,
  preview = false,
}: SummaryProps) {
  const node = family(
    `Summary / ${kind === 'bmi' ? 'BMI' : capitalize(kind)}`
  ).master!;
  const track = child(node, 'UI v2 / progress track');
  const fill = child(track, 'UI v2 / progress value');
  const ratio = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const content = {
    Overline: overline ?? child(node, 'Overline').text ?? '',
    Value: value,
    Unit: unit ?? '',
    Hint: hint ?? '',
  };
  return (
    <View testID={testID} style={[containerStyle(node, preview), style]}>
      <View
        accessible
        accessibilityLabel={
          accessibilityLabel ??
          `${content.Overline}, ${value} ${unit ?? ''}, ${hint ?? ''}`
        }
      >
        <DesignNode
          node={{
            ...node,
            style: { gap: node.style.gap },
            children: node.children.filter((c) => c !== track),
          }}
          content={content}
          fixedChildren={preview}
        />
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={content.Overline}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        style={[
          track.style,
          { height: track.height, width: preview ? track.width : '100%' },
        ]}
      >
        <View
          style={[fill.style, { height: fill.height, width: `${ratio * 100}%` }]}
        />
      </View>
    </View>
  );
}
