export interface CommunityPost {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  mediaIds?: string[];
  categoryIds?: string[];
  tags?: string[];
  foodItemIds?: string[];
  recipeId?: string | null;
  visibility?: 'public' | 'private';
  media?: Array<{
    _id?: string;
    url?: string;
    downloadUrl?: string;
  }>;
  version: number;
  status:
    | 'draft'
    | 'pending_review'
    | 'published'
    | 'rejected'
    | 'archived'
    | 'hidden'
    | 'deleted';
  rejectionReason?: string;
  reactionCount?: number;
  commentCount?: number;
  reacted?: string | null;
}
export interface PostComment {
  _id: string;
  content: string;
  authorId: string;
  version: number;
  parentCommentId?: string;
}
export interface CommunityVideo {
  _id: string;
  authorId?: string;
  title: string;
  description?: string;
  summary?: string;
  transcript?: string;
  durationSeconds?: number;
  videoMediaId?: string;
  thumbnailMediaId?: string | null;
  thumbnailUrl?: string;
  categoryIds?: string[];
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  recipeId?: string | null;
  visibility?: 'public' | 'private' | 'unlisted';
  progressSeconds?: number;
  completed?: boolean;
  progress?: {
    progressSeconds: number;
    completed: boolean;
    lastProgressAt?: string | null;
  } | null;
  reactionCount?: number;
  commentCount?: number;
  reacted?: string | null;
  version: number;
  status:
    | 'draft'
    | 'pending_review'
    | 'published'
    | 'rejected'
    | 'archived'
    | 'hidden'
    | 'deleted';
  rejectionReason?: string;
  saved?: boolean;
  playback?: { downloadUrl?: string };
}
export type ReportReason =
  'spam' | 'harmful' | 'misinformation' | 'harassment' | 'copyright' | 'other';
export type ReportTarget = 'recipe' | 'post' | 'video' | 'comment' | 'user';
export interface UserReport {
  _id: string;
  targetType: ReportTarget;
  targetId: string;
  reason: ReportReason;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  resolution?: string;
  description?: string;
  assignedAdminId?: string;
}
