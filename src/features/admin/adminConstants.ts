import type { TranslationKey } from '@/i18n';

export const MasterResourceType = {
  CATEGORIES: 'categories',
  ALLERGENS: 'allergens',
  FOOD_ITEMS: 'food-items',
} as const;
export type MasterResourceType =
  (typeof MasterResourceType)[keyof typeof MasterResourceType];

export const MasterResourcePath = {
  CATEGORIES: '/categories',
  ALLERGENS: '/allergens',
  FOOD_ITEMS: '/food-items',
} as const;
export type MasterResourcePath =
  (typeof MasterResourcePath)[keyof typeof MasterResourcePath];

export const MasterRecordStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;
export type MasterRecordStatus =
  (typeof MasterRecordStatus)[keyof typeof MasterRecordStatus];

export const MasterCategoryType = {
  FOOD: 'food',
  RECIPE: 'recipe',
  POST: 'post',
} as const;
export type MasterCategoryType =
  (typeof MasterCategoryType)[keyof typeof MasterCategoryType];

export const AdminUserStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
} as const;
export type AdminUserStatus =
  (typeof AdminUserStatus)[keyof typeof AdminUserStatus];

export const AdminUserRole = {
  USER: 'user',
  ADMIN: 'admin',
} as const;
export type AdminUserRole = (typeof AdminUserRole)[keyof typeof AdminUserRole];

export const MASTER_RECORD_STATUSES = [
  MasterRecordStatus.ACTIVE,
  MasterRecordStatus.INACTIVE,
] as const;

export const MASTER_CATEGORY_TYPES = [
  MasterCategoryType.FOOD,
  MasterCategoryType.RECIPE,
  MasterCategoryType.POST,
] as const;

export const MASTER_FOOD_DEFAULTS = {
  SERVING_G: '100',
  DEFAULT_SERVING_AMOUNT: 100,
  ZERO_MACRO: '0',
  UNIT_GRAM: 'g',
  IS_VEGAN: true,
  IS_VEGETARIAN: true,
} as const;

export const ADMIN_ROUTES = {
  MODERATION: '/moderation',
  AI_MONITORING: '/ai/monitoring',
  BACK_FALLBACK: '/(tabs)/profile',
} as const;

export const ADMIN_QUERY_KEYS = {
  ROOT: ['admin'] as const,
  SUMMARY: ['admin', 'summary'] as const,
  USERS: (search: string) => ['admin', 'users', search] as const,
  USER_DETAIL: (id: string | null) => ['admin', 'user', id] as const,
  CONTENT_TRENDS: ['admin', 'content-trends'] as const,
  USER_TRENDS: ['admin', 'user-trends'] as const,
  AUDIT_LOGS: ['admin', 'audit'] as const,
  MASTER_ROOT: ['admin', 'master'] as const,
  MASTER_CATEGORIES: ['admin', 'master', 'categories'] as const,
  MASTER_ALLERGENS: ['admin', 'master', 'allergens'] as const,
  MASTER_FOODS: ['admin', 'master', 'foods'] as const,
} as const;

export const ADMIN_ACTION_REASONS = {
  MOBILE_ADMIN_ACTION: 'Administrative action from VEGETA mobile app',
} as const;

export const MASTER_CATEGORY_TYPE_LABEL_KEYS: Record<
  MasterCategoryType,
  TranslationKey
> = {
  [MasterCategoryType.FOOD]: 'admin.master.categoryType.food',
  [MasterCategoryType.RECIPE]: 'admin.master.categoryType.recipe',
  [MasterCategoryType.POST]: 'admin.master.categoryType.post',
};

export const MASTER_RECORD_STATUS_LABEL_KEYS: Record<
  MasterRecordStatus,
  TranslationKey
> = {
  [MasterRecordStatus.ACTIVE]: 'admin.master.status.active',
  [MasterRecordStatus.INACTIVE]: 'admin.master.status.inactive',
};

export const ADMIN_USER_ROLE_LABEL_KEYS: Record<AdminUserRole, TranslationKey> = {
  [AdminUserRole.USER]: 'admin.userRole.user',
  [AdminUserRole.ADMIN]: 'admin.userRole.admin',
};

export const ADMIN_USER_STATUS_LABEL_KEYS: Record<
  AdminUserStatus,
  TranslationKey
> = {
  [AdminUserStatus.ACTIVE]: 'admin.userStatus.active',
  [AdminUserStatus.SUSPENDED]: 'admin.userStatus.suspended',
  [AdminUserStatus.DELETED]: 'admin.userStatus.deleted',
};

export const ADMIN_TRANSLATION_KEYS = {
  DASHBOARD: {
    TITLE: 'admin.dashboard.title',
    CENTER_TITLE: 'admin.dashboard.centerTitle',
    CENTER_DESCRIPTION: 'admin.dashboard.centerDescription',
    REVIEW_CONTENT: 'admin.dashboard.reviewContent',
    AI_MONITORING: 'admin.dashboard.aiMonitoring',
    OVERVIEW: 'admin.dashboard.overview',
    USERS: 'admin.dashboard.users',
    ACTIVE: 'admin.dashboard.active',
    SUSPENDED: 'admin.dashboard.suspended',
    PENDING: 'admin.dashboard.pending',
    HIDDEN: 'admin.dashboard.hidden',
    ACCOUNTS: 'admin.dashboard.accounts',
    SEARCH_LABEL: 'admin.dashboard.searchLabel',
    SEARCH_ACTION: 'admin.dashboard.searchAction',
    ACTIVATE_TITLE: 'admin.dashboard.activateTitle',
    SUSPEND_TITLE: 'admin.dashboard.suspendTitle',
    CANCEL: 'admin.dashboard.cancel',
    CONFIRM: 'admin.dashboard.confirm',
    ACTIVATE: 'admin.dashboard.activate',
    SUSPEND: 'admin.dashboard.suspend',
    MAKE_USER: 'admin.dashboard.makeUser',
    MAKE_ADMIN: 'admin.dashboard.makeAdmin',
    VIEW_DETAILS: 'admin.dashboard.viewDetails',
    DELETE_ACCOUNT: 'admin.dashboard.deleteAccount',
    DELETE_CONFIRM_TITLE: 'admin.dashboard.deleteConfirmTitle',
    DELETE_CONFIRM_BODY: 'admin.dashboard.deleteConfirmBody',
    DELETE_ACTION: 'admin.dashboard.deleteAction',
    RESTORE_ACCOUNT: 'admin.dashboard.restoreAccount',
    ACCOUNT_DETAILS: 'admin.dashboard.accountDetails',
    CLOSE: 'common.close',
    TRENDS: 'admin.dashboard.trends',
    AUDIT_LOG: 'admin.dashboard.auditLog',
  },
  MASTER: {
    TITLE: 'admin.master.title',
    CATEGORIES: 'admin.master.categories',
    CATEGORY_NAME: 'admin.master.categoryName',
    TYPE: 'admin.master.type',
    TYPE_PLACEHOLDER: 'admin.master.typePlaceholder',
    UPDATE_CATEGORY: 'admin.master.updateCategory',
    ADD_CATEGORY: 'admin.master.addCategory',
    ALLERGENS: 'admin.master.allergens',
    ALLERGEN_NAME: 'admin.master.allergenName',
    UPDATE_ALLERGEN: 'admin.master.updateAllergen',
    ADD_ALLERGEN: 'admin.master.addAllergen',
    FOODS: 'admin.master.foods',
    FOOD_NAME: 'admin.master.foodName',
    FOOD_CATEGORY: 'admin.master.foodCategory',
    CHOOSE_CATEGORY: 'admin.master.chooseCategory',
    DEFAULT_SERVING_G: 'admin.master.defaultServingG',
    KCAL_PER_100G: 'admin.master.kcalPer100g',
    PROTEIN_PER_100G: 'admin.master.proteinPer100g',
    CARBS_PER_100G: 'admin.master.carbsPer100g',
    FAT_PER_100G: 'admin.master.fatPer100g',
    FIBER_PER_100G: 'admin.master.fiberPer100g',
    UPDATE_FOOD: 'admin.master.updateFood',
    ADD_FOOD: 'admin.master.addFood',
    EDIT: 'admin.master.edit',
    RESTORE: 'admin.master.restore',
    DEACTIVATE: 'admin.master.deactivate',
  },
} as const satisfies Record<string, Record<string, TranslationKey>>;
