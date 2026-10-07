import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/features/auth';

export default function DiscoverLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
