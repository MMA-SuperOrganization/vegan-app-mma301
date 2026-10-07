import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth';
import { EditProfileScreen } from '@/features/profile';

export default function EditProfileRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <EditProfileScreen />;
}
