import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { AllergiesSettingsScreen } from '@/features/profile';

export default function AllergiesSettingsRoute() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  return authenticated ? (
    <AllergiesSettingsScreen />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
