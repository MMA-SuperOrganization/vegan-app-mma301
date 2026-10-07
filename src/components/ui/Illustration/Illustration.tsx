import React from 'react';
import {
  Image,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { family } from '@/theme';
import { useTranslation } from '@/i18n';

export interface IllustrationProps {
  /** Verified Mầm raster asset, or an SVG component supplied through children. */
  source?: ImageSourcePropType;
  children?: React.ReactNode;
  accessibilityLabel?: string;
  decorative?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
/** Asset host only: the audited JSON contains no vector paths. */
export function Illustration({
  source,
  children,
  accessibilityLabel,
  decorative = false,
  style,
  testID,
}: IllustrationProps) {
  const { t } = useTranslation();
  const node = family('Illustration /').master!;
  return (
    <View
      testID={testID}
      accessible={!decorative && !!(source || children)}
      accessibilityRole={source || children ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel ?? t('auth.mascotLabel')}
      style={[{ width: node.width, height: node.height }, style]}
    >
      {source ? (
        <Image
          source={source}
          resizeMode="contain"
          style={{ width: '100%', height: '100%' }}
          accessible={false}
        />
      ) : (
        children
      )}
    </View>
  );
}
