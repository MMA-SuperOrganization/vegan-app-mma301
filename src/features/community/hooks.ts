import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { communityApi } from './communityApi';
import { mediaApi } from '@/features/media/mediaApi';
import type {
  CommunityPost,
  PostComment,
  ReportReason,
  ReportTarget,
} from './types';
import {
  type PostReactionChange,
  type ReactionCacheSnapshot,
  updatePostReactionCache,
} from './reactionState';
export function useCommunityPosts(mine: boolean, limit = 10) {
  const userId = useAuthStore((state) => state.user?.id);
  return useInfiniteQuery({
    queryKey: ['account', userId, 'community', 'posts', mine, limit],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => communityApi.posts(mine, pageParam, limit),
    getNextPageParam: (lastPage) => {
      const page = lastPage.meta?.page ?? 1;
      return lastPage.meta && page < lastPage.meta.totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(userId),
  });
}
export function useRelatedRecipePosts(recipeId?: string) {
  return useQuery({
    queryKey: ['recipes', recipeId, 'related-posts'],
    queryFn: () => communityApi.relatedPosts(recipeId!),
    enabled: Boolean(recipeId),
  });
}
export function useCommunityVideos(mine: boolean) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ['account', userId, 'community', 'videos', mine],
    queryFn: () => communityApi.videos(mine),
    enabled: Boolean(userId),
  });
}
export function useCommunityPost(id?: string) {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const root = ['account', userId, 'community'];
  const refresh = () => client.invalidateQueries({ queryKey: root });
  const post = useQuery({
    queryKey: [...root, 'post', id],
    queryFn: () => communityApi.post(id!),
    enabled: Boolean(userId && id),
  });
  return {
    post,
    media: useQuery({
      queryKey: [...root, 'post', id, 'media', post.data?.mediaIds],
      queryFn: () => Promise.all((post.data?.mediaIds || []).map(mediaApi.asset)),
      enabled: Boolean(userId && id && post.data?.mediaIds?.length),
    }),
    comments: useQuery({
      queryKey: [...root, 'comments', id],
      queryFn: () => communityApi.comments(id!),
      enabled: Boolean(userId && id && post.data?.status === 'published'),
    }),
    save: useMutation({
      mutationFn: ({
        title,
        content,
        mediaIds,
        categoryIds,
        tags,
        foodItemIds,
        recipeId,
        visibility,
        previous,
      }: {
        title: string;
        content: string;
        mediaIds?: string[];
        categoryIds?: string[];
        tags?: string[];
        foodItemIds?: string[];
        recipeId?: string | null;
        visibility?: 'public' | 'private';
        previous?: CommunityPost;
      }) =>
        previous
          ? communityApi.update(previous._id, previous.version, {
              title,
              content,
              mediaIds,
              categoryIds,
              tags,
              foodItemIds,
              recipeId,
              visibility,
            })
          : communityApi.create({
              title,
              content,
              mediaIds,
              categoryIds,
              tags,
              foodItemIds,
              recipeId,
              visibility,
            }),
      onSuccess: refresh,
    }),
    submit: useMutation({
      mutationFn: (post: CommunityPost) =>
        communityApi.submit(post._id, post.version),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: communityApi.remove, onSuccess: refresh }),
    comment: useMutation({
      mutationFn: ({
        content,
        parentCommentId,
      }: {
        content: string;
        parentCommentId?: string;
      }) => communityApi.comment(id!, content, parentCommentId),
      onSuccess: refresh,
    }),
    editComment: useMutation({
      mutationFn: ({
        comment,
        content,
      }: {
        comment: PostComment;
        content: string;
      }) => communityApi.updateComment(comment, content),
      onSuccess: refresh,
    }),
    removeComment: useMutation({
      mutationFn: communityApi.removeComment,
      onSuccess: refresh,
    }),
  };
}

export function usePostReaction() {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const communityRoot = ['account', userId, 'community'] as const;
  const matchesPostCache = (queryKey: readonly unknown[], postId: string) => {
    const underCommunityRoot = communityRoot.every(
      (segment, index) => queryKey[index] === segment
    );
    const section = queryKey[3];
    return (
      underCommunityRoot &&
      (section === 'posts' || (section === 'post' && queryKey[4] === postId))
    );
  };

  return useMutation({
    mutationFn: ({ postId, nextReaction }: PostReactionChange) =>
      communityApi.react(postId, nextReaction === null, nextReaction ?? 'like'),
    onMutate: async (change): Promise<ReactionCacheSnapshot> => {
      const predicate = (query: { queryKey: readonly unknown[] }) =>
        matchesPostCache(query.queryKey, change.postId);
      await client.cancelQueries({ predicate });
      const snapshots = client.getQueriesData({ predicate });

      snapshots.forEach(([queryKey, cached]) => {
        client.setQueryData(queryKey, updatePostReactionCache(cached, change));
      });

      return snapshots;
    },
    onError: (_error, _change, snapshots) => {
      snapshots?.forEach(([queryKey, cached]) =>
        client.setQueryData(queryKey, cached)
      );
    },
  });
}
export function useReports() {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const root = ['account', userId, 'reports'];
  return {
    query: useQuery({
      queryKey: root,
      queryFn: communityApi.reports,
      enabled: Boolean(userId),
    }),
    create: useMutation({
      mutationFn: (input: {
        targetType: ReportTarget;
        targetId: string;
        reason: ReportReason;
        description: string;
      }) =>
        communityApi.report(
          input.targetType,
          input.targetId,
          input.reason,
          input.description
        ),
      onSuccess: () => client.invalidateQueries({ queryKey: root }),
    }),
  };
}
