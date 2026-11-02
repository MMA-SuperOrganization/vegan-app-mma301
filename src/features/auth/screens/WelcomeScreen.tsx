import { useRouter } from 'expo-router';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AppButton, AppIcon, AppText, ScreenWrapper } from '@/components';
import { colors, radius, spacing } from '@/theme';
import { useTranslation } from '@/i18n';

export function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 960;
  const hero = (
    <View style={[styles.hero, desktop && styles.desktopHero]}>
      <AppIcon
        name="mam-companion"
        size={190}
        accessibilityLabel={t('auth.mascotLabel')}
      />
      <AppText
        variant="heading4"
        color={colors.primary[700]}
        style={styles.tagline}
      >
        {t('auth.tagline')}
      </AppText>
    </View>
  );
  const copy = (
    <View>
      <AppText variant="display" style={styles.title}>
        {t('auth.welcomeTitle')}
      </AppText>
      <AppText
        variant="bodyLarge"
        color={colors.text.secondary}
        style={styles.description}
      >
        {t('auth.welcomeDescription')}
      </AppText>
    </View>
  );
  const actions = (
    <View style={[styles.actions, desktop && styles.desktopActions]}>
      <AppButton
        title={t('auth.getStarted')}
        preset="screen"
        onPress={() => router.push('/(auth)/register')}
      />
      <AppButton
        title={t('auth.haveAccount')}
        variant="secondary"
        preset="screen"
        onPress={() => router.push('/(auth)/login')}
      />
    </View>
  );

  return (
    <ScreenWrapper
      scrollable
      webMaxWidth={1120}
      contentContainerStyle={[styles.screen, desktop && styles.desktopScreen]}
      keyboardAvoiding={false}
    >
      {desktop ? (
        <>
          <View style={styles.desktopHeroColumn}>{hero}</View>
          <View style={styles.desktopCopyColumn}>
            {copy}
            {actions}
          </View>
        </>
      ) : (
        <>
          <View>
            {hero}
            {copy}
          </View>
          {actions}
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'space-between', padding: spacing.xl },
  hero: {
    minHeight: 290,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.background.selected,
    marginBottom: spacing.xl,
  },
  tagline: { marginTop: spacing.md },
  title: { color: colors.text.primary, marginBottom: spacing.md },
  description: { lineHeight: 28 },
  actions: { gap: spacing.lg, marginTop: spacing['2xl'] },
  desktopScreen: {
    minHeight: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },
  desktopHeroColumn: {
    flex: 1,
    maxWidth: 680,
  },
  desktopCopyColumn: {
    width: 380,
    gap: spacing['2xl'],
  },
  desktopHero: {
    minHeight: 360,
  },
  desktopActions: {
    width: '100%',
    marginTop: 0,
  },
});
