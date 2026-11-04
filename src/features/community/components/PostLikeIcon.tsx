import { AppIcon } from '@/components';
import { colors } from '@/theme';

export function PostLikeIcon({ liked }: { liked: boolean }) {
  return (
    <AppIcon
      name={liked ? 'heart-filled' : 'heart'}
      size={20}
      color={liked ? colors.primary[700] : colors.text.secondary}
      decorative
    />
  );
}
