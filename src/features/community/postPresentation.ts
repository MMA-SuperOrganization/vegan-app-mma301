export function postCopy(title?: string | null, content?: string | null) {
  const cleanTitle = title?.trim() ?? '';
  const cleanContent = content?.trim() ?? '';
  const normalized = (value: string) =>
    value
      .toLocaleLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[.!?]+$/g, '');

  return {
    title: cleanTitle,
    content:
      cleanTitle && normalized(cleanTitle) === normalized(cleanContent)
        ? ''
        : cleanContent,
  };
}
