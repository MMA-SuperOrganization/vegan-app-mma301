import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ScreenWrapper } from '@/components/layout';
import { AppText } from '@/components/ui/AppText';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import appLogo from '../../../assets/android-icon-foreground.png';
import disNoteWordmark from '../../../assets/branding/disnote-wordmark.png';

export interface LoadingScreenProps {
  message?: string;
  withinScreen?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function LoadingScreen({
  message,
  withinScreen = false,
  style,
  testID,
}: LoadingScreenProps) {
  const { t } = useTranslation();
  const visibleMessage = message ?? t('common.loading');
  const spinner = <LoadingSpinner text={visibleMessage} testID={testID} />;

  if (withinScreen) {
    return <View style={[styles.container, style]}>{spinner}</View>;
  }

  return (
    <ScreenWrapper
      keyboardAvoiding={false}
      testID={testID ? `${testID}-screen` : undefined}
    >
      <View style={[styles.container, style]}>
        <View style={styles.appBrand}>
          <Image
            source={appLogo}
            resizeMode="contain"
            accessible={false}
            accessibilityIgnoresInvertColors
            style={styles.appLogo}
          />
          {spinner}
        </View>

        <View
          accessible
          accessibilityLabel="Powered by DisNote"
          style={styles.poweredBy}
        >
          <AppText variant="bodySmall" color={colors.text.secondary}>
            Powered by
          </AppText>
          <Image
            source={disNoteWordmark}
            resizeMode="contain"
            accessible={false}
            accessibilityIgnoresInvertColors
            style={styles.disNoteWordmark}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.base,
  },
  appBrand: { alignItems: 'center', gap: spacing.lg },
  appLogo: { width: 240, height: 240 },
  poweredBy: {
    position: 'absolute',
    bottom: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.sm,
  },
  disNoteWordmark: { width: 145, height: 32 },
});
