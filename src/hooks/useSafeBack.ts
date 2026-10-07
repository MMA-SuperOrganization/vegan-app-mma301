import { useCallback } from 'react';
import { useNavigation, useRouter, type Href } from 'expo-router';
import { performSafeBack } from './safeBack';

export function useSafeBack(fallbackHref: Href = '/(tabs)') {
  const navigation = useNavigation();
  const router = useRouter();

  return useCallback(() => {
    performSafeBack({
      canGoBack: navigation.canGoBack,
      goBack: navigation.goBack,
      goToFallback: () => router.replace(fallbackHref),
    });
  }, [fallbackHref, navigation, router]);
}
