import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { AppText } from '@/components';
import { colors, spacing } from '@/theme';

interface AuthTextLinkProps {
  children: ReactNode;
  onPress: () => void;
  align?: ViewStyle['alignSelf'];
}

export function AuthTextLink({
  children,
  onPress,
  align = 'center',
}: AuthTextLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.link,
        { alignSelf: align },
        pressed && styles.pressed,
      ]}
    >
      <AppText variant="bodyStrong" color={colors.primary[700]}>
        {children}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  pressed: { opacity: 0.65 },
});
