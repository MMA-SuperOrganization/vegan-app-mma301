import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  Toggle,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { AiMarkdownMessage } from '../components/AiMarkdownMessage';
import { useAiChat } from '../hooks';

export function AiChatScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const chat = useAiChat(id);
  const [content, setContent] = useState('');
  const [useProfile, setUseProfile] = useState(false);
  const [rated, setRated] = useState<string[]>([]);
  const busy = chat.send.isPending || chat.create.isPending;
  return (
    <ScreenWrapper
      scrollable
      header={
        <CustomHeader
          title={vi ? 'Trợ lý AI' : 'AI assistant'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
      contentContainerStyle={styles.screen}
    >
      <AppText color={colors.text.secondary}>
        {vi
          ? 'AI có thể nhầm. Kiểm tra thông tin trước khi áp dụng; không thay thế tư vấn chuyên môn.'
          : 'AI can make mistakes. Review its answers; they do not replace professional advice.'}
      </AppText>
      <AppButton
        title={vi ? 'Cuộc trò chuyện mới' : 'New conversation'}
        loading={chat.create.isPending}
        disabled={busy}
        onPress={() =>
          chat.create.mutate(vi ? 'Trò chuyện mới' : 'New conversation', {
            onSuccess: (conversation) => router.setParams({ id: conversation._id }),
          })
        }
      />
      <FeatureState
        loading={chat.conversations.isLoading}
        error={chat.conversations.error}
        retry={() => void chat.conversations.refetch()}
      />
      {!id && chat.conversations.data?.data.length === 0 ? (
        <AppText>
          {vi ? 'Chưa có cuộc trò chuyện.' : 'No conversations yet.'}
        </AppText>
      ) : null}
      {!id
        ? chat.conversations.data?.data.map((conversation) => (
            <AppButton
              key={conversation._id}
              title={conversation.title}
              variant="outline"
              onPress={() => router.setParams({ id: conversation._id })}
            />
          ))
        : null}
      {id ? (
        <>
          <AppButton
            title={vi ? 'Lịch sử trò chuyện' : 'Conversation history'}
            variant="ghost"
            disabled={busy}
            onPress={() => router.replace('/ai')}
          />
          <FeatureState
            loading={chat.messages.isLoading}
            error={chat.messages.error}
            retry={() => void chat.messages.refetch()}
          />
          {chat.messages.data?.data.length === 0 ? (
            <AppText>
              {vi ? 'Gửi câu hỏi để bắt đầu.' : 'Send a question to begin.'}
            </AppText>
          ) : null}
          {chat.messages.data?.data.map((message) => (
            <View
              key={message._id}
              style={[styles.message, message.role === 'user' && styles.own]}
            >
              <AppText variant="bodyStrong">
                {message.role === 'user' ? (vi ? 'Bạn' : 'You') : 'AI'}
              </AppText>
              {message.role === 'assistant' ? (
                <AiMarkdownMessage content={message.content} />
              ) : (
                <AppText selectable>{message.content}</AppText>
              )}
              {message.role === 'assistant' && (message.aiRunId || message.runId) ? (
                <View style={styles.actions}>
                  {[true, false].map((helpful) => (
                    <AppButton
                      key={String(helpful)}
                      title={
                        helpful
                          ? vi
                            ? 'Hữu ích'
                            : 'Helpful'
                          : vi
                            ? 'Chưa hữu ích'
                            : 'Not helpful'
                      }
                      variant="ghost"
                      fullWidth={false}
                      disabled={
                        chat.feedback.isPending || rated.includes(message._id)
                      }
                      onPress={() =>
                        chat.feedback.mutate(
                          { runId: (message.aiRunId || message.runId)!, helpful },
                          {
                            onSuccess: () =>
                              setRated((current) => [...current, message._id]),
                          }
                        )
                      }
                    />
                  ))}
                </View>
              ) : null}
            </View>
          ))}
          <Toggle
            label={
              vi
                ? 'Sử dụng hồ sơ dinh dưỡng cho câu trả lời'
                : 'Use my nutrition profile for this answer'
            }
            value={useProfile}
            onValueChange={setUseProfile}
            disabled={busy}
          />
          <AppInput
            label={vi ? 'Câu hỏi' : 'Question'}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={4000}
            editable={!busy}
          />
          <FeatureState
            error={chat.create.error || chat.send.error || chat.feedback.error}
          />
          <AppButton
            title={vi ? 'Gửi' : 'Send'}
            loading={chat.send.isPending}
            disabled={busy || !content.trim()}
            onPress={() =>
              chat.send.mutate(
                { content: content.trim(), useProfile },
                { onSuccess: () => setContent('') }
              )
            }
          />
        </>
      ) : (
        <FeatureState error={chat.create.error} />
      )}
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.lg },
  message: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
    backgroundColor: colors.background.surface,
  },
  own: { backgroundColor: colors.background.selected },
  actions: { flexDirection: 'row', flexWrap: 'wrap' },
});
