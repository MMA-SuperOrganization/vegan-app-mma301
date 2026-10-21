import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import {
  moderationApi,
  type ModerationCase,
  type PendingContent,
} from './moderationApi';
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
    cases: useQuery({
      queryKey: [...root, 'cases'],
      queryFn: moderationApi.cases,
      enabled,
    }),
    pending: useQuery({
      queryKey: [...root, 'pending'],
      queryFn: moderationApi.pending,
      enabled,
    }),
    review: useMutation({
      mutationFn: ({
        target,
        version,
        reject,
        reason,
      }: {
        target: PendingContent;
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
    createCase: useMutation({
      mutationFn: (report: UserReport) => moderationApi.createCase(report, user!.id),
      onSuccess: refresh,
    }),
    updateCase: useMutation({
      mutationFn: ({
        id,
        ...input
      }: {
        id: string;
        status?: UserReport['status'];
        resolution?: string;
        priority?: ModerationCase['priority'];
      }) => moderationApi.updateCase(id, { ...input, assignedAdminId: user!.id }),
      onSuccess: refresh,
    }),
    visibility: useMutation({
      mutationFn: ({
        item,
        hide,
        reason,
      }: {
        item: ModerationCase;
        hide: boolean;
        reason: string;
      }) => moderationApi.visibility(item, hide, reason),
      onSuccess: refresh,
    }),
  };
}
