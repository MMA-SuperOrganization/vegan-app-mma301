import type { User } from './types/auth.types';

/** Returns the first screen an authenticated account should see. */
export function getPostAuthRoute(user: User | null | undefined) {
  if (user?.role === 'admin') return '/admin' as const;
  return user?.onboardingCompleted
    ? ('/(tabs)' as const)
    : ('/(onboarding)/diet-goals' as const);
}
