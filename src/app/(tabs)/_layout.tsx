import { Redirect, Tabs } from 'expo-router';

import { LoadingScreen } from '@/components';
import { CustomTabBar } from '@/components/navigation';
import { useAuthStore } from '@/features/auth';

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);
  const user = useAuthStore((state) => state.user);

  if (isRestoringSession) {
    return <LoadingScreen message="Đang khôi phục phiên đăng nhập…" />;
  }

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  if (!user?.onboardingCompleted) {
    return <Redirect href="/(onboarding)/diet-goals" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name="meal-plan" options={{ title: 'Thực đơn' }} />
      <Tabs.Screen name="grocery" options={{ title: 'Mua sắm' }} />
      <Tabs.Screen name="diary" options={{ title: 'Nhật ký' }} />
      <Tabs.Screen name="profile" options={{ title: 'Cá nhân' }} />
    </Tabs>
  );
}
