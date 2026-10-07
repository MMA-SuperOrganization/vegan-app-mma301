import React, { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, type Href } from 'expo-router';

import { AppIcon, AppText, BackButton } from '@/components/ui';
import { useSafeBack } from '@/hooks';
import {
  colors,
  coreTokens,
  interactionTokens,
  spacing,
  type AssetName,
} from '@/theme';

export interface HeaderAction {
  accessibilityLabel: string;
  onPress: () => void;
  icon?: AssetName;
  node?: ReactNode;
  disabled?: boolean;
}

export interface CustomHeaderProps {
  title: string;
  showBack?: 'auto' | boolean;
  onBack?: () => void;
  backFallbackHref?: Href;
  rightAction?: HeaderAction;
  testID?: string;
}

export function CustomHeader({
  title,
  showBack = 'auto',
  onBack,
  backFallbackHref = '/(tabs)',
  rightAction,
  testID,
}: CustomHeaderProps) {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  const backVisible = showBack === 'auto' ? canGoBack : showBack;
  const safeBack = useSafeBack(backFallbackHref);

  const handleBack = () => {
    if (onBack) return onBack();
    safeBack();
  };

  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.side}>
        {backVisible ? <BackButton onPress={handleBack} /> : null}
      </View>
      <AppText numberOfLines={2} variant="titleLarge" style={styles.title}>
        {title}
      </AppText>
      <View style={[styles.side, styles.rightSide]}>
        {rightAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightAction.accessibilityLabel}
            accessibilityState={{ disabled: !!rightAction.disabled }}
            disabled={rightAction.disabled}
            hitSlop={interactionTokens.iconHitSlop}
            onPress={rightAction.onPress}
            style={styles.action}
          >
            {rightAction.node ??
              (rightAction.icon ? (
                <AppIcon
                  name={rightAction.icon}
                  size={24}
                  color={colors.primary[700]}
                  decorative
                />
              ) : null)}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: coreTokens.navigation.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
  },
  side: {
    width: coreTokens.navigation.headerSideWidth,
    minHeight: coreTokens.navigation.headerSideWidth,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSide: { alignItems: 'flex-end' },
  title: {
    flex: 1,
    minWidth: 0,
    color: colors.text.primary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  action: {
    minWidth: coreTokens.navigation.headerSideWidth,
    minHeight: coreTokens.navigation.headerSideWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
