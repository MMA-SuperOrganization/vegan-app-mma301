import { getUserErrorMessage } from '@/services/errors';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  SettingsScreenLayout,
  appDialog,
} from '@/components';
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
  const changePassword = useAuthStore((state) => state.changePassword);
  const logout = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const resetProfile = useProfileStore((state) => state.reset);
  const signOut = async () => {
    try {
      await logout();
      resetProfile();
      router.replace('/(auth)/login');
    } catch {
      // The auth store exposes the retryable error on this screen.
    }
  };
  const deleteAccount = () =>
    appDialog.alert(t('profile.deleteAccount'), t('profile.deleteAccountWarning'), [
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
              appDialog.alert(
                t('profile.deleteFailed'),
                getUserErrorMessage(error, t('profile.deleteFailed'))
              )
            )
            .finally(() => setIsDeleting(false));
        },
      },
    ]);
  const resetPassword = async () => {
    if (user?.email && (await sendPasswordReset(user.email)))
      appDialog.alert(
        t('profile.passwordResetTitle'),
        t('profile.passwordResetSent')
      );
  };
  const submitPasswordChange = async () => {
    if (!user?.email) return;
    if (newPassword.length < 6) {
      appDialog.alert(
        t('profile.passwordChangeTitle'),
        t('auth.validation.passwordLength')
      );
      return;
    }
    if (newPassword !== confirmation) {
      appDialog.alert(
        t('profile.passwordChangeTitle'),
        t('auth.validation.passwordMismatch')
      );
      return;
    }
    if (await changePassword(user.email, currentPassword, newPassword)) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      appDialog.alert(
        t('profile.passwordChangeTitle'),
        t('profile.passwordChangeSuccess')
      );
    }
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
      <View style={styles.card}>
        <AppText variant="heading4">{t('profile.changePassword')}</AppText>
        <AppInput
          type="password"
          label={t('profile.currentPassword')}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          autoComplete="current-password"
        />
        <AppInput
          type="password"
          label={t('profile.newPassword')}
          value={newPassword}
          onChangeText={setNewPassword}
          autoComplete="new-password"
          helper={t('auth.passwordHelper')}
        />
        <AppInput
          type="password"
          label={t('auth.confirmPassword')}
          value={confirmation}
          onChangeText={setConfirmation}
          autoComplete="new-password"
        />
        <AppButton
          title={t('profile.changePassword')}
          variant="outline"
          loading={isLoading}
          disabled={
            !user?.email || !currentPassword || !newPassword || !confirmation
          }
          onPress={() => void submitPasswordChange()}
        />
        <AppButton
          title={t('profile.forgotCurrentPassword')}
          variant="ghost"
          loading={isLoading}
          disabled={!user?.email}
          onPress={() => void resetPassword()}
        />
      </View>
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
