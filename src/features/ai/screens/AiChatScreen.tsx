import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppIcon,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  Toggle,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useKeyboardInsets } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, shadows, spacing } from '@/theme';
import {
  deriveConversationTitle,
  formatAiMessageTime,
  getAiStarterPrompts,
} from '../aiChatCopy';
import {
  AI_CHAT_LIMITS,
  AI_ROUTES,
  AI_TRANSLATION_KEYS,
  AiDateLocale,
  AiFeedbackRating,
  AiMessageRole,
} from '../aiConstants';
import { AiMarkdownMessage } from '../components/AiMarkdownMessage';
import { AiImageAttachmentPicker } from '../components/AiImageAttachmentPicker';
import { AiProcessingStatus } from '../components/AiProcessingStatus';
import {
  AiMedicalDisclaimer,
  AiSafetyNotices,
} from '../components/AiSafetyNotices';
import { useAiChat } from '../hooks';
import { useAiImageAttachment } from '../useAiImageAttachment';

export function AiChatScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const chatKeys = AI_TRANSLATION_KEYS.CHAT;
  const commonKeys = AI_TRANSLATION_KEYS.COMMON;
  const dateLocale = locale === 'vi' ? AiDateLocale.VI : AiDateLocale.EN;

  const [activeId, setActiveId] = useState<string | undefined>(id);
  const chat = useAiChat(activeId);
  const attachment = useAiImageAttachment();
  const keyboard = useKeyboardInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [content, setContent] = useState('');
  const [useProfile, setUseProfile] = useState(false);
  const [rated, setRated] = useState<Record<string, AiFeedbackRating>>({});

  useEffect(() => {
    setActiveId(id);
  }, [id]);

  const busy =
    chat.send.isPending ||
    chat.create.isPending ||
    attachment.choose.isPending ||
    attachment.upload.isPending;

  const conversations = chat.conversations.data?.data ?? [];
  const messages = activeId ? (chat.messages.data?.data ?? []) : [];
  const activeConversation = conversations.find((item) => item._id === activeId);
  const starterPrompts = getAiStarterPrompts(locale);

  useEffect(() => {
    if (!messages.length && !busy) return;
    requestAnimationFrame(() =>
      scrollRef.current?.scrollToEnd({ animated: true })
    );
  }, [messages.length, busy]);

  useEffect(() => {
    if (!keyboard.visible) return;
    requestAnimationFrame(() =>
      scrollRef.current?.scrollToEnd({ animated: true })
    );
  }, [keyboard.overlap, keyboard.visible]);

  const selectConversation = (nextId: string | undefined) => {
    chat.send.reset();
    chat.create.reset();
    setActiveId(nextId);
    if (nextId) {
      router.setParams({ id: nextId });
    } else {
      router.replace(AI_ROUTES.CHAT);
    }
  };

  const createConversation = () => {
    chat.create.mutate(t(commonKeys.NEW_CONVERSATION), {
      onSuccess: (conversation) => {
        setActiveId(conversation._id);
        router.setParams({ id: conversation._id });
      },
    });
  };

  const submitQuestion = async (overrideQuestion?: string) => {
    const rawQuestion = overrideQuestion ?? content;
    const question =
      rawQuestion.trim() ||
      (attachment.asset ? t(commonKeys.ANALYZE_IMAGE_PROMPT) : '');
    if (!question || busy) return;

    try {
      let targetConversationId = activeId;
      if (!targetConversationId) {
        const created = await chat.create.mutateAsync(
          deriveConversationTitle(question, locale)
        );
        targetConversationId = created._id;
        setActiveId(targetConversationId);
        router.setParams({ id: targetConversationId });
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
      // Mutation errors are rendered below and the attachment stays available to retry.
    }
  };

  const canSend = !busy && (Boolean(content.trim()) || Boolean(attachment.asset));

  const swipeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dx < -35 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.4,
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -55) {
          router.push(AI_ROUTES.HISTORY);
        }
      },
    })
  ).current;

  return (
    <ScreenWrapper
      scrollable={false}
      header={
        <CustomHeader
          title={t(chatKeys.HEADER_TITLE)}
          showBack
          backFallbackHref={AI_ROUTES.BACK_FALLBACK}
          rightAction={{
            accessibilityLabel: t(chatKeys.HISTORY_A11Y),
            icon: 'comment',
            onPress: () => router.push(AI_ROUTES.HISTORY),
          }}
        />
      }
      contentContainerStyle={styles.screen}
    >
      <View style={styles.screenContent} {...swipeResponder.panHandlers}>
        {/* Top session & history quick-switcher bar */}
        <View style={styles.sessionBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sessionScroll}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(commonKeys.NEW_CONVERSATION_ACTION)}
            disabled={busy}
            onPress={() => {
              if (activeId) {
                selectConversation(undefined);
              } else {
                createConversation();
              }
            }}
            style={({ pressed }) => [
              styles.newChatChip,
              !activeId && styles.newChatChipActive,
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}
          >
            <AppIcon
              name="plus"
              size={16}
              color={!activeId ? colors.text.inverse : colors.primary[700]}
              decorative
            />
            <AppText
              variant="bodySmall"
              color={!activeId ? colors.text.inverse : colors.primary[800]}
              style={styles.semiBold}
            >
              {t(chatKeys.NEW_CHAT_CHIP)}
            </AppText>
          </Pressable>

          {conversations
            .slice(0, AI_CHAT_LIMITS.MAX_RECENT_CHIPS)
            .map((conversation) => {
              const selected = conversation._id === activeId;
              return (
                <Pressable
                  key={conversation._id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={busy}
                  onPress={() => selectConversation(conversation._id)}
                  style={({ pressed }) => [
                    styles.sessionChip,
                    selected && styles.sessionChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText
                    variant="bodySmall"
                    color={selected ? colors.primary[800] : colors.text.secondary}
                    numberOfLines={1}
                    style={selected ? styles.semiBold : undefined}
                  >
                    {conversation.title}
                  </AppText>
                </Pressable>
              );
            })}
        </ScrollView>
      </View>

      {/* Scrollable conversation stream */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (messages.length > 0 || busy) {
            scrollRef.current?.scrollToEnd({ animated: true });
          }
        }}
      >
        <FeatureState
          loading={
            chat.conversations.isLoading ||
            (Boolean(activeId) && chat.messages.isLoading)
          }
          error={chat.conversations.error || chat.messages.error}
          retry={() => {
            void chat.conversations.refetch();
            if (activeId) void chat.messages.refetch();
          }}
        />

        {/* Welcome state when no messages in current view */}
        {!chat.messages.isLoading && messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <View style={styles.heroCard}>
              <View style={styles.mascotHalo}>
                <AppIcon name="mam-companion" size={72} decorative />
              </View>
              <View style={styles.onlinePill}>
                <View style={styles.onlineDot} />
                <AppText
                  variant="caption"
                  color={colors.primary[800]}
                  style={styles.semiBold}
                >
                  {t(chatKeys.READY_BADGE)}
                </AppText>
              </View>
              <AppText variant="heading3" style={styles.centerText}>
                {activeConversation
                  ? activeConversation.title
                  : t(chatKeys.WELCOME_HEADING)}
              </AppText>
              <AppText
                variant="bodySmall"
                color={colors.text.secondary}
                style={styles.centerText}
              >
                {t(chatKeys.WELCOME_DESCRIPTION)}
              </AppText>

              <View style={styles.promptGrid}>
                {starterPrompts.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => setContent(item.prompt)}
                    style={({ pressed }) => [
                      styles.promptCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.promptTag}>
                      <AppIcon
                        name="spark"
                        size={13}
                        color={colors.primary[700]}
                        decorative
                      />
                      <AppText
                        variant="caption"
                        color={colors.primary[700]}
                        style={styles.semiBold}
                      >
                        {item.tag}
                      </AppText>
                    </View>
                    <AppText variant="bodySmall" color={colors.text.primary}>
                      {item.prompt}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>

            {!activeId && conversations.length > 0 ? (
              <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                  <AppText variant="heading5" style={styles.recentTitle}>
                    {t(chatKeys.RECENT_TITLE)}
                  </AppText>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push(AI_ROUTES.HISTORY)}
                    hitSlop={8}
                  >
                    <AppText
                      variant="bodySmall"
                      color={colors.primary[700]}
                      style={styles.semiBold}
                    >
                      {t(chatKeys.VIEW_ALL)}
                    </AppText>
                  </Pressable>
                </View>
                {conversations
                  .slice(0, AI_CHAT_LIMITS.MAX_RECENT_CARDS)
                  .map((conversation) => (
                    <Pressable
                      key={conversation._id}
                      accessibilityRole="button"
                      onPress={() => selectConversation(conversation._id)}
                      style={({ pressed }) => [
                        styles.recentCard,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.recentIcon}>
                        <AppIcon
                          name="comment"
                          size={18}
                          color={colors.primary[700]}
                          decorative
                        />
                      </View>
                      <View style={styles.recentCopy}>
                        <AppText variant="bodyStrong" numberOfLines={1}>
                          {conversation.title}
                        </AppText>
                        {conversation.lastMessageAt || conversation.updatedAt ? (
                          <AppText variant="caption" color={colors.text.secondary}>
                            {new Intl.DateTimeFormat(dateLocale, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(
                              new Date(
                                conversation.lastMessageAt ??
                                  conversation.updatedAt!
                              )
                            )}
                          </AppText>
                        ) : null}
                      </View>
                      <AppText color={colors.primary[700]}>›</AppText>
                    </Pressable>
                  ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Active conversation message bubbles */}
        {messages.map((message) => {
          const isUser = message.role === AiMessageRole.USER;
          const timeLabel = formatAiMessageTime(message.createdAt, locale);
          const runId = message.aiRunId || message.runId;
          const userRating = rated[message._id];

          return (
            <View
              key={message._id}
              style={[styles.messageRow, isUser && styles.userMessageRow]}
            >
              {!isUser ? (
                <View style={styles.aiAvatar}>
                  <AppIcon name="mam-companion" size={30} decorative />
                </View>
              ) : null}

              <View
                style={[
                  styles.message,
                  isUser ? styles.own : styles.assistantBubble,
                ]}
              >
                <View style={styles.messageHeader}>
                  <AppText
                    variant="caption"
                    color={isUser ? colors.primary[100] : colors.primary[700]}
                    style={styles.semiBold}
                  >
                    {isUser ? t(commonKeys.YOU) : t(commonKeys.ASSISTANT_NAME)}
                  </AppText>
                  {timeLabel ? (
                    <AppText
                      variant="caption"
                      color={isUser ? colors.primary[100] : colors.text.secondary}
                    >
                      {timeLabel}
                    </AppText>
                  ) : null}
                </View>

                {message.role === AiMessageRole.ASSISTANT ? (
                  <>
                    <AiMarkdownMessage content={message.content} />
                    <AiSafetyNotices notices={message.safetyNotices} />
                  </>
                ) : (
                  <>
                    {message.mediaId ? (
                      <View style={styles.userAttachmentPill}>
                        <AppIcon
                          name="image"
                          size={14}
                          color={colors.text.inverse}
                          decorative
                        />
                        <AppText variant="caption" color={colors.text.inverse}>
                          {t(chatKeys.IMAGE_ATTACHED)}
                        </AppText>
                      </View>
                    ) : null}
                    <AppText selectable color={colors.text.inverse}>
                      {message.content}
                    </AppText>
                  </>
                )}

                {message.role === AiMessageRole.ASSISTANT && runId ? (
                  <View style={styles.actions}>
                    <AppText variant="caption" color={colors.text.secondary}>
                      {userRating
                        ? t(chatKeys.FEEDBACK_THANKS)
                        : t(chatKeys.FEEDBACK_PROMPT)}
                    </AppText>
                    <View style={styles.feedbackButtons}>
                      {[true, false].map((helpful) => {
                        const choice = helpful
                          ? AiFeedbackRating.HELPFUL
                          : AiFeedbackRating.NOT_HELPFUL;
                        const isSelected = userRating === choice;
                        return (
                          <Pressable
                            key={String(helpful)}
                            accessibilityRole="button"
                            disabled={
                              chat.feedback.isPending || Boolean(userRating)
                            }
                            onPress={() =>
                              chat.feedback.mutate(
                                { runId, helpful },
                                {
                                  onSuccess: () =>
                                    setRated((current) => ({
                                      ...current,
                                      [message._id]: choice,
                                    })),
                                }
                              )
                            }
                            style={({ pressed }) => [
                              styles.feedbackPill,
                              isSelected && styles.feedbackPillSelected,
                              pressed && styles.pressed,
                            ]}
                          >
                            {helpful ? (
                              <AppIcon
                                name="thumb-up"
                                size={13}
                                color={
                                  isSelected
                                    ? colors.primary[800]
                                    : colors.text.secondary
                                }
                                decorative
                              />
                            ) : null}
                            <AppText
                              variant="caption"
                              color={
                                isSelected
                                  ? colors.primary[800]
                                  : colors.text.secondary
                              }
                              style={isSelected ? styles.semiBold : undefined}
                            >
                              {helpful
                                ? t(chatKeys.FEEDBACK_HELPFUL)
                                : t(chatKeys.FEEDBACK_NOT_HELPFUL)}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}

        {chat.send.isPending ? (
          <View style={styles.messageRow}>
            <View style={styles.aiAvatar}>
              <AppIcon name="mam-companion" size={30} decorative />
            </View>
            <View style={styles.processingWrapper}>
              <AiProcessingStatus />
            </View>
          </View>
        ) : null}

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
      </ScrollView>

      {/* Sticky bottom composer dock */}
      <View style={styles.composerDock}>
        {attachment.asset ? (
          <View style={styles.previewSlot}>
            <AiImageAttachmentPicker
              asset={attachment.asset}
              busy={busy}
              onChoose={() => attachment.choose.mutate()}
              onClear={attachment.clear}
            />
          </View>
        ) : null}

        <View style={styles.composerToolbar}>
          <Toggle
            label={t(chatKeys.USE_PROFILE)}
            value={useProfile}
            onValueChange={setUseProfile}
            disabled={busy}
          />
        </View>

        <View style={styles.composerRow}>
          {!attachment.asset ? (
            <AiImageAttachmentPicker
              asset={null}
              busy={busy}
              compact
              onChoose={() => attachment.choose.mutate()}
              onClear={attachment.clear}
            />
          ) : null}
          <AppInput
            value={content}
            onChangeText={(value) => {
              if (chat.send.error) chat.send.reset();
              setContent(value);
            }}
            placeholder={t(chatKeys.INPUT_PLACEHOLDER)}
            multiline
            maxLength={AI_CHAT_LIMITS.MAX_MESSAGE_LENGTH}
            editable={!busy}
            style={styles.inputField}
            inputStyle={styles.inputText}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(chatKeys.SEND_A11Y)}
            accessibilityState={{ disabled: !canSend, busy }}
            disabled={!canSend}
            onPress={() => void submitQuestion()}
            style={({ pressed }) => [
              styles.sendButton,
              !canSend && styles.sendButtonDisabled,
              pressed && canSend && styles.sendButtonPressed,
            ]}
          >
            {chat.send.isPending || chat.create.isPending ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <AppIcon
                name="send"
                size={20}
                color={canSend ? colors.text.inverse : colors.text.disabled}
                decorative
              />
            )}
          </Pressable>
        </View>

        <AiMedicalDisclaimer compact />
      </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  screenContent: {
    flex: 1,
  },
  previewSlot: {
    paddingBottom: spacing.xs,
  },
  semiBold: { fontWeight: '600' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.45 },
  sessionBar: {
    backgroundColor: colors.background.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
    paddingVertical: spacing.sm,
  },
  sessionScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  newChatChip: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  newChatChipActive: {
    backgroundColor: colors.primary[700],
    borderColor: colors.primary[700],
  },
  sessionChip: {
    maxWidth: 180,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.base,
  },
  sessionChipActive: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  welcomeContainer: {
    gap: spacing.xl,
  },
  heroCard: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
    ...shadows.sm,
  },
  mascotHalo: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.status.success,
  },
  centerText: { textAlign: 'center' },
  promptGrid: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  promptCard: {
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.base,
  },
  promptTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentSection: {
    gap: spacing.sm,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  recentTitle: {
    flex: 1,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
  },
  recentCopy: { flex: 1, minWidth: 0, gap: 2 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  message: {
    maxWidth: '84%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    gap: spacing.xs,
  },
  assistantBubble: {
    flex: 1,
    backgroundColor: colors.background.surface,
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  own: {
    backgroundColor: colors.primary[700],
    borderBottomRightRadius: spacing.xs,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  userAttachmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.primary[800],
  },
  actions: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  feedbackButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  feedbackPill: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.base,
  },
  feedbackPillSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  processingWrapper: {
    flex: 1,
    maxWidth: '84%',
  },
  composerDock: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  composerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  profileToggleWrap: {
    flexShrink: 1,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  inputField: {
    flex: 1,
  },
  inputText: {
    maxHeight: 96,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[700],
  },
  sendButtonDisabled: {
    backgroundColor: colors.background.muted,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
});
