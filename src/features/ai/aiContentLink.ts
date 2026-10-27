import type { Href } from 'expo-router';

const AI_CONTENT_LINK = /^veganapp:\/\/\/?(recipe|food)\/([a-f\d]{24})\/?$/i;

export function aiContentHref(url: string): Href | null {
  const match = AI_CONTENT_LINK.exec(url.trim());
  if (!match) return null;

  const [, contentType, id] = match;
  return contentType.toLowerCase() === 'recipe'
    ? { pathname: '/(discover)/recipe/[id]', params: { id } }
    : { pathname: '/(discover)/food/[id]', params: { id } };
}

const LEGACY_BOLD_RECIPE =
  /\*\*([^*\n]+)\*\*\s*\(\s*ID\s*:\s*`?([a-f\d]{24})`?\s*\)/gi;
const LEGACY_LIST_RECIPE =
  /(^|\n)(\s*[-*+]\s+)([^\n(]+?)\s*\(\s*ID\s*:\s*`?([a-f\d]{24})`?\s*\)/gi;

export function normalizeLegacyAiContentLinks(content: string): string {
  return content
    .replace(
      LEGACY_BOLD_RECIPE,
      (_match, title: string, id: string) =>
        `**[${title.trim()}](veganapp://recipe/${id})**`
    )
    .replace(
      LEGACY_LIST_RECIPE,
      (_match, lineStart: string, marker: string, title: string, id: string) =>
        `${lineStart}${marker}[${title.trim()}](veganapp://recipe/${id})`
    );
}
