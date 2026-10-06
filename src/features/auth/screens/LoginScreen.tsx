import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppInput, ScreenWrapper } from '@/components';
import { spacing } from '@/theme';
import { AuthHeader } from '../components/AuthHeader';
import { AuthMessage } from '../components/AuthMessage';
import { AuthTextLink } from '../components/AuthTextLink';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { useAuthStore } from '../store/authStore';
import { validateLogin } from '../validations/loginValidation';

export function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: null as string | null,
    password: null as string | null,
  });

  const handleLogin = async () => {
    const nextErrors = validateLogin(email, password);
    setErrors(nextErrors);
    clearError();
    if (nextErrors.email || nextErrors.password) return;

    if (await login(email.trim(), password)) {
      const user = useAuthStore.getState().user;
      router.replace(
        user?.onboardingCompleted ? '/(tabs)' : '/(onboarding)/diet-goals'
      );
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <View>
        <AuthHeader title="Đăng nhập" subtitle="Chào mừng bạn trở lại" />
        <View style={styles.fields}>
          <AppInput
            label="Email"
            placeholder="minh@email.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrors((current) => ({ ...current, email: null }));
              clearError();
            }}
            keyboardType="email-address"
            autoComplete="email"
            error={errors.email}
          />
          <AppInput
            type="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrors((current) => ({ ...current, password: null }));
              clearError();
            }}
            autoComplete="current-password"
            error={errors.password}
            onSubmitEditing={handleLogin}
          />
        </View>
        <View style={styles.actions}>
          <AuthTextLink
            align="flex-end"
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            Quên mật khẩu?
          </AuthTextLink>
          <GoogleSignInButton />
          <AuthTextLink onPress={() => router.push('/(auth)/register')}>
            Chưa có tài khoản? Đăng ký
          </AuthTextLink>
        </View>
        {storeError ? <AuthMessage error={storeError} /> : null}
      </View>
      <AppButton
        title="Đăng nhập"
        preset="screen"
        loading={isLoading}
        onPress={handleLogin}
        style={styles.submit}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'space-between', padding: spacing.xl },
  fields: { gap: spacing.xl },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  submit: { marginTop: spacing['3xl'] },
});
