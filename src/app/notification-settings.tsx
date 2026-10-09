import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { NotificationSettingsScreen } from '@/features/settings';

export default function NotificationSettingsRoute() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  return authenticated ? (
    <NotificationSettingsScreen />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
