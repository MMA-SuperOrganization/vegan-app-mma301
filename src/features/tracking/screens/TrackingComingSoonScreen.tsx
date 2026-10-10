import { StyleSheet, View } from 'react-native';
import { AppText, CustomHeader, ScreenWrapper } from '@/components';
import { colors, spacing } from '@/theme';
import { useTranslation } from '@/i18n';

/** Temporary body for tracking sub-screens until each one is built. */
export function TrackingComingSoonScreen({ title }: { title: string }) {
  const { t } = useTranslation();
  return (
    <ScreenWrapper
      edges={['top', 'left', 'right', 'bottom']}
      keyboardAvoiding={false}
    >
      <CustomHeader title={title} showBack backFallbackHref="/(tabs)/diary" />
      <View style={styles.content}>
        <AppText color={colors.text.secondary} style={styles.text}>
          {t('placeholder.comingSoon', { feature: title })}
        </AppText>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  text: { textAlign: 'center' },
});
