import { useQueries } from '@tanstack/react-query';

import { mediaApi } from '@/features/media/mediaApi';

export function usePostMediaAssets(mediaIds: string[] = []) {
  const uniqueIds = [...new Set(mediaIds.filter(Boolean))];
  return useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ['media', 'asset', id],
      queryFn: () => mediaApi.asset(id),
      staleTime: 4 * 60 * 1000,
    })),
    combine: (results) => ({
      data: results.flatMap((result) => (result.data ? [result.data] : [])),
      error: results.find((result) => result.error)?.error,
      isLoading: results.some((result) => result.isLoading),
    }),
  });
}
