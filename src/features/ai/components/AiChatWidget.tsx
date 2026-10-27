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

import {
  AppButton,
  AppIcon,
  AppInput,
  AppText,
  BottomSheet,
  Toggle,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { colors, coreTokens, radius, shadows, spacing } from '@/theme';
import { useAiChat } from '../hooks';

const WIDGET_SIZE = 64;

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
  const scrollRef = useRef<ScrollView>(null);
  const chat = useAiChat(conversationId);
  const busy = chat.create.isPending || chat.send.isPending;
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
  }, [userId]);

  useEffect(() => {
    if (conversationId || !chat.conversations.data?.data.length) return;
    setConversationId(chat.conversations.data.data[0]._id);
  }, [chat.conversations.data?.data, conversationId]);

  useEffect(() => {
    if (!visible) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length, visible]);

  if (!isAuthenticated || !onboardingCompleted || isRestoringSession) return null;

  const submitQuestion = async () => {
    const question = content.trim();
    if (!question || busy) return;

    try {
      let targetConversationId = conversationId;
      if (!targetConversationId) {
        const conversation = await chat.create.mutateAsync(
          vi ? 'Hỏi trợ lý AI' : 'Ask AI assistant'
        );
        targetConversationId = conversation._id;
        setConversationId(targetConversationId);
      }

      await chat.send.mutateAsync({
        content: question,
        useProfile,
        targetConversationId,
      });
      setContent('');
    } catch (error) {
      if ((error as { code?: string })?.code?.startsWith('AI_')) {
        setContent('');
      }
      // React Query exposes the failure through FeatureState in the panel.
    }
  };

  const closePanel = () => {
    chat.create.reset();
    chat.send.reset();
    setVisible(false);
  };

  const retryChatQueries = () => {
    void chat.conversations.refetch();
    if (conversationId) void chat.messages.refetch();
  };

  const queryError = chat.conversations.error || chat.messages.error;
  const loadingChat =
    chat.conversations.isLoading ||
    (Boolean(conversationId) && chat.messages.isLoading);

  const startNewConversation = async () => {
    try {
      const conversation = await chat.create.mutateAsync(
        vi ? 'Trò chuyện mới' : 'New conversation'
      );
      setConversationId(conversation._id);
      setContent('');
    } catch {
      // React Query exposes the failure through FeatureState in the panel.
    }
  };

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
      >
        <View style={styles.chatPanel}>
          <View style={styles.toolbar}>
            <AppText color={colors.text.secondary} style={styles.disclaimer}>
              {vi
                ? 'AI có thể nhầm. Hãy kiểm tra thông tin quan trọng.'
                : 'AI can make mistakes. Check important information.'}
            </AppText>
            <AppButton
              title={vi ? 'Cuộc trò chuyện mới' : 'New chat'}
              variant="ghost"
              fullWidth={false}
              disabled={busy}
              onPress={() => void startNewConversation()}
            />
          </View>

          <FeatureState
            loading={loadingChat}
            error={queryError}
            retry={queryError ? retryChatQueries : undefined}
          />
          <FeatureState error={chat.create.error || chat.send.error} />

          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {!chat.conversations.isLoading && messages.length === 0 ? (
              <View style={styles.welcome}>
                <AppIcon name="mam-companion" size={84} decorative />
                <AppText variant="heading4" style={styles.centerText}>
                  {vi ? 'Bạn muốn hỏi gì hôm nay?' : 'What can I help with?'}
                </AppText>
                <AppText color={colors.text.secondary} style={styles.centerText}>
                  {vi
                    ? 'Hỏi về dinh dưỡng, món chay hoặc cách lên thực đơn.'
                    : 'Ask about nutrition, vegan dishes, or meal planning.'}
                </AppText>
              </View>
            ) : null}

            {messages.map((message) => (
              <View
                key={message._id}
                style={[
                  styles.message,
                  message.role === 'user' ? styles.userMessage : styles.aiMessage,
                ]}
              >
                <AppText variant="bodyStrong">
                  {message.role === 'user' ? (vi ? 'Bạn' : 'You') : 'AI'}
                </AppText>
                <AppText selectable>{message.content}</AppText>
              </View>
            ))}

            {busy ? (
              <View style={[styles.message, styles.aiMessage, styles.pending]}>
                <ActivityIndicator color={colors.primary[700]} />
                <AppText color={colors.text.secondary}>
                  {vi ? 'AI đang trả lời…' : 'AI is responding…'}
                </AppText>
              </View>
            ) : null}
          </ScrollView>

          <Toggle
            label={
              vi
                ? 'Dùng hồ sơ dinh dưỡng cho câu trả lời này'
                : 'Use my nutrition profile for this answer'
            }
            value={useProfile}
            onValueChange={setUseProfile}
            disabled={busy}
          />
          <View style={styles.composer}>
            <AppInput
              value={content}
              onChangeText={setContent}
              placeholder={vi ? 'Nhập câu hỏi của bạn…' : 'Type your question…'}
              multiline
              maxLength={4000}
              editable={!busy}
              returnKeyType="send"
              style={styles.input}
            />
            <AppButton
              title={vi ? 'Gửi' : 'Send'}
              loading={chat.send.isPending}
              disabled={busy || !content.trim()}
              fullWidth={false}
              onPress={() => void submitQuestion()}
            />
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
  chatPanel: { flex: 1, minHeight: 0, gap: spacing.md },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  disclaimer: { flex: 1, fontSize: 12 },
  messages: { flex: 1, minHeight: 0 },
  messagesContent: { flexGrow: 1, gap: spacing.md, paddingVertical: spacing.sm },
  welcome: {
    flex: 1,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  centerText: { textAlign: 'center' },
  message: {
    maxWidth: '88%',
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.xs,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.background.selected,
    borderBottomRightRadius: spacing.xs,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.muted,
    borderBottomLeftRadius: spacing.xs,
  },
  pending: { flexDirection: 'row', alignItems: 'center' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: { flex: 1 },
});
