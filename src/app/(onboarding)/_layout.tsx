import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { LoadingScreen } from '@/components';
import { useAuthStore } from '@/features/auth';
import { useOnboardingStore } from '@/features/onboarding/onboardingStore';
import { useTranslation } from '@/i18n';

export default function OnboardingLayout() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);
  const user = useAuthStore((state) => state.user);
  const hydrate = useOnboardingStore((state) => state.hydrate);
  const isHydrating = useOnboardingStore((state) => state.isHydrating);

  useEffect(() => {
    if (user?.id && !user.onboardingCompleted) void hydrate(user.id);
  }, [hydrate, user?.id, user?.onboardingCompleted]);

  if (isRestoringSession || (isAuthenticated && isHydrating)) {
    return <LoadingScreen message={t('onboarding.preparing')} />;
  }
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (user?.onboardingCompleted) return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
