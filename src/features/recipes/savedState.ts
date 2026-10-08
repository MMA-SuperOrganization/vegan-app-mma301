import type { ContentCardData, PageResult, SavedItem } from './types';

export type SavedStateChange = {
  type: 'recipe' | 'post' | 'video';
  id: string;
  saved: boolean;
  target?: ContentCardData;
};

const optimisticSavedItem = (
  change: SavedStateChange,
  userId: string
): SavedItem => ({
  _id: `optimistic-${userId}-${change.type}-${change.id}`,
  targetType: change.type,
  targetId: change.id,
  target: change.target ?? null,
});

export function updateSavedPage(
  page: PageResult<SavedItem> | undefined,
  change: SavedStateChange,
  userId: string
): PageResult<SavedItem> {
  const current = page?.data ?? [];
  const withoutTarget = current.filter(
    (saved) => saved.targetType !== change.type || saved.targetId !== change.id
  );
  if (change.saved) return { ...(page ?? { data: [] }), data: withoutTarget };
  return {
    ...(page ?? { data: [] }),
    data: [optimisticSavedItem(change, userId), ...withoutTarget],
  };
}
