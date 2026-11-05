import { Redirect, Tabs } from 'expo-router';
import { CustomTabBar, type TabBarItemConfig } from '@/components';

import { useAuthStore } from '@/features/auth';

export default function AdminLayout() {
  const authenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);

  if (!authenticated) return <Redirect href="/(auth)/login" />;
  if (role !== 'admin') return <Redirect href="/(tabs)/profile" />;

  return (
    <Tabs
      tabBar={(props) => (
        <CustomTabBar {...props} config={ADMIN_TAB_CONFIG} order={ADMIN_TAB_ORDER} />
      )}
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="moderation" />
      <Tabs.Screen name="content" />
      <Tabs.Screen name="users" />
      <Tabs.Screen name="master-data" />
      <Tabs.Screen name="audit" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const ADMIN_TAB_CONFIG: Record<string, TabBarItemConfig> = {
  index: { labelKey: 'admin.tabs.overview', icon: 'home' },
  content: { labelKey: 'admin.tabs.content', icon: 'explore' },
  users: { labelKey: 'admin.tabs.users', icon: 'profile' },
  'master-data': { labelKey: 'admin.tabs.masterData', icon: 'pantry' },
  settings: { labelKey: 'profile.settingsSection', icon: 'profile' },
};
const ADMIN_TAB_ORDER = ['index', 'content', 'users', 'master-data', 'settings'];
