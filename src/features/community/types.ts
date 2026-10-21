export interface CommunityPost {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  version: number;
  status:
    'draft' | 'pending_review' | 'published' | 'rejected' | 'hidden' | 'deleted';
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
  title: string;
  description?: string;
  summary?: string;
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
