import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { EmptyState, LoadingScreen, ScreenWrapper } from '@/components';
import { useAuthStore } from '@/features/auth';
import { useProfileStore } from '@/features/profile';
import { useI18nStore, useTranslation } from '@/i18n';
import { colors, typography, useDesignFonts } from '@/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useDesignFonts();
  const { t } = useTranslation();
  const hydrateI18n = useI18nStore((state) => state.hydrate);
  const i18nHydrated = useI18nStore((state) => state.isHydrated);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const profileUserId = useProfileStore((state) => state.userId);
  const profileStatus = useProfileStore((state) => state.status);
  const profileError = useProfileStore((state) => state.error);
  const loadProfile = useProfileStore((state) => state.load);
  const resetProfile = useProfileStore((state) => state.reset);
  const previousAccountId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    void hydrateI18n();
  }, [hydrateI18n]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (isRestoringSession) return;
    if (isAuthenticated && user?.id) void loadProfile(user.id);
    else resetProfile();
  }, [isAuthenticated, isRestoringSession, loadProfile, resetProfile, user?.id]);

  useEffect(() => {
    if (isRestoringSession) return;
    const accountId = isAuthenticated ? (user?.id ?? null) : null;
    if (previousAccountId.current === undefined) {
      previousAccountId.current = accountId;
      return;
    }
    if (previousAccountId.current !== accountId) {
      queryClient.clear();
      previousAccountId.current = accountId;
    }
  }, [isAuthenticated, isRestoringSession, user?.id]);

  if (fontError) throw fontError;
  if (!fontsLoaded || !i18nHydrated) return null;

  let content: React.ReactNode;
  if (isRestoringSession) {
    content = <LoadingScreen message={t('bootstrap.restoringSession')} />;
  } else if (
    isAuthenticated &&
    user?.id &&
    (profileUserId !== user.id ||
      profileStatus === 'idle' ||
      profileStatus === 'loading')
  ) {
    content = <LoadingScreen message={t('bootstrap.loadingProfile')} />;
  } else if (isAuthenticated && user?.id && profileStatus === 'error') {
    content = (
      <ScreenWrapper keyboardAvoiding={false}>
        <EmptyState
          title={t('bootstrap.profileErrorTitle')}
          description={profileError ?? t('bootstrap.profileErrorDescription')}
          actionLabel={t('common.retry')}
          onAction={() => void loadProfile(user.id, true)}
        />
      </ScreenWrapper>
    );
  } else {
    content = (
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background.elevated },
          headerTintColor: colors.primary[700],
          headerTitleStyle: typography.heading5,
          contentStyle: { backgroundColor: colors.background.base },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(discover)" options={{ headerShown: false }} />
        <Stack.Screen name="(tracking)" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="language" options={{ headerShown: false }} />
        <Stack.Screen name="nutrition-profile" options={{ headerShown: false }} />
        <Stack.Screen name="dietary-preferences" options={{ headerShown: false }} />
        <Stack.Screen name="allergies-settings" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen
          name="notification-settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="account-security" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        {content}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
