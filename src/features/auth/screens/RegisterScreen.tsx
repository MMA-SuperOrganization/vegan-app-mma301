import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton, AppIcon, AppInput, AppText, ScreenWrapper } from '@/components';
import { colors, spacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { AuthHeader } from '../components/AuthHeader';
import { AuthMessage } from '../components/AuthMessage';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuthStore } from '../store/authStore';
import { validateRegistration } from '../validations/loginValidation';

const emptyErrors = {
  name: null,
  email: null,
  password: null,
  confirmation: null,
} as Record<'name' | 'email' | 'password' | 'confirmation', string | null>;

export function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState(emptyErrors);

  const update =
    (field: keyof typeof emptyErrors, setter: (value: string) => void) =>
    (value: string) => {
      setter(value);
      setErrors((current) => ({ ...current, [field]: null }));
      clearError();
    };

  const handleRegister = async () => {
    const nextErrors = validateRegistration(name, email, password, confirmation);
    setErrors(nextErrors);
    clearError();
    if (Object.values(nextErrors).some(Boolean)) return;

    if (await register(name.trim(), email.trim(), password)) {
      router.replace('/(onboarding)/diet-goals');
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <View>
        <View style={styles.brand}>
          <AppIcon
            name="mam-companion"
            size={72}
            accessibilityLabel={t('auth.mascotLabel')}
          />
          <View>
            <AppText variant="heading3" color={colors.primary[700]}>
              VEGETA
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {t('auth.brandSubtitle')}
            </AppText>
          </View>
        </View>
        <AuthHeader title={t('auth.createAccount')} subtitle={t('auth.registerSubtitle')} />
        <View style={styles.fields}>
          <AppInput
            label={t('auth.displayName')}
            placeholder={t('auth.displayNamePlaceholder')}
            value={name}
            onChangeText={update('name', setName)}
            error={errors.name}
            autoCapitalize="words"
          />
          <AppInput
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={update('email', setEmail)}
            error={errors.email}
            keyboardType="email-address"
            autoComplete="email"
          />
          <AppInput
            type="password"
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChangeText={update('password', setPassword)}
            error={errors.password}
            autoComplete="new-password"
            helper={t('auth.passwordHelper')}
          />
          <AppInput
            type="password"
            label={t('auth.confirmPassword')}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            value={confirmation}
            onChangeText={update('confirmation', setConfirmation)}
            error={errors.confirmation}
            autoComplete="new-password"
            onSubmitEditing={handleRegister}
          />
        </View>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.replace('/(auth)/login')}
          style={styles.loginLink}
        >
          <AppText variant="bodyStrong" color={colors.primary[700]}>
            {t('auth.accountLogin')}
          </AppText>
        </Pressable>
        <GoogleSignInButton />
        {storeError ? <AuthMessage error={storeError} /> : null}
      </View>
      <AppButton
        title={t('auth.register')}
        preset="screen"
        loading={isLoading}
        onPress={handleRegister}
        style={styles.submit}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'space-between', padding: spacing.xl },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  fields: { gap: spacing.lg },
  loginLink: { alignItems: 'center', paddingVertical: spacing.lg, minHeight: 48 },
  submit: { marginTop: spacing['2xl'] },
});
