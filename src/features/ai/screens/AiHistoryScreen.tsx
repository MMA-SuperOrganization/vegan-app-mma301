import { useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton, AppIcon, AppText, SettingsScreenLayout } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, shadows, spacing } from '@/theme';
import {
  AI_ROUTES,
  AI_TRANSLATION_KEYS,
  AiDateLocale,
} from '../aiConstants';
import { useAiChat } from '../hooks';

export function AiHistoryScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const historyKeys = AI_TRANSLATION_KEYS.HISTORY;
  const commonKeys = AI_TRANSLATION_KEYS.COMMON;
  const dateLocale = locale === 'vi' ? AiDateLocale.VI : AiDateLocale.EN;
  const chat = useAiChat();
  const conversations = chat.conversations.data?.data ?? [];

  const swipeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx > 35 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 50) {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push(AI_ROUTES.CHAT);
          }
        }
      },
    })
  ).current;

  return (
    <SettingsScreenLayout
      title={t(historyKeys.TITLE)}
      subtitle={t(historyKeys.SUBTITLE)}
      testID="ai-chat-history"
    >
      <View style={styles.swipeContainer} {...swipeResponder.panHandlers}>
        <View style={styles.newSessionCard}>
        <View style={styles.newSessionRow}>
          <View style={styles.mascotBadge}>
            <AppIcon name="mam-companion" size={44} decorative />
          </View>
          <View style={styles.newSessionCopy}>
            <AppText variant="heading5">{t(historyKeys.CTA_TITLE)}</AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {t(historyKeys.CTA_DESCRIPTION)}
            </AppText>
          </View>
        </View>
        <AppButton
          icon="plus"
          title={t(commonKeys.NEW_CONVERSATION_ACTION)}
          onPress={() => router.push(AI_ROUTES.CHAT)}
        />
      </View>

      <FeatureState
        loading={chat.conversations.isLoading}
        error={chat.conversations.error}
        retry={() => void chat.conversations.refetch()}
      />

      {!chat.conversations.isLoading &&
      !chat.conversations.isError &&
      !conversations.length ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <AppIcon
              name="comment"
              size={28}
              color={colors.primary[700]}
              decorative
            />
          </View>
          <AppText variant="heading4" style={styles.centerText}>
            {t(historyKeys.EMPTY_TITLE)}
          </AppText>
          <AppText color={colors.text.secondary} style={styles.centerText}>
            {t(historyKeys.EMPTY_DESCRIPTION)}
          </AppText>
        </View>
      ) : null}

      <View style={styles.list}>
        {conversations.map((conversation) => (
          <Pressable
            key={conversation._id}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: AI_ROUTES.CHAT,
                params: { id: conversation._id },
              })
            }
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.cardIcon}>
              <AppIcon
                name="comment"
                size={20}
                color={colors.primary[700]}
                decorative
              />
            </View>
            <View style={styles.copy}>
              <AppText variant="bodyStrong" numberOfLines={2}>
                {conversation.title}
              </AppText>
              {conversation.lastMessageAt || conversation.updatedAt ? (
                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {new Intl.DateTimeFormat(dateLocale, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(
                    new Date(
                      conversation.lastMessageAt ?? conversation.updatedAt!
                    )
                  )}
                </AppText>
              ) : null}
            </View>
            <AppText variant="heading4" color={colors.primary[700]}>
              ›
            </AppText>
          </Pressable>
        ))}
      </View>
      </View>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    gap: spacing.lg,
  },
  newSessionCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  newSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mascotBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.surface,
  },
  newSessionCopy: {
    flex: 1,
    gap: 2,
  },
  list: { gap: spacing.sm },
  card: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
    ...shadows.sm,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
  },
  copy: { flex: 1, minWidth: 0, gap: spacing.xs },
  pressed: { opacity: 0.72 },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
  },
  centerText: { textAlign: 'center' },
});
