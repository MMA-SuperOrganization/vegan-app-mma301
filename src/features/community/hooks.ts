import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { communityApi } from './communityApi';
import type {
  CommunityPost,
  PostComment,
  ReportReason,
  ReportTarget,
} from './types';
export function useCommunityPosts(mine: boolean) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ['account', userId, 'community', 'posts', mine],
    queryFn: () => communityApi.posts(mine),
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
    comments: useQuery({
      queryKey: [...root, 'comments', id],
      queryFn: () => communityApi.comments(id!),
      enabled: Boolean(userId && id && post.data?.status === 'published'),
    }),
    save: useMutation({
      mutationFn: ({
        title,
        content,
        previous,
      }: {
        title: string;
        content: string;
        previous?: CommunityPost;
      }) =>
        previous
          ? communityApi.update(previous._id, title, content, previous.version)
          : communityApi.create(title, content),
      onSuccess: refresh,
    }),
    submit: useMutation({
      mutationFn: (post: CommunityPost) =>
        communityApi.submit(post._id, post.version),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: communityApi.remove, onSuccess: refresh }),
    comment: useMutation({
      mutationFn: (content: string) => communityApi.comment(id!, content),
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
    react: useMutation({
      mutationFn: (remove: boolean) => communityApi.react(id!, remove),
      onSuccess: refresh,
    }),
  };
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
