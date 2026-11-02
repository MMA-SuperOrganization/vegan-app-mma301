import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
import type { UserReport } from '@/features/community/types';
import type { RecipeDetail } from '@/features/recipes/types';
export interface RecipeReviewItem {
  _id: string;
  title: string;
  type: 'recipe';
  status: string;
  description?: string;
  excerpt?: string;
  coverImageUrl?: string;
  coverMediaId?: string | null;
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  totalMinutes?: number;
  totalTimeMinutes?: number;
  createdAt?: string;
}
export interface ReviewContent extends RecipeDetail {
  content?: string;
  transcript?: string;
  playback?: { downloadUrl?: string; url?: string };
}
export const moderationApi = {
  reports: () =>
    collectPages((page) =>
      unwrapApiPageRequest<UserReport>(() =>
        apiClient.get('/admin/reports', { params: { page, limit: 100 } })
      )
    ),
  recipes: () =>
    collectPages((page) =>
      unwrapApiPageRequest<RecipeReviewItem>(() =>
        apiClient.get('/admin/content/pending', {
          params: { page, limit: 50, type: 'recipe' },
        })
      )
    ),
  content: (target: RecipeReviewItem) =>
    unwrapApiRequest<ReviewContent>(() =>
      apiClient.get('/' + target.type + 's/' + target._id)
    ),
  review: (
    target: RecipeReviewItem,
    version: number,
    reject: boolean,
    reason: string
  ) =>
    unwrapApiRequest(() =>
      apiClient.post(
        '/' + target.type + 's/' + target._id + (reject ? '/reject' : '/publish'),
        { version, ...(reject ? { reason } : {}) }
      )
    ),
  updateReport: (
    report: UserReport,
    input: {
      status?: UserReport['status'];
      resolution?: string;
      assignedAdminId?: string;
    }
  ) =>
    unwrapApiRequest<UserReport>(() =>
      apiClient.patch('/admin/reports/' + report._id, input)
    ),
};
