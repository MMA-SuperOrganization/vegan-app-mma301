import type { TranslationKey } from '@/i18n';

export const AiSafetyNoticeCode = {
  ALLERGEN_CAUTION: 'ALLERGEN_CAUTION',
} as const;
export type AiSafetyNoticeCode =
  (typeof AiSafetyNoticeCode)[keyof typeof AiSafetyNoticeCode];

export const AiSafetySeverity = {
  WARNING: 'warning',
} as const;
export type AiSafetySeverity =
  (typeof AiSafetySeverity)[keyof typeof AiSafetySeverity];

export const AiMessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;
export type AiMessageRole =
  (typeof AiMessageRole)[keyof typeof AiMessageRole];

export const AiFeedbackRating = {
  HELPFUL: 'helpful',
  NOT_HELPFUL: 'not_helpful',
} as const;
export type AiFeedbackRating =
  (typeof AiFeedbackRating)[keyof typeof AiFeedbackRating];

export const AiProgressStage = {
  SENDING: 'sending',
  CHECKING: 'checking',
  GENERATING: 'generating',
} as const;
export type AiProgressStage =
  (typeof AiProgressStage)[keyof typeof AiProgressStage];

export const AiErrorCode = {
  AUTHENTICATION_ERROR: 'AI_AUTHENTICATION_ERROR',
  IMAGE_REQUIRED: 'AI_IMAGE_REQUIRED',
  PHOTO_PERMISSION_REQUIRED: 'PHOTO_PERMISSION_REQUIRED',
  CAMERA_PERMISSION_REQUIRED: 'CAMERA_PERMISSION_REQUIRED',
} as const;
export type AiErrorCode = (typeof AiErrorCode)[keyof typeof AiErrorCode];

export const AiStarterPromptId = {
  PROTEIN_DINNER: 'protein-dinner',
  POST_WORKOUT: 'post-workout',
  MEAL_PLAN: 'meal-plan',
  PANTRY_COOK: 'pantry-cook',
} as const;
export type AiStarterPromptId =
  (typeof AiStarterPromptId)[keyof typeof AiStarterPromptId];

export const AiWidgetAction = {
  SUBMIT: 'submit',
  NEW: 'new',
} as const;
export type AiWidgetAction =
  (typeof AiWidgetAction)[keyof typeof AiWidgetAction];

export const AiFeatureType = {
  CHAT: 'chat',
  MEAL_PLAN: 'meal_plan',
  INGREDIENT_RECOGNITION: 'ingredient_recognition',
  VIDEO_SUMMARY: 'video_summary',
} as const;
export type AiFeatureType = (typeof AiFeatureType)[keyof typeof AiFeatureType];

export const AiRunStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  BLOCKED: 'blocked',
} as const;
export type AiRunStatus = (typeof AiRunStatus)[keyof typeof AiRunStatus];

export const AiDateLocale = {
  VI: 'vi-VN',
  EN: 'en-US',
} as const;
export type AiDateLocale = (typeof AiDateLocale)[keyof typeof AiDateLocale];

export const AI_PROGRESS_STAGES: readonly AiProgressStage[] = [
  AiProgressStage.SENDING,
  AiProgressStage.CHECKING,
  AiProgressStage.GENERATING,
] as const;

export const AI_CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 4000,
  MAX_RECENT_CHIPS: 6,
  MAX_RECENT_CARDS: 3,
  TITLE_MAX_LENGTH: 48,
  TITLE_TRUNCATE_AT: 45,
} as const;

export const AI_ROUTES = {
  CHAT: '/ai',
  HISTORY: '/ai/history',
  MONITORING: '/ai/monitoring',
  BACK_FALLBACK: '/(tabs)/profile',
  PANTRY: '/pantry',
  MEAL_PLAN_TAB: '/(tabs)/meal-plan',
} as const;

export const AI_PROGRESS_STAGE_LABEL_KEYS: Record<
  AiProgressStage,
  TranslationKey
> = {
  [AiProgressStage.SENDING]: 'ai.processing.sending',
  [AiProgressStage.CHECKING]: 'ai.processing.checking',
  [AiProgressStage.GENERATING]: 'ai.processing.generating',
};

export interface AiStarterPromptDefinition {
  id: AiStarterPromptId;
  tagKey: TranslationKey;
  promptKey: TranslationKey;
}

export const AI_STARTER_PROMPT_DEFINITIONS: readonly AiStarterPromptDefinition[] = [
  {
    id: AiStarterPromptId.PROTEIN_DINNER,
    tagKey: 'ai.starter.proteinDinner.tag',
    promptKey: 'ai.starter.proteinDinner.prompt',
  },
  {
    id: AiStarterPromptId.POST_WORKOUT,
    tagKey: 'ai.starter.postWorkout.tag',
    promptKey: 'ai.starter.postWorkout.prompt',
  },
  {
    id: AiStarterPromptId.MEAL_PLAN,
    tagKey: 'ai.starter.mealPlan.tag',
    promptKey: 'ai.starter.mealPlan.prompt',
  },
  {
    id: AiStarterPromptId.PANTRY_COOK,
    tagKey: 'ai.starter.pantryCook.tag',
    promptKey: 'ai.starter.pantryCook.prompt',
  },
] as const;

export const AI_TRANSLATION_KEYS = {
  COMMON: {
    ASSISTANT_NAME: 'ai.common.assistantName',
    BADGE: 'ai.common.badge',
    YOU: 'ai.common.you',
    NEW_CONVERSATION: 'ai.common.newConversation',
    NEW_CONVERSATION_ACTION: 'ai.common.newConversationAction',
    ANALYZE_IMAGE_PROMPT: 'ai.common.analyzeImagePrompt',
  },
  SAFETY: {
    ALLERGEN_CAUTION_TITLE: 'ai.safety.allergenCautionTitle',
    ALLERGEN_CAUTION_MESSAGE: 'ai.safety.allergenCautionMessage',
    MEDICAL_DISCLAIMER_COMPACT: 'ai.safety.medicalDisclaimerCompact',
    MEDICAL_DISCLAIMER_TITLE: 'ai.safety.medicalDisclaimerTitle',
    MEDICAL_DISCLAIMER_BODY: 'ai.safety.medicalDisclaimerBody',
  },
  PROCESSING: {
    SENDING: 'ai.processing.sending',
    CHECKING: 'ai.processing.checking',
    GENERATING: 'ai.processing.generating',
    SECONDS_UNIT: 'ai.processing.secondsUnit',
  },
  ATTACHMENT: {
    PREVIEW_A11Y: 'ai.attachment.previewA11y',
    ATTACHED_TITLE: 'ai.attachment.attachedTitle',
    READY_HINT: 'ai.attachment.readyHint',
    REMOVE_A11Y: 'ai.attachment.removeA11y',
    ATTACH_A11Y: 'ai.attachment.attachA11y',
    ATTACH_LABEL: 'ai.attachment.attachLabel',
  },
  CHAT: {
    HEADER_TITLE: 'ai.chat.headerTitle',
    HISTORY_A11Y: 'ai.chat.historyA11y',
    NEW_CHAT_CHIP: 'ai.chat.newChatChip',
    READY_BADGE: 'ai.chat.readyBadge',
    WELCOME_HEADING: 'ai.chat.welcomeHeading',
    WELCOME_DESCRIPTION: 'ai.chat.welcomeDescription',
    RECENT_TITLE: 'ai.chat.recentTitle',
    VIEW_ALL: 'ai.chat.viewAll',
    IMAGE_ATTACHED: 'ai.chat.imageAttached',
    FEEDBACK_THANKS: 'ai.chat.feedbackThanks',
    FEEDBACK_PROMPT: 'ai.chat.feedbackPrompt',
    FEEDBACK_HELPFUL: 'ai.chat.feedbackHelpful',
    FEEDBACK_NOT_HELPFUL: 'ai.chat.feedbackNotHelpful',
    USE_PROFILE: 'ai.chat.useProfile',
    INPUT_PLACEHOLDER: 'ai.chat.inputPlaceholder',
    SEND_A11Y: 'ai.chat.sendA11y',
  },
  WIDGET: {
    EXPAND_A11Y: 'ai.widget.expandA11y',
    EXPAND_LABEL: 'ai.widget.expandLabel',
    NEW_CHAT_A11Y: 'ai.widget.newChatA11y',
    NEW_CHAT_LABEL: 'ai.widget.newChatLabel',
    CLOSE_A11Y: 'ai.widget.closeA11y',
    OPEN_A11Y: 'ai.widget.openA11y',
    OPEN_HINT: 'ai.widget.openHint',
    WELCOME_HEADING: 'ai.widget.welcomeHeading',
    WELCOME_DESCRIPTION: 'ai.widget.welcomeDescription',
    IMAGE_ATTACHED: 'ai.widget.imageAttached',
    AUTH_ERROR_TITLE: 'ai.widget.authErrorTitle',
    SEND_ERROR_TITLE: 'ai.widget.sendErrorTitle',
    RETRY: 'ai.widget.retry',
    DISMISS_ERROR_A11Y: 'ai.widget.dismissErrorA11y',
    USE_PROFILE: 'ai.widget.useProfile',
    INPUT_PLACEHOLDER: 'ai.widget.inputPlaceholder',
    SEND_A11Y: 'ai.widget.sendA11y',
    HISTORY_TAB_LABEL: 'ai.widget.historyTabLabel',
    CHAT_TAB_LABEL: 'ai.widget.chatTabLabel',
    SWIPE_HINT: 'ai.widget.swipeHint',
    SWIPE_BACK_HINT: 'ai.widget.swipeBackHint',
    DELETE_CONVERSATION_A11Y: 'ai.widget.deleteConversationA11y',
    HISTORY_EMPTY: 'ai.widget.historyEmpty',
    ACTIVE_BADGE: 'ai.widget.activeBadge',
  },
  HISTORY: {
    TITLE: 'ai.history.title',
    SUBTITLE: 'ai.history.subtitle',
    CTA_TITLE: 'ai.history.ctaTitle',
    CTA_DESCRIPTION: 'ai.history.ctaDescription',
    EMPTY_TITLE: 'ai.history.emptyTitle',
    EMPTY_DESCRIPTION: 'ai.history.emptyDescription',
  },
  MEAL_PLANNER: {
    TITLE: 'ai.mealPlanner.title',
    DESCRIPTION: 'ai.mealPlanner.description',
    START_DATE_LABEL: 'ai.mealPlanner.startDateLabel',
    MONDAY_HINT: 'ai.mealPlanner.mondayHint',
    DAYS_LABEL: 'ai.mealPlanner.daysLabel',
    PREFERENCES_LABEL: 'ai.mealPlanner.preferencesLabel',
    USE_PROFILE_LABEL: 'ai.mealPlanner.useProfileLabel',
    GENERATE_ACTION: 'ai.mealPlanner.generateAction',
    PLAN_TITLE_LABEL: 'ai.mealPlanner.planTitleLabel',
    EMPTY_DAY_ERROR: 'ai.mealPlanner.emptyDayError',
    CONFIRM_ACTION: 'ai.mealPlanner.confirmAction',
    DISCARD_ACTION: 'ai.mealPlanner.discardAction',
    SAVED_PLANS_TITLE: 'ai.mealPlanner.savedPlansTitle',
    NO_SAVED_PLANS: 'ai.mealPlanner.noSavedPlans',
    LOADING_RECIPE: 'ai.mealPlanner.loadingRecipe',
    REPLACE_RECIPE: 'ai.mealPlanner.replaceRecipe',
    SERVINGS_LABEL: 'ai.mealPlanner.servingsLabel',
    SERVINGS_ERROR: 'ai.mealPlanner.servingsError',
    REMOVE_MEAL: 'ai.mealPlanner.removeMeal',
    CHOOSE_RECIPE: 'ai.mealPlanner.chooseRecipe',
    SEARCH_RECIPE: 'ai.mealPlanner.searchRecipe',
  },
  RECOGNITION: {
    TITLE: 'ai.recognition.title',
    DESCRIPTION: 'ai.recognition.description',
    TAKE_PHOTO: 'ai.recognition.takePhoto',
    CHOOSE_PHOTO: 'ai.recognition.choosePhoto',
    SELECTED_PHOTO_A11Y: 'ai.recognition.selectedPhotoA11y',
    RECOGNIZE_ACTION: 'ai.recognition.recognizeAction',
    CONFIRM_ACTION: 'ai.recognition.confirmAction',
  },
  VIDEO_SUMMARY: {
    TITLE: 'ai.videoSummary.title',
    DESCRIPTION: 'ai.videoSummary.description',
    VIDEO_SELECTED: 'ai.videoSummary.videoSelected',
    CHOOSE_VIDEO: 'ai.videoSummary.chooseVideo',
    TRANSCRIPT_LABEL: 'ai.videoSummary.transcriptLabel',
    SUMMARIZE_ACTION: 'ai.videoSummary.summarizeAction',
    SUMMARY_TITLE: 'ai.videoSummary.summaryTitle',
    KEY_POINTS_TITLE: 'ai.videoSummary.keyPointsTitle',
    CHAPTERS_TITLE: 'ai.videoSummary.chaptersTitle',
  },
  MONITORING: {
    TITLE: 'ai.monitoring.title',
    OVERVIEW_TITLE: 'ai.monitoring.overviewTitle',
    TOTAL_RUNS: 'ai.monitoring.totalRuns',
    SUCCESS_RATE: 'ai.monitoring.successRate',
    SCHEMA_VALID: 'ai.monitoring.schemaValid',
    AVERAGE_LATENCY: 'ai.monitoring.averageLatency',
    HELPFUL_FEEDBACK: 'ai.monitoring.helpfulFeedback',
    TOTAL_TOKENS: 'ai.monitoring.totalTokens',
    RECENT_RUNS_TITLE: 'ai.monitoring.recentRunsTitle',
    EMPTY_RUNS: 'ai.monitoring.emptyRuns',
    PRIVACY_NOTICE: 'ai.monitoring.privacyNotice',
  },
} as const satisfies Record<string, Record<string, TranslationKey>>;
