import { Redirect, Stack } from 'expo-router';

import { LoadingScreen } from '@/components';
import { useAuthStore } from '@/features/auth';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);

  if (isRestoringSession) {
    return <LoadingScreen message="Đang khôi phục phiên đăng nhập…" />;
  }

  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
