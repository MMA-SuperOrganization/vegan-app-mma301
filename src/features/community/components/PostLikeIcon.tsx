import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components';
import { colors, radius } from '@/theme';

export function PostLikeIcon({ liked }: { liked: boolean }) {
  return (
    <View style={[styles.container, liked && styles.containerSelected]}>
      <AppIcon
        name="heart"
        size={19}
        color={liked ? colors.primary[700] : colors.text.secondary}
        decorative
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.common.transparent,
  },
  containerSelected: {
    backgroundColor: colors.background.selected,
  },
});
