import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/features/auth';
export default function FeatureLayout() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  if (!authenticated) return <Redirect href="/(auth)/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
