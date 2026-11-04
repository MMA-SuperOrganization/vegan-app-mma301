import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
import type { ContentCardData } from '@/features/recipes/types';

export type EngagementTarget = 'recipe' | 'video';
export type DiscussionTarget = 'post' | 'video';
export type ReactionType = 'like' | 'love' | 'helpful';
export interface DiscussionComment {
  _id: string;
  authorId: string;
  content: string;
  version: number;
  parentCommentId?: string | null;
}
export interface RatingSummary {
  count: number;
  average: number;
  distribution: Record<string, number>;
  myRating: { score: number; review?: string | null } | null;
}
export interface ViewHistoryItem {
  _id: string;
  targetType: 'recipe' | 'post' | 'video';
  targetId: string;
  lastViewedAt: string;
  target: ContentCardData | null;
  unavailable?: boolean;
}

export const engagementApi = {
  comments: async (targetType: DiscussionTarget, targetId: string) => {
    const roots = await collectPages((page) =>
      unwrapApiPageRequest<DiscussionComment>(() =>
        apiClient.get('/comments', {
          params: { targetType, targetId, page, limit: 100, sort: 'oldest' },
        })
      )
    );
    const replyGroups = await Promise.all(
      roots.data.map((rootComment) =>
        collectPages((page) =>
          unwrapApiPageRequest<DiscussionComment>(() =>
            apiClient.get('/comments', {
              params: {
                targetType,
                targetId,
                parentCommentId: rootComment._id,
                page,
                limit: 100,
                sort: 'oldest',
              },
            })
          )
        )
      )
    );
    return {
      ...roots,
      data: roots.data.flatMap((rootComment, index) => [
        rootComment,
        ...replyGroups[index].data,
      ]),
    };
  },
  comment: (
    targetType: DiscussionTarget,
    targetId: string,
    content: string,
    parentCommentId?: string
  ) =>
    unwrapApiRequest<DiscussionComment>(() =>
      apiClient.post('/comments', {
        targetType,
        targetId,
        content,
        ...(parentCommentId ? { parentCommentId } : {}),
      })
    ),
  updateComment: (comment: DiscussionComment, content: string) =>
    unwrapApiRequest<DiscussionComment>(() =>
      apiClient.patch(`/comments/${comment._id}`, {
        content,
        version: comment.version,
      })
    ),
  removeComment: (id: string) =>
    unwrapApiRequest(() => apiClient.delete(`/comments/${id}`)),
  react: (targetType: DiscussionTarget, targetId: string, type: ReactionType) =>
    unwrapApiRequest(() =>
      apiClient.put(`/reactions/${targetType}/${targetId}`, { type })
    ),
  removeReaction: (targetType: DiscussionTarget, targetId: string) =>
    unwrapApiRequest(() => apiClient.delete(`/reactions/${targetType}/${targetId}`)),
  rating: (targetType: EngagementTarget, targetId: string) =>
    unwrapApiRequest<RatingSummary>(() =>
      apiClient.get(`/ratings/${targetType}/${targetId}/summary`)
    ),
  rate: (
    targetType: EngagementTarget,
    targetId: string,
    score: number,
    review?: string
  ) =>
    unwrapApiRequest(() =>
      apiClient.put(`/ratings/${targetType}/${targetId}`, {
        score,
        ...(review?.trim() ? { review: review.trim() } : {}),
      })
    ),
  removeRating: (targetType: EngagementTarget, targetId: string) =>
    unwrapApiRequest(() => apiClient.delete(`/ratings/${targetType}/${targetId}`)),
  recordView: (targetType: 'recipe' | 'post' | 'video', targetId: string) =>
    unwrapApiRequest(() =>
      apiClient.put(`/view-history/${targetType}/${targetId}`, {})
    ),
  history: () =>
    collectPages((page) =>
      unwrapApiPageRequest<ViewHistoryItem>(() =>
        apiClient.get('/view-history', { params: { page, limit: 50 } })
      )
    ),
  removeHistory: (item: ViewHistoryItem) =>
    unwrapApiRequest(() =>
      apiClient.delete(`/view-history/${item.targetType}/${item.targetId}`)
    ),
  clearHistory: () => unwrapApiRequest(() => apiClient.delete('/view-history')),
};
