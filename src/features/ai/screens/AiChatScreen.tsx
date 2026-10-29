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
import { AiImageAttachmentPicker } from '../components/AiImageAttachmentPicker';
import { AiProcessingStatus } from '../components/AiProcessingStatus';
import { AiMedicalDisclaimer, AiSafetyNotices } from '../components/AiSafetyNotices';
import { useAiChat } from '../hooks';
import { useAiImageAttachment } from '../useAiImageAttachment';

export function AiChatScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const chat = useAiChat(id);
  const attachment = useAiImageAttachment();
  const [content, setContent] = useState('');
  const [useProfile, setUseProfile] = useState(false);
  const [rated, setRated] = useState<string[]>([]);
  const busy =
    chat.send.isPending ||
    chat.create.isPending ||
    attachment.choose.isPending ||
    attachment.upload.isPending;

  const createConversation = () =>
    chat.create.mutate(vi ? 'Trò chuyện mới' : 'New conversation', {
      onSuccess: (conversation) => router.setParams({ id: conversation._id }),
    });

  const submitQuestion = async () => {
    const question =
      content.trim() ||
      (attachment.asset
        ? vi
          ? 'Hãy phân tích hình ảnh này.'
          : 'Please analyze this image.'
        : '');
    if (!id || !question || busy) return;
    try {
      const mediaId = await attachment.uploadIfNeeded();
      await chat.send.mutateAsync({ content: question, useProfile, mediaId });
      setContent('');
      attachment.clear();
    } catch {
      // Mutation errors are rendered below and the attachment stays available to retry.
    }
  };

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
      <AiMedicalDisclaimer vi={vi} />
      <AppButton
        title={vi ? 'Cuộc trò chuyện mới' : 'New conversation'}
        loading={chat.create.isPending}
        disabled={busy}
        onPress={createConversation}
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
                <>
                  <AiMarkdownMessage content={message.content} />
                  <AiSafetyNotices notices={message.safetyNotices} vi={vi} />
                </>
              ) : (
                <>
                  {message.mediaId ? (
                    <AppText color={colors.text.secondary}>
                      {vi ? '📷 Có đính kèm hình ảnh' : '📷 Image attached'}
                    </AppText>
                  ) : null}
                  <AppText selectable>{message.content}</AppText>
                </>
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
          <AiImageAttachmentPicker
            asset={attachment.asset}
            busy={busy}
            vi={vi}
            onChoose={() => attachment.choose.mutate()}
            onClear={attachment.clear}
          />
          <AppInput
            label={vi ? 'Câu hỏi' : 'Question'}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={4000}
            editable={!busy}
          />
          <FeatureState error={chat.create.error} retry={createConversation} />
          <FeatureState
            error={attachment.choose.error}
            retry={() => attachment.choose.mutate()}
          />
          <FeatureState
            error={attachment.upload.error}
            retry={() => void submitQuestion()}
          />
          <FeatureState
            error={chat.send.error}
            retry={() => void submitQuestion()}
          />
          <FeatureState error={chat.feedback.error} />
          {chat.send.isPending ? <AiProcessingStatus vi={vi} /> : null}
          <AppButton
            title={vi ? 'Gửi' : 'Send'}
            loading={chat.send.isPending}
            disabled={busy || (!content.trim() && !attachment.asset)}
            onPress={() => void submitQuestion()}
          />
        </>
      ) : (
        <FeatureState error={chat.create.error} retry={createConversation} />
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
