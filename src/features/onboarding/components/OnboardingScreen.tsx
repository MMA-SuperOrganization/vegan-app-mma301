import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  BackButton,
  ProgressBar,
  ScreenWrapper,
} from '@/components';
import { colors, spacing } from '@/theme';
import { useTranslation } from '@/i18n';

export function OnboardingScreen({
  title,
  subtitle,
  step,
  children,
  primaryLabel,
  onPrimary,
  onBack,
  loading = false,
  error,
}: {
  title: string;
  subtitle: string;
  step: number;
  children: ReactNode;
  primaryLabel?: string;
  onPrimary: () => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}) {
  const { t } = useTranslation();
  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <View>
        <View style={styles.headerRow}>
          <BackButton onPress={onBack} />
          <AppText variant="heading1" numberOfLines={2} style={styles.title}>
            {title}
          </AppText>
          <View style={styles.side} />
        </View>
        <ProgressBar value={step} max={4} style={styles.progress} />
        <AppText
          variant="bodyLarge"
          color={colors.text.secondary}
          style={styles.subtitle}
        >
          {subtitle}
        </AppText>
        <View style={styles.content}>{children}</View>
        {error ? (
          <AppText
            accessibilityLiveRegion="polite"
            variant="bodySmall"
            color={colors.status.danger}
            style={styles.error}
          >
            {error}
          </AppText>
        ) : null}
      </View>
      <AppButton
        title={primaryLabel ?? t('common.continue')}
        preset="screen"
        loading={loading}
        onPress={onPrimary}
        style={styles.action}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'space-between', padding: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, minWidth: 0, textAlign: 'center', color: colors.text.primary },
  side: { width: 44 },
  progress: { marginTop: spacing.md },
  subtitle: { marginTop: spacing.xl },
  content: { marginTop: spacing['2xl'] },
  error: { marginTop: spacing.lg, textAlign: 'center' },
  action: { marginTop: spacing['3xl'] },
});
