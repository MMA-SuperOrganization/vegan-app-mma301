import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { LoadingScreen } from '@/components';
import { getPostAuthRoute, useAuthStore } from '@/features/auth';
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
  if (user?.role === 'admin' || user?.onboardingCompleted)
    return <Redirect href={getPostAuthRoute(user)} />;
  return (
    <Stack initialRouteName="diet-goals" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="diet-goals" />
      <Stack.Screen name="nutrition-profile" />
      <Stack.Screen name="allergies" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}
