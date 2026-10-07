import { Redirect, Stack } from 'expo-router';

import { LoadingScreen } from '@/components';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';

export default function AuthLayout() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);
  const user = useAuthStore((state) => state.user);

  if (isRestoringSession) {
    return <LoadingScreen message={t('bootstrap.restoringSession')} />;
  }

  if (isAuthenticated) {
    return (
      <Redirect
        href={user?.onboardingCompleted ? '/(tabs)' : '/(onboarding)/diet-goals'}
      />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
