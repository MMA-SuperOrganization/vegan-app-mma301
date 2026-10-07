import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { EmptyState, LoadingScreen, ScreenWrapper } from '@/components';
import { useAuthStore } from '@/features/auth';
import { useProfileStore } from '@/features/profile';
import { colors, typography, useDesignFonts } from '@/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 1000 * 60 * 5 } },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useDesignFonts();
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const profileUserId = useProfileStore((state) => state.userId);
  const profileStatus = useProfileStore((state) => state.status);
  const profileError = useProfileStore((state) => state.error);
  const loadProfile = useProfileStore((state) => state.load);
  const resetProfile = useProfileStore((state) => state.reset);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (isRestoringSession) return;
    if (isAuthenticated && user?.id) void loadProfile(user.id);
    else resetProfile();
  }, [isAuthenticated, isRestoringSession, loadProfile, resetProfile, user?.id]);

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  let content: React.ReactNode;
  if (isRestoringSession) {
    content = <LoadingScreen message="Đang khôi phục phiên đăng nhập…" />;
  } else if (
    isAuthenticated &&
    user?.id &&
    (profileUserId !== user.id || profileStatus === 'idle' || profileStatus === 'loading')
  ) {
    content = <LoadingScreen message="Đang tải hồ sơ…" />;
  } else if (isAuthenticated && user?.id && profileStatus === 'error') {
    content = (
      <ScreenWrapper keyboardAvoiding={false}>
        <EmptyState
          title="Chưa thể tải hồ sơ"
          description={profileError ?? 'Kiểm tra kết nối rồi thử lại.'}
          actionLabel="Thử lại"
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
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
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
