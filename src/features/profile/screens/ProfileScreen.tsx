import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, ScreenWrapper } from '@/components';
import { getDietOptions, optionLabel } from '@/features/onboarding/constants';
import { useUnreadNotificationCount } from '@/features/settings';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const dietOptions = getDietOptions(t);
  const data = useProfileStore((state) => state.data);
  const unread = useUnreadNotificationCount();
  if (!data) return null;

  const nutrition = data.nutritionProfile;
  const unreadCount = unread.data?.count ?? 0;

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.screen}
    >
      <AppText variant="heading1">{t('profile.title')}</AppText>

      <View style={styles.identity}>
        {data.user.avatarUrl ? (
          <Image source={{ uri: data.user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.fallback]}>
            <AppText variant="heading1" color={colors.primary[700]}>
              {data.user.name.charAt(0).toUpperCase()}
            </AppText>
          </View>
        )}
        <View style={styles.identityText}>
          <AppText variant="heading2">{data.user.name}</AppText>
          <AppText color={colors.primary[700]}>
            {data.user.email || t('profile.noEmail')}
          </AppText>
          <AppText variant="bodySmall" color={colors.primary[700]}>
            {data.profile?.dietType
              ? optionLabel(dietOptions, data.profile.dietType)
              : t('profile.noDiet')}
          </AppText>
        </View>
        <Pressable onPress={() => router.push('/edit-profile')} hitSlop={12}>
          <AppText color={colors.primary[700]}>{t('profile.edit')}</AppText>
        </Pressable>
      </View>

      <MenuSection title={t('profile.healthSection')}>
        <MenuItem
          title={t('profile.nutrition')}
          subtitle={
            nutrition?.bmi != null
              ? `BMI ${nutrition.bmi}`
              : t('profile.nutritionSubtitle')
          }
          onPress={() => router.push('/nutrition-profile')}
        />
        <MenuItem
          title={t('profile.dietaryTitle')}
          subtitle={t('profile.dietarySubtitle')}
          onPress={() => router.push('/dietary-preferences')}
        />
        <MenuItem
          title={t('profile.allergens')}
          subtitle={
            nutrition?.allergenSelectionCompleted
              ? t('profile.allergensConfigured', {
                  count: nutrition.allergenIds.length,
                })
              : t('profile.notSelected')
          }
          onPress={() => router.push('/allergies-settings')}
        />
      </MenuSection>
      <MenuSection title={t('profile.contentSection')}>
        <MenuItem
          title={t('profile.saved')}
          subtitle={t('profile.savedSubtitle')}
          onPress={() => router.push('/(discover)/saved')}
        />
        <MenuItem
          title={t('notifications.title')}
          subtitle={
            unreadCount
              ? t('notifications.unreadCount', { count: unreadCount })
              : t('notifications.emptyShort')
          }
          onPress={() => router.push('/notifications')}
        />
        <MenuItem
          title={t('notifications.settingsTitle')}
          subtitle={t('profile.notificationSettingsSubtitle')}
          onPress={() => router.push('/notification-settings')}
        />
      </MenuSection>
      <MenuSection title={t('profile.settingsSection')}>
        <MenuItem
          title={t('profile.language')}
          subtitle={t('profile.languageSubtitle')}
          onPress={() => router.push('/language')}
        />
        <MenuItem
          title={t('profile.securityTitle')}
          subtitle={t('profile.securitySubtitle')}
          onPress={() => router.push('/account-security')}
        />
      </MenuSection>
    </ScreenWrapper>
  );
}

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <AppText variant="heading4">{title}</AppText>
      <View style={styles.section}>{children}</View>
    </View>
  );
}

function MenuItem({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.menuText}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {subtitle}
        </AppText>
      </View>
      <AppText color={colors.primary[700]}>›</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.xl },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.background.selected,
  },
  identityText: { flex: 1, gap: spacing.xs },
  avatar: { width: 76, height: 76, borderRadius: 38 },
  fallback: {
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: { gap: spacing.sm },
  section: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
  },
  menuText: { flex: 1, gap: spacing.xs },
  pressed: { backgroundColor: colors.background.selected },
});
