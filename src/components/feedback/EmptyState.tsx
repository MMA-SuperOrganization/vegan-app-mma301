import React, { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppButton, AppText } from '@/components/ui';
import { colors, spacing } from '@/theme';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  style,
  testID,
}: EmptyStateProps) {
  return (
    <View testID={testID} style={[styles.container, style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <AppText variant="heading3" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText
          variant="bodyDefault"
          color={colors.text.secondary}
          style={styles.description}
        >
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          fullWidth={false}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['3xl'],
  },
  icon: { marginBottom: spacing.lg },
  title: { color: colors.text.primary, textAlign: 'center' },
  description: { marginTop: spacing.sm, textAlign: 'center' },
  action: { marginTop: spacing.xl },
});
