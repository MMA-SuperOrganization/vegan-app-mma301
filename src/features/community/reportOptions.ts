import type { ReportReason, ReportTarget } from './types';

export const reportTargets: ReportTarget[] = [
  'recipe',
  'post',
  'video',
  'comment',
  'user',
];

export const reportReasons: Array<{
  value: ReportReason;
  vi: string;
  en: string;
}> = [
  { value: 'spam', vi: 'Spam', en: 'Spam' },
  { value: 'harmful', vi: 'Có hại', en: 'Harmful' },
  { value: 'misinformation', vi: 'Thông tin sai', en: 'Misinformation' },
  { value: 'harassment', vi: 'Quấy rối', en: 'Harassment' },
  { value: 'copyright', vi: 'Bản quyền', en: 'Copyright' },
  { value: 'other', vi: 'Khác', en: 'Other' },
];

export const reportTargetLabels: Record<
  ReportTarget,
  { vi: string; en: string }
> = {
  recipe: { vi: 'Công thức', en: 'Recipe' },
  post: { vi: 'Bài viết', en: 'Post' },
  video: { vi: 'Video', en: 'Video' },
  comment: { vi: 'Bình luận', en: 'Comment' },
  user: { vi: 'Người dùng', en: 'User' },
};
