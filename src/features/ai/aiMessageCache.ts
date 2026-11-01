import type { ApiPage } from '@/services/api';
import type { AiMessage } from './types';

export function appendAiMessages(
  page: ApiPage<AiMessage> | undefined,
  additions: readonly AiMessage[]
): ApiPage<AiMessage> {
  const current = page?.data ?? [];
  const knownIds = new Set(current.map((message) => message._id));
  const uniqueAdditions = additions.filter((message) => {
    if (knownIds.has(message._id)) return false;
    knownIds.add(message._id);
    return true;
  });

  return {
    ...page,
    data: [...current, ...uniqueAdditions],
  };
}
