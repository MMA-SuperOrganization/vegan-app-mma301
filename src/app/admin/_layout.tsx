import { Redirect, Tabs } from 'expo-router';
import { AdminTabBar } from '@/components';

import { useAuthStore } from '@/features/auth';

export default function AdminLayout() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);

  if (!authenticated) return <Redirect href="/(auth)/login" />;
  if (role !== 'admin') return <Redirect href="/(tabs)/profile" />;

  return (
    <Tabs
      tabBar={(props) => <AdminTabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="moderation" />
      <Tabs.Screen name="users" />
      <Tabs.Screen name="master-data" />
      <Tabs.Screen name="audit" />
    </Tabs>
  );
}
