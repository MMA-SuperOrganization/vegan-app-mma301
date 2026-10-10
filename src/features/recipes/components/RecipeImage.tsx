import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ImageStyle,
} from 'react-native';

import { AppText } from '@/components';
import { colors, radius } from '@/theme';

type RecipeImageProps = {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  fallbackSize?: 'small' | 'large';
};

export function RecipeImage({
  uri,
  style,
  fallbackSize = 'small',
}: RecipeImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [uri]);

  if (!uri || failed) {
    return (
      <View style={[styles.image, styles.fallback, style]}>
        <AppText variant={fallbackSize === 'large' ? 'display' : 'heading2'}>
          🌱
        </AppText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, style]}
      resizeMode="cover"
      accessible={false}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.background.selected, borderRadius: radius.md },
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
