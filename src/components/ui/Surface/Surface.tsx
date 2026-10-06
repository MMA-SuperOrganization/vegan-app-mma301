import React from 'react';
import { View, type ViewProps } from 'react-native';
import { coreTokens, radius as radii, spacing } from '@/theme';

export interface SurfaceProps extends ViewProps {
  tone?: keyof typeof coreTokens.surface.tones;
  padding?: keyof typeof spacing | number;
  radius?: keyof typeof radii | number;
  bordered?: boolean;
}
/** Proposed container; no shadow by default. */
export function Surface({
  tone = 'surface',
  padding = 0,
  radius = coreTokens.surface.radius,
  bordered = false,
  style,
  ...props
}: SurfaceProps) {
  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: coreTokens.surface.tones[tone],
          padding: typeof padding === 'number' ? padding : spacing[padding],
          borderRadius: typeof radius === 'number' ? radius : radii[radius],
          borderWidth: bordered ? coreTokens.surface.border.width : 0,
          borderColor: coreTokens.surface.border.color,
        },
        style,
      ]}
    />
  );
}
