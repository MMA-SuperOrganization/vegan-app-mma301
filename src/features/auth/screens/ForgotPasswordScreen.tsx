import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton, AppInput, AppText, ScreenWrapper } from '@/components';
import { colors, spacing } from '@/theme';
import { AuthHeader } from '../components/AuthHeader';
import { AuthMessage } from '../components/AuthMessage';
import { useAuthStore } from '../store/authStore';
import { validateEmail } from '../validations/loginValidation';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const sendPasswordReset = useAuthStore((state) => state.sendPasswordReset);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const error = validateEmail(email);
    setEmailError(error);
    clearError();
    if (error) return;
    if (await sendPasswordReset(email.trim())) setSent(true);
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <View>
        <AuthHeader
          title="Khôi phục tài khoản"
          subtitle="Nhập email để nhận liên kết xác minh qua email"
        />
        <AppInput
          label="Email"
          placeholder="minh@email.com"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setEmailError(null);
            setSent(false);
            clearError();
          }}
          keyboardType="email-address"
          autoComplete="email"
          error={emailError}
          onSubmitEditing={submit}
        />
        <Pressable
          accessibilityRole="link"
          onPress={() => router.replace('/(auth)/login')}
          style={styles.loginLink}
        >
          <AppText variant="bodyStrong" color={colors.primary[700]}>
            Đã có tài khoản? Đăng nhập
          </AppText>
        </Pressable>
        {sent ? (
          <AuthMessage
            success
            message="Đã gửi liên kết. Hãy kiểm tra hộp thư email của bạn."
          />
        ) : null}
        {storeError ? <AuthMessage error={storeError} /> : null}
      </View>
      <AppButton
        title="Gửi liên kết"
        preset="screen"
        loading={isLoading}
        disabled={sent}
        onPress={submit}
        style={styles.submit}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: 'space-between', padding: spacing.xl },
  loginLink: { alignItems: 'center', paddingVertical: spacing.xl, minHeight: 48 },
  submit: { marginTop: spacing['3xl'] },
});
