import { useQuery } from '@tanstack/react-query';

import { profileApi } from './profileApi';

export function usePublicProfile(userId?: string) {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () => profileApi.publicProfile(userId!),
    enabled: Boolean(userId),
  });
}
