import React from 'react';
import { Platform } from 'react-native';
import { SvgXml, type SvgProps } from 'react-native-svg';
import { assetRegistry, coreTokens, type AssetName } from '@/theme';

export interface AppIconProps extends Omit<SvgProps, 'children' | 'color'> {
  name: AssetName;
  size?: number;
  color?: string;
  decorative?: boolean;
}
/** Proposed asset wrapper; vector paths remain the audited SVG paths. */
export function AppIcon({
  name,
  size,
  color,
  decorative,
  accessibilityLabel,
  ...props
}: AppIconProps) {
  const asset = assetRegistry[name];
  const isMascot = name === 'mam-companion';
  const dimension = size ?? (isMascot ? asset.width : coreTokens.icon.defaultSize);
  const hidden = decorative ?? !accessibilityLabel;
  // Only monochrome icon paints accept a semantic tint; preserve mascot colors.
  const xml = isMascot
    ? asset.xml
    : asset.xml.replace(
        /(?:fill|stroke)="#[\da-fA-F]{6}"/g,
        (paint) =>
          `${paint.split('=')[0]}="${color ?? coreTokens.icon.defaultColor}"`
      );
  return (
    <SvgXml
      {...props}
      xml={xml}
      width={dimension}
      height={(dimension * asset.height) / asset.width}
      {...(Platform.OS === 'web' ? {} : { accessible: !hidden })}
      accessibilityRole={hidden ? undefined : 'image'}
      accessibilityLabel={accessibilityLabel}
      aria-hidden={hidden}
    />
  );
}
