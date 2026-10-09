import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { AccountSecurityScreen } from '@/features/profile';

export default function AccountSecurityRoute() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  return authenticated ? (
    <AccountSecurityScreen />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
