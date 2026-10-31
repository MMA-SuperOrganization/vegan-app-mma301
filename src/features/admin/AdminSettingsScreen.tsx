import { Image, Pressable, StyleSheet, View, type ReactNode } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton, AppIcon, AppText, ScreenWrapper } from '@/components';
import { useAuthStore } from '@/features/auth';
import { useProfileStore } from '@/features/profile';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

export function AdminSettingsScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const resetProfile = useProfileStore((state) => state.reset);
  const vi = locale === 'vi';

  if (!user) return null;

  const signOut = async () => {
    try {
      await logout();
      resetProfile();
      router.replace('/(auth)/login');
    } catch {
      // The shared account security screen remains available for retrying.
    }
  };

  return (
    <ScreenWrapper scrollable keyboardAvoiding={false} edges={['top', 'left', 'right']} contentContainerStyle={styles.screen}>
      <AppText variant="heading1">{t('admin.settings.title')}</AppText>
      <AppText color={colors.text.secondary}>{t('admin.settings.subtitle')}</AppText>

      <View style={styles.identity}>
        <View style={styles.identityMain}>
          {user.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={styles.avatar} /> : (
            <View style={[styles.avatar, styles.fallback]}>
              <AppText variant="heading1" color={colors.primary[700]}>{user.name.charAt(0).toUpperCase()}</AppText>
            </View>
          )}
          <View style={styles.identityText}>
            <AppText variant="heading3" numberOfLines={2}>{user.name}</AppText>
            <AppText variant="bodySmall" color={colors.text.secondary} numberOfLines={1} ellipsizeMode="middle">
              {user.email || t('profile.noEmail')}
            </AppText>
          </View>
        </View>
        <View style={styles.adminBadge}><AppText variant="bodySmall" color={colors.primary[700]}>{t('admin.settings.adminBadge')}</AppText></View>
      </View>

      <MenuSection title={t('admin.settings.profileSection')}>
        <MenuItem title={t('profile.edit')} subtitle={t('profile.editDescription')} onPress={() => router.push('/edit-profile')} />
      </MenuSection>
      <MenuSection title={t('admin.settings.preferencesSection')}>
        <MenuItem title={t('profile.language')} subtitle={t('profile.languageSubtitle')} onPress={() => router.push('/language')} />
        <MenuItem title={t('notifications.settingsTitle')} subtitle={t('profile.notificationSettingsSubtitle')} onPress={() => router.push('/notification-settings')} />
      </MenuSection>
      <MenuSection title={t('admin.settings.securitySection')}>
        <MenuItem title={t('profile.securityTitle')} subtitle={t('profile.securitySubtitle')} onPress={() => router.push('/account-security')} />
        <View style={styles.logoutCard}>
          <AppText variant="bodyStrong">{t('profile.logout')}</AppText>
          <AppText color={colors.text.secondary}>{t('profile.logoutDescription')}</AppText>
          <AppButton title={t('profile.logout')} variant="outline" loading={isLoading} onPress={() => void signOut()} />
        </View>
      </MenuSection>
      <MenuSection title={t('admin.settings.appendixSection')}>
        <MenuItem
          title={t('admin.tabs.masterData')}
          subtitle={vi ? 'Quản lý danh mục, dị nguyên và thực phẩm' : 'Manage categories, allergens, and foods'}
          onPress={() => router.push('/admin/master-data')}
        />
        <MenuItem
          title={t('admin.tabs.audit')}
          subtitle={vi ? 'Xem lịch sử hoạt động của hệ thống' : 'Review system activity history'}
          onPress={() => router.push('/admin/audit')}
        />
      </MenuSection>
    </ScreenWrapper>
  );
}

function MenuSection({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.group}><AppText variant="heading4">{title}</AppText><View style={styles.section}>{children}</View></View>;
}

function MenuItem({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.menuText}><AppText variant="bodyStrong">{title}</AppText><AppText variant="bodySmall" color={colors.text.secondary}>{subtitle}</AppText></View>
      <AppIcon name="back" size={18} color={colors.primary[700]} style={styles.chevron} decorative />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.xl },
  identity: { gap: spacing.lg, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: colors.background.selected },
  identityMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  identityText: { flex: 1, minWidth: 0, gap: spacing.xs },
  avatar: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: colors.background.surface },
  fallback: { backgroundColor: colors.background.surface, alignItems: 'center', justifyContent: 'center' },
  adminBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.background.surface },
  group: { gap: spacing.sm },
  section: { backgroundColor: colors.background.surface, borderRadius: radius.xl, overflow: 'hidden' },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border.default },
  menuText: { flex: 1, gap: spacing.xs },
  chevron: { transform: [{ rotate: '180deg' }] },
  pressed: { backgroundColor: colors.background.selected },
  logoutCard: { padding: spacing.xl, gap: spacing.sm },
});
