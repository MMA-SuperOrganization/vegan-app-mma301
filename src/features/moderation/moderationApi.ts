import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
import type {
  CommunityPost,
  ReportTarget,
  UserReport,
} from '@/features/community/types';
export interface ModerationCase {
  _id: string;
  targetType: ReportTarget;
  targetId: string;
  status: UserReport['status'];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  reportIds: string[];
  assignedAdminId?: string;
  resolution?: string;
  actions?: Array<{ type: string; reason: string; at: string }>;
}
export interface RecipeReviewItem {
  _id: string;
  title: string;
  type: 'recipe';
  status: string;
}
export interface ReviewContent extends Omit<CommunityPost, 'content'> {
  content?: string;
  description?: string;
  summary?: string;
  transcript?: string;
  ingredients?: Array<{ foodNameSnapshot: string; quantity: number; unit: string }>;
  steps?: Array<{ order: number; instruction: string }>;
  playback?: { downloadUrl?: string; url?: string };
}
export const moderationApi = {
  reports: () =>
    collectPages((page) =>
      unwrapApiPageRequest<UserReport>(() =>
        apiClient.get('/admin/reports', { params: { page, limit: 100 } })
      )
    ),
  cases: () =>
    collectPages((page) =>
      unwrapApiPageRequest<ModerationCase>(() =>
        apiClient.get('/admin/moderation-cases', { params: { page, limit: 100 } })
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
  createCase: (report: UserReport, assignedAdminId: string) =>
    unwrapApiRequest<ModerationCase>(() =>
      apiClient.post('/admin/moderation-cases', {
        targetType: report.targetType,
        targetId: report.targetId,
        reportIds: [report._id],
        assignedAdminId,
        priority: 'normal',
      })
    ),
  updateCase: (
    id: string,
    input: {
      status?: UserReport['status'];
      resolution?: string;
      priority?: ModerationCase['priority'];
      assignedAdminId?: string;
    }
  ) =>
    unwrapApiRequest<ModerationCase>(() =>
      apiClient.patch('/admin/moderation-cases/' + id, input)
    ),
  visibility: (item: ModerationCase, hide: boolean, reason: string) =>
    unwrapApiRequest(() =>
      apiClient.post(
        '/admin/moderation/' +
          item.targetType +
          '/' +
          item.targetId +
          (hide ? '/hide' : '/restore'),
        { caseId: item._id, reason }
      )
    ),
};
