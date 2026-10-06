import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton, AppIcon, AppInput, AppText, ScreenWrapper } from '@/components';
import { colors, spacing } from '@/theme';
import { AuthHeader } from '../components/AuthHeader';
import { AuthMessage } from '../components/AuthMessage';
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
            accessibilityLabel="Linh vật Mầm"
          />
          <View>
            <AppText variant="heading3" color={colors.primary[700]}>
              VEGETA
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              Ăn xanh dễ dàng hơn
            </AppText>
          </View>
        </View>
        <AuthHeader title="Tạo tài khoản" subtitle="Bắt đầu hành trình ăn chay" />
        <View style={styles.fields}>
          <AppInput
            label="Tên hiển thị"
            placeholder="Nhập tên hiển thị"
            value={name}
            onChangeText={update('name', setName)}
            error={errors.name}
            autoCapitalize="words"
          />
          <AppInput
            label="Email"
            placeholder="Nhập email"
            value={email}
            onChangeText={update('email', setEmail)}
            error={errors.email}
            keyboardType="email-address"
            autoComplete="email"
          />
          <AppInput
            type="password"
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={update('password', setPassword)}
            error={errors.password}
            autoComplete="new-password"
            helper="Tối thiểu 6 ký tự"
          />
          <AppInput
            type="password"
            label="Xác nhận mật khẩu"
            placeholder="Nhập xác nhận mật khẩu"
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
            Đã có tài khoản? Đăng nhập
          </AppText>
        </Pressable>
        {storeError ? <AuthMessage message={storeError} /> : null}
      </View>
      <AppButton
        title="Đăng ký"
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
