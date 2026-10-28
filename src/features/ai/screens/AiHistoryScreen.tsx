import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText, SettingsScreenLayout } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useAiChat } from '../hooks';

export function AiHistoryScreen() {
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const chat = useAiChat();
  const conversations = chat.conversations.data?.data ?? [];

  return (
    <SettingsScreenLayout
      title={vi ? 'Lịch sử trò chuyện AI' : 'AI chat history'}
      subtitle={
        vi
          ? 'Mở lại những cuộc trò chuyện trước đây với Mầm AI.'
          : 'Continue your previous conversations with Mầm AI.'
      }
      testID="ai-chat-history"
    >
      <FeatureState
        loading={chat.conversations.isLoading}
        error={chat.conversations.error}
        retry={() => void chat.conversations.refetch()}
      />

      {!chat.conversations.isLoading &&
      !chat.conversations.isError &&
      !conversations.length ? (
        <View style={styles.empty}>
          <AppText variant="heading4">
            {vi ? 'Chưa có cuộc trò chuyện' : 'No conversations yet'}
          </AppText>
          <AppText color={colors.text.secondary}>
            {vi
              ? 'Hãy mở trợ lý AI và gửi câu hỏi đầu tiên.'
              : 'Open the AI assistant and send your first question.'}
          </AppText>
        </View>
      ) : null}

      <View style={styles.list}>
        {conversations.map((conversation) => (
          <Pressable
            key={conversation._id}
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: '/ai', params: { id: conversation._id } })
            }
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.copy}>
              <AppText variant="bodyStrong" numberOfLines={2}>
                {conversation.title}
              </AppText>
              {conversation.lastMessageAt || conversation.updatedAt ? (
                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {new Intl.DateTimeFormat(vi ? 'vi-VN' : 'en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(
                    new Date(conversation.lastMessageAt ?? conversation.updatedAt!)
                  )}
                </AppText>
              ) : null}
            </View>
            <AppText color={colors.primary[700]}>›</AppText>
          </Pressable>
        ))}
      </View>
    </SettingsScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  card: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  copy: { flex: 1, minWidth: 0, gap: spacing.xs },
  pressed: { opacity: 0.72 },
  empty: {
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
});
