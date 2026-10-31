import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter, useSegments } from 'expo-router';

import { AppIcon, AppInput, AppText, BottomSheet, Toggle } from '@/components';
import {
  FeatureState,
  getFeatureErrorMessage,
} from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { useKeyboardInsets } from '@/hooks';
import { colors, coreTokens, radius, shadows, spacing } from '@/theme';
import {
  deriveConversationTitle,
  formatAiMessageTime,
  getAiStarterPrompts,
} from '../aiChatCopy';
import {
  AI_CHAT_LIMITS,
  AI_ROUTES,
  AI_TRANSLATION_KEYS,
  AiErrorCode,
  AiMessageRole,
  AiWidgetAction,
} from '../aiConstants';
import { useAiChat } from '../hooks';
import { useAiImageAttachment } from '../useAiImageAttachment';
import {
  clampAiWidgetPosition,
  getAiWidgetBounds,
  snapAiWidgetToNearestEdge,
  type AiWidgetPosition,
} from '../aiWidgetPosition';
import { AiImageAttachmentPicker } from './AiImageAttachmentPicker';
import { AiMarkdownMessage } from './AiMarkdownMessage';
import { AiProcessingStatus } from './AiProcessingStatus';
import { AiMedicalDisclaimer, AiSafetyNotices } from './AiSafetyNotices';

const WIDGET_SIZE = 64;
const WIDGET_EDGE_MARGIN = spacing.sm;
const DRAG_ACTIVATION_DISTANCE = 6;
const AUTO_SCROLL_THRESHOLD = 72;

export function AiChatWidget() {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const [rootSegment] = useSegments();
  const { t, locale } = useTranslation();
  const widgetKeys = AI_TRANSLATION_KEYS.WIDGET;
  const commonKeys = AI_TRANSLATION_KEYS.COMMON;
  const historyKeys = AI_TRANSLATION_KEYS.HISTORY;
  const starterPrompts = getAiStarterPrompts(locale);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isRestoringSession = useAuthStore((state) => state.isRestoringSession);
  const userId = useAuthStore((state) => state.user?.id);
  const userRole = useAuthStore((state) => state.user?.role);
  const onboardingCompleted = useAuthStore(
    (state) => state.user?.onboardingCompleted
  );
  const [visible, setVisible] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [widgetTab, setWidgetTab] = useState<'chat' | 'history'>('chat');
  const [content, setContent] = useState('');
  const [useProfile, setUseProfile] = useState(false);
  const [lastAction, setLastAction] = useState<AiWidgetAction>(
    AiWidgetAction.SUBMIT
  );
  const scrollRef = useRef<ScrollView>(null);
  const shouldAutoScrollRef = useRef(true);
  const keyboard = useKeyboardInsets();
  const chat = useAiChat(conversationId);
  const attachment = useAiImageAttachment();
  const conversations = chat.conversations.data?.data ?? [];

  const launcherBottom =
    Math.max(insets.bottom, spacing.lg) +
    (rootSegment === '(tabs)'
      ? coreTokens.navigation.tabBarHeight + spacing.lg
      : spacing.lg);
  const launcherBounds = getAiWidgetBounds(
    window,
    insets,
    WIDGET_SIZE,
    launcherBottom,
    WIDGET_EDGE_MARGIN
  );
  const launcherBoundsRef = useRef(launcherBounds);
  launcherBoundsRef.current = launcherBounds;
  const launcherPositionRef = useRef<AiWidgetPosition>({
    x: launcherBounds.maxX,
    y: launcherBounds.maxY,
  });
  const launcherDragStartRef = useRef(launcherPositionRef.current);
  const launcherPosition = useRef(
    new Animated.ValueXY(launcherPositionRef.current)
  ).current;

  const settleLauncher = (position: AiWidgetPosition) => {
    const snappedPosition = snapAiWidgetToNearestEdge(
      position,
      launcherBoundsRef.current
    );
    launcherPositionRef.current = snappedPosition;
    Animated.spring(launcherPosition, {
      toValue: snappedPosition,
      useNativeDriver: false,
      speed: 24,
      bounciness: 4,
    }).start();
  };

  const launcherDragResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.hypot(gesture.dx, gesture.dy) >= DRAG_ACTIVATION_DISTANCE,
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        Math.hypot(gesture.dx, gesture.dy) >= DRAG_ACTIVATION_DISTANCE,
      onPanResponderGrant: () => {
        launcherDragStartRef.current = launcherPositionRef.current;
        launcherPosition.stopAnimation();
      },
      onPanResponderMove: (_, gesture) => {
        const nextPosition = clampAiWidgetPosition(
          {
            x: launcherDragStartRef.current.x + gesture.dx,
            y: launcherDragStartRef.current.y + gesture.dy,
          },
          launcherBoundsRef.current
        );
        launcherPositionRef.current = nextPosition;
        launcherPosition.setValue(nextPosition);
      },
      onPanResponderRelease: () => settleLauncher(launcherPositionRef.current),
      onPanResponderTerminate: () => settleLauncher(launcherPositionRef.current),
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  const busy =
    chat.create.isPending ||
    chat.send.isPending ||
    attachment.choose.isPending ||
    attachment.upload.isPending;
  const messages = chat.messages.data?.data ?? [];
  const launcherHidden =
    pathname.startsWith('/ai') ||
    pathname.startsWith('/community') ||
    pathname.startsWith('/search-results');

  useEffect(() => {
    setVisible(false);
    setConversationId(undefined);
    setContent('');
    setUseProfile(false);
    setLastAction(AiWidgetAction.SUBMIT);
  }, [userId]);

  useEffect(() => {
    if (conversationId || !chat.conversations.data?.data.length) return;
    setConversationId(chat.conversations.data.data[0]._id);
  }, [chat.conversations.data?.data, conversationId]);

  useEffect(() => {
    if (!visible || !shouldAutoScrollRef.current) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [messages.length, visible]);

  useEffect(() => {
    if (!visible || !keyboard.visible || !shouldAutoScrollRef.current) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [keyboard.overlap, keyboard.visible, visible]);

  useEffect(() => {
    const nextPosition = clampAiWidgetPosition(
      launcherPositionRef.current,
      launcherBounds
    );
    launcherPositionRef.current = nextPosition;
    launcherPosition.setValue(nextPosition);
  }, [
    launcherBounds.maxX,
    launcherBounds.maxY,
    launcherBounds.minX,
    launcherBounds.minY,
    launcherPosition,
  ]);

  if (
    !isAuthenticated ||
    userRole === 'admin' ||
    !onboardingCompleted ||
    isRestoringSession ||
    launcherHidden
  )
    return null;

  const submitQuestion = async () => {
    const question =
      content.trim() ||
      (attachment.asset ? t(commonKeys.ANALYZE_IMAGE_PROMPT) : '');
    if (!question || busy) return;

    setLastAction(AiWidgetAction.SUBMIT);
    shouldAutoScrollRef.current = true;
    try {
      let targetConversationId = conversationId;
      if (!targetConversationId) {
        const conversation = await chat.create.mutateAsync(
          deriveConversationTitle(question, locale)
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

  const openFullScreenChat = () => {
    const targetId = conversationId;
    closePanel();
    if (targetId) {
      router.push({ pathname: AI_ROUTES.CHAT, params: { id: targetId } });
    } else {
      router.push(AI_ROUTES.CHAT);
    }
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
    setLastAction(AiWidgetAction.NEW);
    shouldAutoScrollRef.current = true;
    try {
      const conversation = await chat.create.mutateAsync(
        t(commonKeys.NEW_CONVERSATION)
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

  const trackMessageScrollPosition = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y;
    shouldAutoScrollRef.current = distanceFromBottom <= AUTO_SCROLL_THRESHOLD;
  };

  const canSend = !busy && (Boolean(content.trim()) || Boolean(attachment.asset));

  const headerActions = (
    <View style={styles.headerActions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          widgetTab === 'chat'
            ? t(widgetKeys.HISTORY_TAB_LABEL)
            : t(widgetKeys.CHAT_TAB_LABEL)
        }
        onPress={() =>
          setWidgetTab((current) => (current === 'chat' ? 'history' : 'chat'))
        }
        style={({ pressed }) => [
          styles.secondaryHeaderButton,
          pressed && styles.controlPressed,
        ]}
      >
        <AppIcon
          name={widgetTab === 'chat' ? 'history' : 'comment'}
          size={15}
          color={colors.primary[700]}
          decorative
        />
        <AppText
          variant="caption"
          color={colors.primary[800]}
          style={styles.semiBold}
        >
          {widgetTab === 'chat'
            ? t(widgetKeys.HISTORY_TAB_LABEL)
            : t(widgetKeys.CHAT_TAB_LABEL)}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(widgetKeys.NEW_CHAT_A11Y)}
        disabled={busy}
        onPress={() => {
          void startNewConversation();
          setWidgetTab('chat');
        }}
        style={({ pressed }) => [
          styles.newChatButton,
          pressed && styles.controlPressed,
          busy && styles.controlDisabled,
        ]}
      >
        <AppIcon name="plus" size={15} color={colors.primary[700]} decorative />
        <AppText
          variant="caption"
          color={colors.primary[800]}
          style={styles.semiBold}
        >
          {t(widgetKeys.NEW_CHAT_LABEL)}
        </AppText>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(widgetKeys.EXPAND_A11Y)}
        onPress={openFullScreenChat}
        hitSlop={6}
        style={({ pressed }) => [
          styles.iconHeaderButton,
          pressed && styles.controlPressed,
        ]}
      >
        <AppIcon
          name="explore"
          size={16}
          color={colors.primary[700]}
          decorative
        />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(widgetKeys.CLOSE_A11Y)}
        onPress={closePanel}
        hitSlop={8}
        style={({ pressed }) => [
          styles.closeButton,
          pressed && styles.controlPressed,
        ]}
      >
        <AppIcon name="close" size={18} color={colors.primary[700]} decorative />
      </Pressable>
    </View>
  );

  return (
    <>
      <Animated.View
        {...launcherDragResponder.panHandlers}
        style={[styles.launcherPosition, launcherPosition.getLayout()]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(widgetKeys.OPEN_A11Y)}
          accessibilityHint={t(widgetKeys.OPEN_HINT)}
          onPress={() => {
            shouldAutoScrollRef.current = true;
            setVisible(true);
          }}
          style={({ pressed }) => [
            styles.launcher,
            pressed && styles.launcherPressed,
          ]}
        >
          <AppIcon name="mam-companion" size={54} decorative />
          <View style={styles.aiBadge}>
            <AppText style={styles.aiBadgeText}>{t(commonKeys.BADGE)}</AppText>
          </View>
        </Pressable>
      </Animated.View>

      <BottomSheet
        visible={visible}
        title={t(commonKeys.ASSISTANT_NAME)}
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

          {widgetTab === 'history' ? (
            <View style={styles.historyContainer}>
              <View style={styles.historyHeaderCol}>
                <AppText variant="heading5" color={colors.primary[900]}>
                  {t(historyKeys.TITLE)}
                </AppText>
                <AppText variant="caption" color={colors.text.secondary}>
                  {t(widgetKeys.SWIPE_BACK_HINT)}
                </AppText>
              </View>

              <ScrollView
                style={styles.historyScroll}
                contentContainerStyle={styles.historyScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {!conversations.length ? (
                  <View style={styles.emptyHistory}>
                    <AppIcon name="mam-companion" size={56} decorative />
                    <AppText variant="bodyStrong" style={styles.centerText}>
                      {t(widgetKeys.HISTORY_EMPTY)}
                    </AppText>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        void startNewConversation();
                        setWidgetTab('chat');
                      }}
                      style={styles.newChatButton}
                    >
                      <AppIcon
                        name="plus"
                        size={15}
                        color={colors.primary[700]}
                        decorative
                      />
                      <AppText
                        variant="bodySmall"
                        color={colors.primary[800]}
                        style={styles.semiBold}
                      >
                        {t(commonKeys.NEW_CONVERSATION_ACTION)}
                      </AppText>
                    </Pressable>
                  </View>
                ) : (
                  conversations.map((item) => {
                    const isActive = item._id === conversationId;
                    const dateStr = item.lastMessageAt || item.updatedAt;
                    return (
                      <Pressable
                        key={item._id}
                        accessibilityRole="button"
                        onPress={() => {
                          shouldAutoScrollRef.current = true;
                          setConversationId(item._id);
                          setContent('');
                          attachment.clear();
                          setWidgetTab('chat');
                        }}
                        style={({ pressed }) => [
                          styles.historyItem,
                          isActive && styles.historyItemActive,
                          pressed && styles.controlPressed,
                        ]}
                      >
                        <View style={styles.historyItemIcon}>
                          <AppIcon
                            name="comment"
                            size={18}
                            color={
                              isActive
                                ? colors.primary[800]
                                : colors.primary[700]
                            }
                            decorative
                          />
                        </View>
                        <View style={styles.historyItemCopy}>
                          <View style={styles.historyItemTitleRow}>
                            <AppText
                              variant="bodySmall"
                              color={
                                isActive
                                  ? colors.primary[900]
                                  : colors.text.primary
                              }
                              numberOfLines={1}
                              style={styles.semiBold}
                            >
                              {item.title}
                            </AppText>
                            {isActive ? (
                              <View style={styles.activePill}>
                                <AppText
                                  variant="caption"
                                  color={colors.primary[800]}
                                >
                                  {t(widgetKeys.ACTIVE_BADGE)}
                                </AppText>
                              </View>
                            ) : null}
                          </View>
                          {dateStr ? (
                            <AppText
                              variant="caption"
                              color={colors.text.secondary}
                            >
                              {new Intl.DateTimeFormat(
                                locale === 'vi' ? 'vi-VN' : 'en-US',
                                {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                }
                              ).format(new Date(dateStr))}
                            </AppText>
                          ) : null}
                        </View>
                        <AppText variant="heading4" color={colors.primary[700]}>
                          ›
                        </AppText>
                      </Pressable>
                    );
                  })
                )}
              </ScrollView>
            </View>
          ) : (
            <>
              <ScrollView
                ref={scrollRef}
                style={styles.messages}
                contentContainerStyle={styles.messagesContent}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                directionalLockEnabled
                showsVerticalScrollIndicator
                scrollEventThrottle={16}
                onScroll={trackMessageScrollPosition}
              >
            {!loadingChat && messages.length === 0 && !actionError ? (
              <View style={styles.welcome}>
                <View style={styles.mascotHalo}>
                  <AppIcon name="mam-companion" size={68} decorative />
                </View>
                <AppText variant="heading4" style={styles.centerText}>
                  {t(widgetKeys.WELCOME_HEADING)}
                </AppText>
                <AppText
                  variant="bodySmall"
                  color={colors.text.secondary}
                  style={styles.centerText}
                >
                  {t(widgetKeys.WELCOME_DESCRIPTION)}
                </AppText>
                <View style={styles.suggestions}>
                  {starterPrompts.map((item) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      onPress={() => chooseSuggestion(item.prompt)}
                      style={({ pressed }) => [
                        styles.suggestion,
                        pressed && styles.controlPressed,
                      ]}
                    >
                      <View style={styles.suggestionBadge}>
                        <AppIcon
                          name="spark"
                          size={14}
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
                      <AppText variant="bodySmall" style={styles.suggestionText}>
                        {item.prompt}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {messages.map((message) => {
              const fromUser = message.role === AiMessageRole.USER;
              const timeLabel = formatAiMessageTime(message.createdAt, locale);
              return (
                <View
                  key={message._id}
                  style={[styles.messageRow, fromUser && styles.userMessageRow]}
                >
                  {!fromUser ? (
                    <View style={styles.aiAvatar}>
                      <AppIcon name="mam-companion" size={28} decorative />
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.message,
                      fromUser ? styles.userMessage : styles.aiMessage,
                    ]}
                  >
                    <View style={styles.messageMetaRow}>
                      <AppText
                        variant="caption"
                        color={fromUser ? colors.primary[100] : colors.primary[700]}
                        style={styles.semiBold}
                      >
                        {fromUser
                          ? t(commonKeys.YOU)
                          : t(commonKeys.ASSISTANT_NAME)}
                      </AppText>
                      {timeLabel ? (
                        <AppText
                          variant="caption"
                          color={
                            fromUser ? colors.primary[100] : colors.text.secondary
                          }
                        >
                          {timeLabel}
                        </AppText>
                      ) : null}
                    </View>
                    {fromUser ? (
                      <>
                        {message.mediaId ? (
                          <AppText variant="caption" color={colors.primary[100]}>
                            {t(widgetKeys.IMAGE_ATTACHED)}
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
                        <AiSafetyNotices notices={message.safetyNotices} />
                      </>
                    )}
                  </View>
                </View>
              );
            })}

            {busy ? (
              <View style={styles.messageRow}>
                <View style={styles.aiAvatar}>
                  <AppIcon name="mam-companion" size={28} decorative />
                </View>
                <View style={styles.progressMessage}>
                  <AiProcessingStatus />
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
                    {actionErrorCode === AiErrorCode.AUTHENTICATION_ERROR
                      ? t(widgetKeys.AUTH_ERROR_TITLE)
                      : t(widgetKeys.SEND_ERROR_TITLE)}
                  </AppText>
                  <AppText color={colors.text.secondary} style={styles.errorMessage}>
                    {getFeatureErrorMessage(actionError, locale)}
                  </AppText>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      void (lastAction === AiWidgetAction.NEW
                        ? startNewConversation()
                        : submitQuestion())
                    }
                    style={({ pressed }) => [
                      styles.retryButton,
                      pressed && styles.controlPressed,
                    ]}
                  >
                    <AppText variant="bodyStrong" color={colors.primary[700]}>
                      {t(widgetKeys.RETRY)}
                    </AppText>
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t(widgetKeys.DISMISS_ERROR_A11Y)}
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
                label={t(widgetKeys.USE_PROFILE)}
                value={useProfile}
                onValueChange={setUseProfile}
                disabled={busy}
              />
              <AppText variant="caption" color={colors.text.secondary}>
                {t(widgetKeys.SWIPE_HINT)}
              </AppText>
            </View>

            <FeatureState
              error={attachment.choose.error}
              retry={() => attachment.choose.mutate()}
            />

            <View style={styles.composer}>
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
                onChangeText={updateContent}
                placeholder={t(widgetKeys.INPUT_PLACEHOLDER)}
                multiline
                maxLength={AI_CHAT_LIMITS.MAX_MESSAGE_LENGTH}
                editable={!busy}
                returnKeyType="send"
                blurOnSubmit={false}
                style={styles.input}
                inputStyle={styles.inputText}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(widgetKeys.SEND_A11Y)}
                accessibilityState={{
                  disabled: !canSend,
                  busy,
                }}
                disabled={!canSend}
                onPress={() => void submitQuestion()}
                style={({ pressed }) => [
                  styles.sendButton,
                  !canSend && styles.sendButtonDisabled,
                  pressed && canSend && styles.sendButtonPressed,
                ]}
              >
                {chat.send.isPending ? (
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
        </>
      )}
    </View>
  </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  semiBold: { fontWeight: '600' },
  launcherPosition: {
    position: 'absolute',
    zIndex: 20,
    width: WIDGET_SIZE,
    height: WIDGET_SIZE,
  },
  launcher: {
    width: '100%',
    height: '100%',
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
    gap: spacing.xs,
  },
  secondaryHeaderButton: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.base,
  },
  newChatButton: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  iconHeaderButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.base,
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  controlPressed: { opacity: 0.72 },
  controlDisabled: { opacity: 0.45 },
  chatPanel: { flex: 1, minHeight: 0, gap: spacing.xs },
  messages: { flex: 1, minHeight: 0 },
  messagesContent: {
    flexGrow: 1,
    gap: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  welcome: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  mascotHalo: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    marginBottom: 2,
  },
  centerText: { textAlign: 'center' },
  suggestions: {
    width: '100%',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  suggestion: {
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.base,
  },
  suggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionText: { color: colors.text.primary },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  userMessageRow: { justifyContent: 'flex-end' },
  aiAvatar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  message: {
    maxWidth: '84%',
    padding: spacing.md,
    borderRadius: radius.xl,
    gap: spacing.xs,
  },
  messageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  userMessage: {
    backgroundColor: colors.primary[700],
    borderBottomRightRadius: spacing.xs,
  },
  aiMessage: {
    flex: 1,
    backgroundColor: colors.primary[50],
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary[300],
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
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  composerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  toggleWrap: { flexShrink: 1 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: { flex: 1 },
  inputText: { maxHeight: 88 },
  sendButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
  sendButtonDisabled: { backgroundColor: colors.background.muted },
  sendButtonPressed: { transform: [{ scale: 0.95 }] },
  previewSlot: {
    paddingBottom: spacing.xs,
  },
  historyContainer: {
    flex: 1,
    minHeight: 0,
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  historyHeaderCol: {
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  historyScroll: { flex: 1 },
  historyScrollContent: { gap: spacing.sm, paddingVertical: spacing.xs },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  historyItemActive: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  historyItemIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
  },
  historyItemCopy: { flex: 1, gap: 2 },
  historyItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  activePill: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
  },
  historyDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.muted,
  },
  emptyHistory: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['2xl'],
  },
});
