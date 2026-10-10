import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { NotificationInboxScreen } from '@/features/settings';

export default function NotificationsRoute() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  return authenticated ? (
    <NotificationInboxScreen />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
