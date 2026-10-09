import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { DietaryPreferencesScreen } from '@/features/profile';

export default function DietaryPreferencesRoute() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  return authenticated ? (
    <DietaryPreferencesScreen />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
