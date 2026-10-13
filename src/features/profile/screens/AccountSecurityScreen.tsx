import { useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppText, SettingsScreenLayout } from '@/components';
import { useAuthStore } from '@/features/auth';
import { appConfig } from '@/config/appConfig';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { profileApi } from '../profileApi';
import { useProfileStore } from '../profileStore';

export function AccountSecurityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const goBack = useSafeBack('/(tabs)/profile');
  const user = useAuthStore((state) => state.user);
  const sendPasswordReset = useAuthStore((state) => state.sendPasswordReset);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const [isDeleting, setIsDeleting] = useState(false);
  const resetProfile = useProfileStore((state) => state.reset);
  const signOut = async () => {
    await logout();
    resetProfile();
    router.replace('/(auth)/login');
  };
  const deleteAccount = () =>
    Alert.alert(t('profile.deleteAccount'), t('profile.deleteAccountWarning'), [
      { text: t('common.close'), style: 'cancel' },
      {
        text: t('profile.deleteAccountConfirm'),
        style: 'destructive',
        onPress: () => {
          setIsDeleting(true);
          void profileApi
            .deleteAccount()
            .then(signOut)
            .catch((error) =>
              Alert.alert(
                t('profile.deleteFailed'),
                error instanceof Error ? error.message : t('profile.deleteFailed')
              )
            )
            .finally(() => setIsDeleting(false));
        },
      },
    ]);
  const resetPassword = async () => {
    if (user?.email && (await sendPasswordReset(user.email)))
      Alert.alert(t('profile.passwordResetTitle'), t('profile.passwordResetSent'));
  };
  return (
    <SettingsScreenLayout title={t('profile.securityTitle')} onBack={goBack}>
      <AppText color={colors.text.secondary}>
        {user?.email ?? t('profile.noEmail')}
      </AppText>
      <View style={styles.card}>
        <AppText variant="heading4">{t('profile.currentSession')}</AppText>
        <AppText color={colors.text.secondary}>
          {t('profile.currentSessionDescription')}
        </AppText>
      </View>
      <AppButton
        title={t('profile.changePassword')}
        variant="outline"
        loading={isLoading}
        disabled={!user?.email}
        onPress={() => void resetPassword()}
      />
      {authError ? (
        <AppText color={colors.status.danger}>{authError.message}</AppText>
      ) : null}
      <AppButton
        title={t('profile.privacyData')}
        variant="outline"
        disabled={!appConfig.privacyPolicyUrl}
        onPress={() =>
          appConfig.privacyPolicyUrl &&
          void Linking.openURL(appConfig.privacyPolicyUrl)
        }
      />
      <AppButton
        title={t('profile.deleteAccount')}
        variant="danger"
        loading={isDeleting}
        disabled={isLoading}
        onPress={deleteAccount}
      />
      <View style={styles.card}>
        <AppText variant="heading4">{t('profile.logout')}</AppText>
        <AppText color={colors.text.secondary}>
          {t('profile.logoutDescription')}
        </AppText>
      </View>
      <AppButton
        title={t('profile.logout')}
        variant="outline"
        loading={isLoading}
        disabled={isDeleting}
        onPress={() => void signOut()}
      />
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
});
