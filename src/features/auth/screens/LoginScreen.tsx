import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Button, Card, Input, Screen } from '@/components';
import { colors, radius, sizes, spacing, typography } from '@/theme';
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
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleLogin = async () => {
    const errors = validateLogin(email, password);
    setEmailError(errors.email);
    setPasswordError(errors.password);
    clearError();

    if (errors.email || errors.password) return;

    const success = await login(email.trim(), password);
    if (success) router.replace('/');
  };

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🌿</Text>
            </View>
            <Text style={styles.title}>Vegan App</Text>
            <Text style={styles.subtitle}>
              Vegan Lifestyle & Nutrition Support App — MMA302
            </Text>
          </View>

          <Card variant="default">
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
                if (storeError) clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />
            <Input
              label="Password"
              placeholder="Enter your password (min. 6 characters)"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
                if (storeError) clearError();
              }}
              secureTextEntry
              error={passwordError}
            />

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Forgot Password',
                  'Password recovery is coming soon in the next release.'
                )
              }
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            {storeError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{storeError}</Text>
              </View>
            ) : null}

            <Button
              title="Sign In"
              loading={isLoading}
              onPress={handleLogin}
              style={styles.loginButton}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Create Account',
                  'User registration is coming soon in the next release.'
                )
              }
            >
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logoBadge: {
    width: sizes.avatar.xl,
    height: sizes.avatar.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  logoIcon: { fontSize: sizes.icon.lg },
  title: {
    ...typography.heading1,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: { ...typography.bodyStrong, color: colors.text.link },
  errorBanner: {
    backgroundColor: colors.background.base,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.danger,
  },
  errorBannerText: {
    ...typography.bodySmall,
    color: colors.status.danger,
    textAlign: 'center',
  },
  loginButton: { marginBottom: spacing.md },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: { ...typography.bodySmall, color: colors.text.secondary },
  registerLink: { ...typography.bodyStrong, color: colors.text.link },
});
