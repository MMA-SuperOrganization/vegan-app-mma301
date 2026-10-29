import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';

import { AppIcon, AppInput, AppText, BottomSheet, Toggle } from '@/components';
import {
  FeatureState,
  getFeatureErrorMessage,
} from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { useKeyboardInsets } from '@/hooks';
import { colors, coreTokens, radius, shadows, spacing } from '@/theme';
import { useAiChat } from '../hooks';
import { useAiImageAttachment } from '../useAiImageAttachment';
import { AiImageAttachmentPicker } from './AiImageAttachmentPicker';
import { AiMarkdownMessage } from './AiMarkdownMessage';
import { AiProcessingStatus } from './AiProcessingStatus';
import { AiMedicalDisclaimer, AiSafetyNotices } from './AiSafetyNotices';

const WIDGET_SIZE = 64;
const SUGGESTIONS = {
  vi: [
    'Gợi ý bữa tối giàu đạm',
    'Tôi nên ăn gì sau khi tập?',
    'Lên thực đơn chay 3 ngày',
  ],
  en: [
    'Suggest a high-protein dinner',
    'What should I eat after a workout?',
    'Plan three days of vegan meals',
  ],
};

export function AiChatWidget() {
  const insets = useSafeAreaInsets();
  const [rootSegment] = useSegments();
  const vi = useTranslation().locale === 'vi';
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);
  const userId = useAuthStore((state) => state.user?.id);
  const onboardingCompleted = useAuthStore(
    (state) => state.user?.onboardingCompleted
  );
  const [visible, setVisible] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [content, setContent] = useState('');
  const [useProfile, setUseProfile] = useState(false);
  const [lastAction, setLastAction] = useState<'submit' | 'new'>('submit');
  const scrollRef = useRef<ScrollView>(null);
  const keyboard = useKeyboardInsets();
  const chat = useAiChat(conversationId);
  const attachment = useAiImageAttachment();
  const busy =
    chat.create.isPending ||
    chat.send.isPending ||
    attachment.choose.isPending ||
    attachment.upload.isPending;
  const messages = chat.messages.data?.data ?? [];
  const launcherBottom =
    Math.max(insets.bottom, spacing.lg) +
    (rootSegment === '(tabs)'
      ? coreTokens.navigation.tabBarHeight + spacing.lg
      : spacing.lg);

  useEffect(() => {
    setVisible(false);
    setConversationId(undefined);
    setContent('');
    setUseProfile(false);
    setLastAction('submit');
  }, [userId]);

  useEffect(() => {
    if (conversationId || !chat.conversations.data?.data.length) return;
    setConversationId(chat.conversations.data.data[0]._id);
  }, [chat.conversations.data?.data, conversationId]);

  useEffect(() => {
    if (!visible) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length, visible]);

  useEffect(() => {
    if (!visible || !keyboard.visible) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [keyboard.overlap, keyboard.visible, visible]);

  if (!isAuthenticated || !onboardingCompleted || isRestoringSession) return null;

  const submitQuestion = async () => {
    const question =
      content.trim() ||
      (attachment.asset
        ? vi
          ? 'Hãy phân tích hình ảnh này.'
          : 'Please analyze this image.'
        : '');
    if (!question || busy) return;

    setLastAction('submit');
    try {
      let targetConversationId = conversationId;
      if (!targetConversationId) {
        const conversation = await chat.create.mutateAsync(
          vi ? 'Hỏi trợ lý AI' : 'Ask AI assistant'
        );
        targetConversationId = conversation._id;
        setConversationId(targetConversationId);
      }

      const mediaId = await attachment.uploadIfNeeded();
      await chat.send.mutateAsync({
        content: question,
        useProfile,
        mediaId,
        targetConversationId,
      });
      setContent('');
      attachment.clear();
    } catch {
      // React Query exposes the failure through FeatureState in the panel.
    }
  };

  const closePanel = () => {
    chat.create.reset();
    chat.send.reset();
    attachment.clear();
    setVisible(false);
  };

  const retryChatQueries = () => {
    void chat.conversations.refetch();
    if (conversationId) void chat.messages.refetch();
  };

  const queryError = chat.conversations.error || chat.messages.error;
  const actionError =
    chat.create.error || attachment.upload.error || chat.send.error;
  const actionErrorCode = (actionError as { code?: string } | null)?.code;
  const loadingChat =
    chat.conversations.isLoading ||
    (Boolean(conversationId) && chat.messages.isLoading);

  const startNewConversation = async () => {
    setLastAction('new');
    try {
      const conversation = await chat.create.mutateAsync(
        vi ? 'Trò chuyện mới' : 'New conversation'
      );
      setConversationId(conversation._id);
      setContent('');
      attachment.clear();
    } catch {
      // React Query exposes the failure through FeatureState in the panel.
    }
  };

  const updateContent = (value: string) => {
    if (chat.send.error) chat.send.reset();
    setContent(value);
  };

  const chooseSuggestion = (suggestion: string) => {
    chat.send.reset();
    setContent(suggestion);
  };

  const headerActions = (
    <View style={styles.headerActions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={vi ? 'Bắt đầu trò chuyện mới' : 'Start a new chat'}
        disabled={busy}
        onPress={() => void startNewConversation()}
        style={({ pressed }) => [
          styles.newChatButton,
          pressed && styles.controlPressed,
          busy && styles.controlDisabled,
        ]}
      >
        <AppIcon name="spark" size={18} color={colors.primary[700]} decorative />
        <AppText variant="bodyStrong">{vi ? 'Mới' : 'New'}</AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={vi ? 'Đóng trợ lý AI' : 'Close AI assistant'}
        onPress={closePanel}
        hitSlop={8}
        style={({ pressed }) => [
          styles.closeButton,
          pressed && styles.controlPressed,
        ]}
      >
        <AppIcon name="close" size={20} color={colors.primary[700]} decorative />
      </Pressable>
    </View>
  );

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={vi ? 'Mở trợ lý AI' : 'Open AI assistant'}
        accessibilityHint={
          vi
            ? 'Mở cửa sổ trò chuyện trượt lên từ phía dưới'
            : 'Opens the chat panel from the bottom'
        }
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.launcher,
          { bottom: launcherBottom },
          pressed && styles.launcherPressed,
        ]}
      >
        <AppIcon name="mam-companion" size={54} decorative />
        <View style={styles.aiBadge}>
          <AppText style={styles.aiBadgeText}>AI</AppText>
        </View>
      </Pressable>

      <BottomSheet
        visible={visible}
        title={vi ? 'Trợ lý AI' : 'AI assistant'}
        onClose={closePanel}
        tall
        height="92%"
        headerAction={headerActions}
        showFooterClose={false}
      >
        <View style={styles.chatPanel}>
          <FeatureState
            loading={loadingChat}
            error={queryError}
            retry={queryError ? retryChatQueries : undefined}
          />

          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {!loadingChat && messages.length === 0 && !actionError ? (
              <View style={styles.welcome}>
                <View style={styles.mascotHalo}>
                  <AppIcon name="mam-companion" size={76} decorative />
                </View>
                <AppText variant="heading3" style={styles.centerText}>
                  {vi ? 'Bạn muốn hỏi gì hôm nay?' : 'What can I help with?'}
                </AppText>
                <AppText color={colors.text.secondary} style={styles.centerText}>
                  {vi
                    ? 'Hỏi về dinh dưỡng, món chay hoặc cách lên thực đơn.'
                    : 'Ask about nutrition, vegan dishes, or meal planning.'}
                </AppText>
                <View style={styles.suggestions}>
                  {SUGGESTIONS[vi ? 'vi' : 'en'].map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      accessibilityRole="button"
                      onPress={() => chooseSuggestion(suggestion)}
                      style={({ pressed }) => [
                        styles.suggestion,
                        pressed && styles.controlPressed,
                      ]}
                    >
                      <AppIcon
                        name="spark"
                        size={16}
                        color={colors.primary[700]}
                        decorative
                      />
                      <AppText style={styles.suggestionText}>{suggestion}</AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {messages.map((message) => {
              const fromUser = message.role === 'user';
              return (
                <View
                  key={message._id}
                  style={[styles.messageRow, fromUser && styles.userMessageRow]}
                >
                  {!fromUser ? (
                    <View style={styles.aiAvatar}>
                      <AppIcon name="mam-companion" size={30} decorative />
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.message,
                      fromUser ? styles.userMessage : styles.aiMessage,
                    ]}
                  >
                    {!fromUser ? (
                      <AppText variant="heading6" color={colors.primary[700]}>
                        Mầm AI
                      </AppText>
                    ) : null}
                    {fromUser ? (
                      <>
                        {message.mediaId ? (
                          <AppText color={colors.primary[100]}>
                            {vi ? '📷 Có đính kèm hình ảnh' : '📷 Image attached'}
                          </AppText>
                        ) : null}
                        <AppText selectable color={colors.text.inverse}>
                          {message.content}
                        </AppText>
                      </>
                    ) : (
                      <>
                        <AiMarkdownMessage
                          content={message.content}
                          onOpenContent={closePanel}
                        />
                        <AiSafetyNotices notices={message.safetyNotices} vi={vi} />
                      </>
                    )}
                  </View>
                </View>
              );
            })}

            {busy ? (
              <View style={styles.messageRow}>
                <View style={styles.aiAvatar}>
                  <AppIcon name="mam-companion" size={30} decorative />
                </View>
                <View style={styles.progressMessage}>
                  <AiProcessingStatus vi={vi} />
                </View>
              </View>
            ) : null}

            {actionError ? (
              <View style={styles.errorNotice} accessibilityRole="alert">
                <View style={styles.errorIcon}>
                  <AppText variant="bodyStrong" color={colors.status.danger}>
                    !
                  </AppText>
                </View>
                <View style={styles.errorCopy}>
                  <AppText variant="bodyStrong" color={colors.status.danger}>
                    {actionErrorCode === 'AI_AUTHENTICATION_ERROR'
                      ? vi
                        ? 'AI chưa thể kết nối'
                        : 'AI cannot connect yet'
                      : vi
                        ? 'Chưa gửi được câu hỏi'
                        : 'Your question was not sent'}
                  </AppText>
                  <AppText color={colors.text.secondary} style={styles.errorMessage}>
                    {getFeatureErrorMessage(actionError, vi ? 'vi' : 'en')}
                  </AppText>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      void (lastAction === 'new'
                        ? startNewConversation()
                        : submitQuestion())
                    }
                    style={({ pressed }) => [
                      styles.retryButton,
                      pressed && styles.controlPressed,
                    ]}
                  >
                    <AppText variant="bodyStrong" color={colors.primary[700]}>
                      {vi ? 'Thử lại' : 'Retry'}
                    </AppText>
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={vi ? 'Ẩn thông báo lỗi' : 'Dismiss error'}
                  onPress={() => {
                    chat.create.reset();
                    chat.send.reset();
                  }}
                  hitSlop={8}
                >
                  <AppIcon
                    name="close"
                    size={18}
                    color={colors.status.danger}
                    decorative
                  />
                </Pressable>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.composerArea}>
            <Toggle
              label={
                vi
                  ? 'Cá nhân hóa theo hồ sơ dinh dưỡng'
                  : 'Personalize with my nutrition profile'
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
            <FeatureState
              error={attachment.choose.error}
              retry={() => attachment.choose.mutate()}
            />
            <View style={styles.composer}>
              <AppInput
                value={content}
                onChangeText={updateContent}
                placeholder={vi ? 'Nhắn cho Mầm AI…' : 'Message Mầm AI…'}
                multiline
                maxLength={4000}
                editable={!busy}
                returnKeyType="send"
                blurOnSubmit={false}
                style={styles.input}
                inputStyle={styles.inputText}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={vi ? 'Gửi câu hỏi' : 'Send question'}
                accessibilityState={{
                  disabled: busy || (!content.trim() && !attachment.asset),
                  busy,
                }}
                disabled={busy || (!content.trim() && !attachment.asset)}
                onPress={() => void submitQuestion()}
                style={({ pressed }) => [
                  styles.sendButton,
                  (busy || (!content.trim() && !attachment.asset)) &&
                    styles.sendButtonDisabled,
                  pressed && styles.sendButtonPressed,
                ]}
              >
                {chat.send.isPending ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <AppText style={styles.sendIcon}>↑</AppText>
                )}
              </Pressable>
            </View>
            <AiMedicalDisclaimer vi={vi} />
          </View>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  launcher: {
    position: 'absolute',
    right: spacing.xl,
    zIndex: 20,
    width: WIDGET_SIZE,
    height: WIDGET_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.surface,
    borderWidth: 2,
    borderColor: colors.primary[300],
    ...shadows.lg,
  },
  launcherPressed: { opacity: 0.82, transform: [{ scale: 0.96 }] },
  aiBadge: {
    position: 'absolute',
    right: -3,
    bottom: -2,
    minWidth: 25,
    height: 22,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[700],
    borderWidth: 2,
    borderColor: colors.background.surface,
  },
  aiBadgeText: { color: colors.text.inverse, fontSize: 10, fontWeight: '700' },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  newChatButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  controlPressed: { opacity: 0.72 },
  controlDisabled: { opacity: 0.45 },
  chatPanel: { flex: 1, minHeight: 0, gap: spacing.sm },
  messages: { flex: 1, minHeight: 0 },
  messagesContent: {
    flexGrow: 1,
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  welcome: {
    flex: 1,
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mascotHalo: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    marginBottom: spacing.xs,
  },
  centerText: { textAlign: 'center' },
  suggestions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  suggestion: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  suggestionText: { flex: 1 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  userMessageRow: { justifyContent: 'flex-end' },
  aiAvatar: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
  },
  message: {
    maxWidth: '82%',
    padding: spacing.md,
    borderRadius: radius.xl,
    gap: spacing.xs,
  },
  userMessage: {
    backgroundColor: colors.primary[700],
    borderBottomRightRadius: spacing.xs,
  },
  aiMessage: {
    backgroundColor: colors.primary[50],
    borderBottomLeftRadius: spacing.xs,
  },
  progressMessage: { flex: 1, maxWidth: '86%' },
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.danger,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  errorIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  errorCopy: { flex: 1, gap: spacing.xs },
  errorMessage: { fontSize: 12 },
  retryButton: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
  composerArea: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1 },
  inputText: { maxHeight: 96 },
  sendButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
  sendButtonDisabled: { backgroundColor: colors.background.muted },
  sendButtonPressed: { transform: [{ scale: 0.95 }] },
  sendIcon: {
    color: colors.text.inverse,
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '700',
  },
});
