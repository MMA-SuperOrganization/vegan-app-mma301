import React, { type ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { Href } from 'expo-router';

import { colors, spacing } from '@/theme';
import { AppText } from '../ui';
import { CustomHeader } from './CustomHeader';
import { ScreenWrapper } from './ScreenWrapper';

export interface SettingsScreenLayoutProps {
  title: string;
  children: ReactNode;
  subtitle?: string;
  scrollable?: boolean;
  onBack?: () => void;
  backFallbackHref?: Href;
  contentContainerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Shared full-width shell for profile and app setting detail screens. */
export function SettingsScreenLayout({
  title,
  children,
  subtitle,
  scrollable = true,
  onBack,
  backFallbackHref = '/(tabs)/profile',
  contentContainerStyle,
  testID,
}: SettingsScreenLayoutProps) {
  return (
    <ScreenWrapper
      scrollable={scrollable}
      header={
        <CustomHeader
          title={title}
          showBack
          onBack={onBack}
          backFallbackHref={backFallbackHref}
        />
      }
      contentContainerStyle={[styles.content, contentContainerStyle]}
      testID={testID}
    >
      {subtitle ? (
        <AppText color={colors.text.secondary}>{subtitle}</AppText>
      ) : null}
      {children}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
});
