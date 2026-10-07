import { Redirect, Tabs } from 'expo-router';

import { LoadingScreen } from '@/components';
import { CustomTabBar } from '@/components/navigation';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';

export default function TabsLayout() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);
  const user = useAuthStore((state) => state.user);

  if (isRestoringSession) {
    return <LoadingScreen message={t('bootstrap.restoringSession')} />;
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
      <Tabs.Screen name="index" options={{ title: t('nav.home') }} />
      <Tabs.Screen name="explore" options={{ title: t('nav.explore') }} />
      <Tabs.Screen name="meal-plan" options={{ title: t('nav.mam') }} />
      <Tabs.Screen name="grocery" options={{ title: t('nav.pantry') }} />
      <Tabs.Screen name="profile" options={{ title: t('nav.profile') }} />
      <Tabs.Screen name="diary" options={{ href: null }} />
    </Tabs>
  );
}
