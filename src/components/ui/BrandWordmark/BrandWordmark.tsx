import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';
import { AppText } from '../AppText';

interface BrandWordmarkProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** VEGETA wordmark whose V is formed by the brand's two leaves. */
export function BrandWordmark({ size = 26, style }: BrandWordmarkProps) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="VEGETA"
      style={[styles.wordmark, style]}
    >
      <Svg
        width={size * 0.9}
        height={size}
        viewBox="0 0 30 32"
        accessible={false}
        aria-hidden
      >
        <Path
          d="M2 2C9.8 2.8 15 10.2 15 29C7.2 24.2 1.2 14.8 2 2Z"
          fill={colors.primary[700]}
        />
        <Path
          d="M28 2C20.2 2.8 15 10.2 15 29C22.8 24.2 28.8 14.8 28 2Z"
          fill={colors.primary[300]}
        />
      </Svg>
      <AppText
        aria-hidden
        style={[
          styles.text,
          {
            fontSize: size,
            lineHeight: size * 1.18,
            letterSpacing: size * 0.035,
          },
        ]}
      >
        EGETA
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: { flexDirection: 'row', alignItems: 'center' },
  text: {
    color: colors.primary[700],
    fontWeight: '800',
  },
});
