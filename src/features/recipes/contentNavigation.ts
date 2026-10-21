import type { Href } from 'expo-router';
import type { ContentCardData } from './types';
export function contentHref(
  item: Pick<ContentCardData, '_id' | 'slug' | 'type'>
): Href {
  if (item.type === 'post')
    return { pathname: '/community/post', params: { id: item._id } };
  if (item.type === 'video')
    return { pathname: '/community/video', params: { id: item.slug || item._id } };
  if (item.type === 'food-item')
    return { pathname: '/(discover)/food/[id]', params: { id: item._id } };
  return {
    pathname: '/(discover)/recipe/[id]',
    params: { id: item.slug || item._id },
  };
}
