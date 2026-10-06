import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { colors, radius, shadows, spacing } from '@/theme';

export interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const Loading: React.FC<LoadingProps> = ({
  message,
  fullScreen = false,
  size = 'large',
  color = colors.primary[700],
  style,
}) => {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, style]}>
        <View style={styles.card}>
          <LoadingSpinner size={size} color={color} text={message} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.inlineContainer, style]}>
      <LoadingSpinner size={size} color={color} text={message} />
    </View>
  );
};

const styles = StyleSheet.create({
  inlineContainer: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay.modal,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: colors.background.elevated,
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    ...shadows.modal,
  },
});
