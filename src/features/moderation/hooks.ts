import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { moderationApi, type RecipeReviewItem } from './moderationApi';
import type { UserReport } from '@/features/community/types';
export function useModeration() {
  const user = useAuthStore((state) => state.user);
  const client = useQueryClient();
  const root = ['account', user?.id, 'moderation'];
  const enabled = user?.role === 'admin';
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: root }),
      client.invalidateQueries({ queryKey: ['account', user?.id, 'community'] }),
    ]);
  };
  return {
    reports: useQuery({
      queryKey: [...root, 'reports'],
      queryFn: moderationApi.reports,
      enabled,
    }),
    recipes: useQuery({
      queryKey: [...root, 'review-queue', 'recipe'],
      queryFn: moderationApi.recipes,
      enabled,
    }),
    review: useMutation({
      mutationFn: ({
        target,
        version,
        reject,
        reason,
      }: {
        target: RecipeReviewItem;
        version: number;
        reject: boolean;
        reason: string;
      }) => moderationApi.review(target, version, reject, reason),
      onSuccess: refresh,
    }),
    report: useMutation({
      mutationFn: ({
        report,
        status,
        resolution,
      }: {
        report: UserReport;
        status: UserReport['status'];
        resolution?: string;
      }) =>
        moderationApi.updateReport(report, {
          status,
          resolution,
          assignedAdminId: user!.id,
        }),
      onSuccess: refresh,
    }),
  };
}
