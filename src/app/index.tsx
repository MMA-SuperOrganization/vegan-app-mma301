import { Redirect } from 'expo-router';

import { LoadingScreen } from '@/components';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';

export default function IndexRoute() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);

  if (isRestoringSession) {
    return <LoadingScreen message={t('bootstrap.restoringSession')} />;
  }

  const user = useAuthStore.getState().user;
  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;
  return (
    <Redirect
      href={user?.onboardingCompleted ? '/(tabs)' : '/(onboarding)/diet-goals'}
    />
  );
}
