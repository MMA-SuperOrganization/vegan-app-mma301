import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
import type {
  CommunityPost,
  PostComment,
  ReportReason,
  ReportTarget,
  UserReport,
} from './types';
export const communityApi = {
  video: (id: string) =>
    unwrapApiRequest<import('./types').CommunityVideo>(() =>
      apiClient.get('/videos/' + id)
    ),
  posts: (mine: boolean) =>
    collectPages((page) =>
      unwrapApiPageRequest<CommunityPost>(() =>
        apiClient.get(mine ? '/posts/mine' : '/posts', {
          params: { page, limit: 50, postType: 'community' },
        })
      )
    ),
  post: (id: string) =>
    unwrapApiRequest<CommunityPost>(() => apiClient.get(`/posts/${id}`)),
  create: (title: string, content: string) =>
    unwrapApiRequest<CommunityPost>(() =>
      apiClient.post('/posts', {
        title,
        content,
        postType: 'community',
        visibility: 'public',
      })
    ),
  update: (id: string, title: string, content: string, version: number) =>
    unwrapApiRequest<CommunityPost>(() =>
      apiClient.patch(`/posts/${id}`, { title, content, version })
    ),
  submit: (id: string, version: number) =>
    unwrapApiRequest<CommunityPost>(() =>
      apiClient.post(`/posts/${id}/submit`, { version })
    ),
  remove: (id: string) => unwrapApiRequest(() => apiClient.delete(`/posts/${id}`)),
  comments: (targetId: string) =>
    collectPages((page) =>
      unwrapApiPageRequest<PostComment>(() =>
        apiClient.get('/comments', {
          params: { targetType: 'post', targetId, page, limit: 100, sort: 'oldest' },
        })
      )
    ),
  comment: (targetId: string, content: string) =>
    unwrapApiRequest<PostComment>(() =>
      apiClient.post('/comments', { targetType: 'post', targetId, content })
    ),
  updateComment: (comment: PostComment, content: string) =>
    unwrapApiRequest<PostComment>(() =>
      apiClient.patch(`/comments/${comment._id}`, {
        content,
        version: comment.version,
      })
    ),
  removeComment: (id: string) =>
    unwrapApiRequest(() => apiClient.delete(`/comments/${id}`)),
  react: (id: string, remove: boolean) =>
    unwrapApiRequest(() =>
      remove
        ? apiClient.delete(`/reactions/post/${id}`)
        : apiClient.put(`/reactions/post/${id}`, { type: 'like' })
    ),
  report: (
    targetType: ReportTarget,
    targetId: string,
    reason: ReportReason,
    description: string
  ) =>
    unwrapApiRequest<UserReport>(() =>
      apiClient.post('/reports', {
        targetType,
        targetId,
        reason,
        ...(description.trim() ? { description: description.trim() } : {}),
      })
    ),
  reports: () =>
    collectPages((page) =>
      unwrapApiPageRequest<UserReport>(() =>
        apiClient.get('/reports/mine', { params: { page, limit: 100 } })
      )
    ),
};
