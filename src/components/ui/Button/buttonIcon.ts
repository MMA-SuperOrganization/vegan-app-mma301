import type { AssetName } from '@/theme';

const normalizeAction = (title: string) =>
  title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .trim();

const actionRules: ReadonlyArray<{
  terms: readonly string[];
  icon: AssetName;
}> = [
  { terms: ['luu binh luan', 'save comment'], icon: 'send' },
  { terms: ['bao cao', 'report'], icon: 'flag' },
  { terms: ['chia se', 'share'], icon: 'share' },
  { terms: ['yeu thich', 'favorite', 'love'], icon: 'heart' },
  { terms: ['huu ich', 'helpful'], icon: 'lightbulb' },
  { terms: ['thich', 'like'], icon: 'thumb-up' },
  { terms: ['binh luan', 'comment'], icon: 'comment' },
  { terms: ['tra loi', 'reply'], icon: 'reply' },
  { terms: ['xem ho so', 'view profile'], icon: 'user' },
  // Cancellation must win over nested actions such as "Hủy sửa" or "Hủy xóa".
  { terms: ['huy', 'dong', 'cancel', 'close'], icon: 'close' },
  { terms: ['xoa', 'delete', 'remove'], icon: 'trash' },
  { terms: ['sua', 'edit', 'update'], icon: 'edit' },
  { terms: ['them anh', 'chon anh', 'image', 'photo'], icon: 'image' },
  { terms: ['gui', 'submit', 'send', 'publish'], icon: 'send' },
  { terms: ['luu', 'save'], icon: 'save' },
  { terms: ['thu lai', 'retry', 'refresh', 'tai lai'], icon: 'refresh' },
  { terms: ['tim', 'search'], icon: 'search' },
  { terms: ['ap dung', 'apply', 'xac nhan', 'confirm'], icon: 'check' },
  { terms: ['them', 'tao', 'add', 'create', 'new'], icon: 'plus' },
  { terms: ['quay lai', 'back'], icon: 'back' },
];

export function inferButtonIcon(title: string): AssetName | undefined {
  const normalizedTitle = normalizeAction(title);
  return actionRules.find(({ terms }) =>
    terms.some((term) => normalizedTitle.includes(term))
  )?.icon;
}
