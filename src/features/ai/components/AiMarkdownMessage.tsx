import Markdown from '@ronradtke/react-native-markdown-display';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, fontFamily, radius, spacing, typography } from '@/theme';
import { aiContentHref, normalizeLegacyAiContentLinks } from '../aiContentLink';

interface AiMarkdownMessageProps {
  content: string;
  onOpenContent?: () => void;
}

/** Renders trusted AI copy with the same typography as the rest of the app. */
export function AiMarkdownMessage({
  content,
  onOpenContent,
}: AiMarkdownMessageProps) {
  const router = useRouter();
  const openLink = useCallback(
    (url: string) => {
      const href = aiContentHref(url);
      if (!href) return true;

      onOpenContent?.();
      router.push(href);
      return false;
    },
    [onOpenContent, router]
  );

  return (
    <Markdown style={markdownStyles} onLinkPress={openLink}>
      {normalizeLegacyAiContentLinks(content)}
    </Markdown>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: colors.text.primary,
    fontFamily: fontFamily.regular,
    fontSize: typography.bodyDefault.fontSize,
    lineHeight: typography.bodyDefault.lineHeight,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: spacing.sm,
  },
  text: {
    color: colors.text.primary,
  },
  heading1: {
    ...typography.heading3,
    color: colors.primary[800],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  heading2: {
    ...typography.heading4,
    color: colors.primary[800],
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  heading3: {
    ...typography.heading5,
    color: colors.primary[800],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  heading4: {
    ...typography.heading5,
    color: colors.primary[800],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  heading5: {
    ...typography.heading6,
    color: colors.primary[800],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  heading6: {
    ...typography.heading6,
    color: colors.primary[800],
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  strong: {
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
  em: {
    fontFamily: fontFamily.italic,
    fontStyle: 'italic',
  },
  bullet_list: {
    marginBottom: spacing.sm,
  },
  ordered_list: {
    marginBottom: spacing.sm,
  },
  list_item: {
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  bullet_list_icon: {
    color: colors.primary[700],
    marginLeft: 0,
    marginRight: spacing.sm,
  },
  ordered_list_icon: {
    color: colors.primary[700],
    fontFamily: fontFamily.semiBold,
    marginLeft: 0,
    marginRight: spacing.sm,
  },
  link: {
    color: colors.text.link,
    textDecorationLine: 'underline',
  },
  blockquote: {
    backgroundColor: colors.background.surface,
    borderColor: colors.primary[500],
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    marginVertical: spacing.xs,
    marginLeft: 0,
    paddingHorizontal: spacing.sm,
  },
  code_inline: {
    color: colors.primary[800],
    backgroundColor: colors.background.muted,
    borderColor: colors.border.default,
    borderWidth: 1,
    borderRadius: radius.sm,
    fontFamily: 'monospace',
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  code_block: {
    color: colors.text.primary,
    backgroundColor: colors.background.muted,
    borderColor: colors.border.default,
    borderWidth: 1,
    borderRadius: radius.md,
    fontFamily: 'monospace',
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  fence: {
    color: colors.text.primary,
    backgroundColor: colors.background.muted,
    borderColor: colors.border.default,
    borderWidth: 1,
    borderRadius: radius.md,
    fontFamily: 'monospace',
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  hr: {
    backgroundColor: colors.border.default,
    height: 1,
    marginVertical: spacing.md,
  },
  table: {
    borderColor: colors.border.default,
    borderWidth: 1,
    borderRadius: radius.sm,
    marginVertical: spacing.sm,
  },
  tr: {
    borderBottomColor: colors.border.default,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  th: {
    flex: 1,
    backgroundColor: colors.background.muted,
    padding: spacing.sm,
  },
  td: {
    flex: 1,
    padding: spacing.sm,
  },
});
