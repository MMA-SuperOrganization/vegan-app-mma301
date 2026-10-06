import { Redirect } from 'expo-router';

import { LoadingScreen } from '@/components';
import { useAuthStore } from '@/features/auth';

export default function IndexRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);

  if (isRestoringSession) {
    return <LoadingScreen message="Đang khôi phục phiên đăng nhập…" />;
  }

  const user = useAuthStore.getState().user;
  if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;
  return (
    <Redirect
      href={user?.onboardingCompleted ? '/(tabs)' : '/(onboarding)/diet-goals'}
    />
  );
}
