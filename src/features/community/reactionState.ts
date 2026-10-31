import type { InfiniteData, QueryKey } from '@tanstack/react-query';

import type { ReactionType } from '@/features/engagement/engagementApi';

import type { CommunityPost } from './types';

export interface PostReactionChange {
  postId: string;
  nextReaction: ReactionType | null;
}

export type ReactionCacheSnapshot = Array<[QueryKey, unknown]>;

export function applyPostReaction(
  post: CommunityPost,
  nextReaction: ReactionType | null
): CommunityPost {
  const previousReaction = post.reacted ?? null;
  const countDelta = previousReaction
    ? nextReaction
      ? 0
      : -1
    : nextReaction
      ? 1
      : 0;

  return {
    ...post,
    reacted: nextReaction,
    reactionCount: Math.max(0, (post.reactionCount ?? 0) + countDelta),
  };
}

export function updatePostReactionCache(
  cached: unknown,
  change: PostReactionChange
): unknown {
  if (!cached || typeof cached !== 'object') return cached;

  const post = cached as CommunityPost;
  if (post._id === change.postId) {
    return applyPostReaction(post, change.nextReaction);
  }

  const infinite = cached as InfiniteData<{ data: CommunityPost[] }>;
  if (!Array.isArray(infinite.pages)) return cached;

  return {
    ...infinite,
    pages: infinite.pages.map((page) => ({
      ...page,
      data: page.data.map((pagePost) =>
        pagePost._id === change.postId
          ? applyPostReaction(pagePost, change.nextReaction)
          : pagePost
      ),
    })),
  };
}
