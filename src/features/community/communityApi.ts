import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
import type {
  CommunityPost,
  CommunityVideo,
  PostComment,
  ReportReason,
  ReportTarget,
  UserReport,
} from './types';
export const communityApi = {
  videos: (mine: boolean) =>
    collectPages((page) =>
      unwrapApiPageRequest<CommunityVideo>(() =>
        apiClient.get(mine ? '/videos/mine' : '/videos', {
          params: { page, limit: 50 },
        })
      )
    ),
  video: (id: string) =>
    unwrapApiRequest<CommunityVideo>(() => apiClient.get('/videos/' + id)),
  createVideo: (input: {
    title: string;
    description?: string;
    videoMediaId: string;
    durationSeconds: number;
    transcript?: string;
    thumbnailMediaId?: string | null;
    categoryIds?: string[];
    tags?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    recipeId?: string | null;
    visibility?: 'public' | 'private' | 'unlisted';
  }) =>
    unwrapApiRequest<CommunityVideo>(() =>
      apiClient.post('/videos', {
        ...input,
        visibility: input.visibility ?? 'public',
      })
    ),
  updateVideo: (
    video: CommunityVideo,
    input: {
      title: string;
      description?: string;
      videoMediaId: string;
      durationSeconds: number;
      transcript?: string;
      thumbnailMediaId?: string | null;
      categoryIds?: string[];
      tags?: string[];
      difficulty?: 'easy' | 'medium' | 'hard';
      recipeId?: string | null;
      visibility?: 'public' | 'private' | 'unlisted';
    }
  ) =>
    unwrapApiRequest<CommunityVideo>(() =>
      apiClient.patch(`/videos/${video._id}`, { ...input, version: video.version })
    ),
  submitVideo: (video: CommunityVideo) =>
    unwrapApiRequest<CommunityVideo>(() =>
      apiClient.post(`/videos/${video._id}/submit`, { version: video.version })
    ),
  removeVideo: (id: string) =>
    unwrapApiRequest(() => apiClient.delete(`/videos/${id}`)),
  archiveVideo: (video: CommunityVideo) =>
    unwrapApiRequest<CommunityVideo>(() =>
      apiClient.post(`/videos/${video._id}/archive`, { version: video.version })
    ),
  relatedVideos: (id: string) =>
    unwrapApiPageRequest<CommunityVideo>(() =>
      apiClient.get(`/videos/${id}/related`, { params: { page: 1, limit: 10 } })
    ),
  updateVideoProgress: (id: string, progressSeconds: number, completed = false) =>
    unwrapApiRequest(() =>
      apiClient.put(`/videos/${id}/progress`, { progressSeconds, completed })
    ),
  generateVideoSummary: (id: string) =>
    unwrapApiRequest<{ summary: string; chapters?: unknown[] }>(() =>
      apiClient.post(`/videos/${id}/generate-summary`, {})
    ),
  posts: (mine: boolean) =>
    collectPages((page) =>
      unwrapApiPageRequest<CommunityPost>(() =>
        apiClient.get(mine ? '/posts/mine' : '/posts', {
          params: { page, limit: 50, postType: 'community' },
        })
      )
    ),
  relatedPosts: (recipeId: string) =>
    unwrapApiPageRequest<CommunityPost>(() =>
      apiClient.get('/posts', {
        params: { page: 1, limit: 10, postType: 'community', recipeId },
      })
    ),
  post: (id: string) =>
    unwrapApiRequest<CommunityPost>(() => apiClient.get(`/posts/${id}`)),
  create: (input: {
    title: string;
    content: string;
    mediaIds?: string[];
    categoryIds?: string[];
    tags?: string[];
    recipeId?: string | null;
    visibility?: 'public' | 'private';
  }) =>
    unwrapApiRequest<CommunityPost>(() =>
      apiClient.post('/posts', {
        ...input,
        postType: 'community',
        visibility: input.visibility ?? 'public',
      })
    ),
  update: (
    id: string,
    version: number,
    input: {
      title: string;
      content: string;
      mediaIds?: string[];
      categoryIds?: string[];
      tags?: string[];
      recipeId?: string | null;
      visibility?: 'public' | 'private';
    }
  ) =>
    unwrapApiRequest<CommunityPost>(() =>
      apiClient.patch(`/posts/${id}`, { ...input, version })
    ),
  submit: (id: string, version: number) =>
    unwrapApiRequest<CommunityPost>(() =>
      apiClient.post(`/posts/${id}/submit`, { version })
    ),
  remove: (id: string) => unwrapApiRequest(() => apiClient.delete(`/posts/${id}`)),
  archivePost: (post: CommunityPost) =>
    unwrapApiRequest<CommunityPost>(() =>
      apiClient.post(`/posts/${post._id}/archive`, { version: post.version })
    ),
  comments: async (targetId: string) => {
    const roots = await collectPages((page) =>
      unwrapApiPageRequest<PostComment>(() =>
        apiClient.get('/comments', {
          params: { targetType: 'post', targetId, page, limit: 100, sort: 'oldest' },
        })
      )
    );
    const replyGroups = await Promise.all(
      roots.data.map((rootComment) =>
        collectPages((page) =>
          unwrapApiPageRequest<PostComment>(() =>
            apiClient.get('/comments', {
              params: {
                targetType: 'post',
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
  comment: (targetId: string, content: string, parentCommentId?: string) =>
    unwrapApiRequest<PostComment>(() =>
      apiClient.post('/comments', {
        targetType: 'post',
        targetId,
        content,
        ...(parentCommentId ? { parentCommentId } : {}),
      })
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
  react: (id: string, remove: boolean, type: 'like' | 'love' | 'helpful') =>
    unwrapApiRequest(() =>
      remove
        ? apiClient.delete(`/reactions/post/${id}`)
        : apiClient.put(`/reactions/post/${id}`, { type })
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
