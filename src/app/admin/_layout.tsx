import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/features/auth';

export default function AdminLayout() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);

  if (!authenticated) return <Redirect href="/(auth)/login" />;
  if (role !== 'admin') return <Redirect href="/(tabs)/profile" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
