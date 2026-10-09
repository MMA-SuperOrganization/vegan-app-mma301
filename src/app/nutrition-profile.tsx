import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { NutritionProfileScreen } from '@/features/profile';

export default function NutritionProfileRoute() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  return authenticated ? (
    <NutritionProfileScreen />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
