import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';
import {
  ADMIN_ACTION_REASONS,
  AdminUserRole,
  AdminUserStatus,
  MASTER_RECORD_STATUSES,
  MasterCategoryType,
  MasterRecordStatus,
  MasterResourcePath,
  MasterResourceType,
} from './adminConstants';

export {
  AdminUserRole,
  AdminUserStatus,
  MasterCategoryType,
  MasterRecordStatus,
  MasterResourcePath,
  MasterResourceType,
};

export interface AdminSummary {
  users: { total: number; active: number; suspended: number; newInRange: number };
  content: Record<
    string,
    { publishedInRange: number; pending: number; hidden: number }
  >;
  reports: Record<string, number>;
  ai?: Record<string, unknown>;
}
export interface AdminUser {
  _id: string;
  id?: string;
  displayName?: string;
  name?: string;
  email?: string;
  status: `${AdminUserStatus}`;
  role: `${AdminUserRole}`;
  createdAt?: string;
}
export interface AuditLog {
  _id: string;
  action: string;
  targetType?: string;
  targetId?: string;
  actorId?: string;
  createdAt: string;
}
export interface MasterRecord {
  _id: string;
  name: string;
  status?: `${MasterRecordStatus}`;
  type?: `${MasterCategoryType}`;
  categoryId?: string;
  defaultServing?: { amount: number; unit: string; gramEquivalent: number };
  nutritionPer100g?: Record<string, number>;
  isVegan?: boolean;
  isVegetarian?: boolean;
}

const collectMasterRecords = async (path: `${MasterResourcePath}`) => {
  const [active, inactive] = await Promise.all(
    MASTER_RECORD_STATUSES.map((status) =>
      collectPages((page) =>
        unwrapApiPageRequest<MasterRecord>(() =>
          apiClient.get(path, { params: { page, limit: 100, status } })
        )
      )
    )
  );
  return {
    data: [...active.data, ...inactive.data],
    meta: {
      page: 1,
      limit: active.data.length + inactive.data.length || 1,
      total: active.data.length + inactive.data.length,
      totalPages: 1,
    },
  };
};

export const adminApi = {
  summary: () =>
    unwrapApiRequest<AdminSummary>(() => apiClient.get('/admin/dashboard/summary')),
  users: (q = '') =>
    collectPages((page) =>
      unwrapApiPageRequest<AdminUser>(() =>
        apiClient.get('/admin/users', {
          params: { page, limit: 50, ...(q.trim() ? { q: q.trim() } : {}) },
        })
      )
    ),
  userDetail: (id: string) =>
    unwrapApiRequest<Record<string, unknown>>(() =>
      apiClient.get(`/admin/users/${id}`)
    ),
  auditLogs: () =>
    collectPages((page) =>
      unwrapApiPageRequest<AuditLog>(() =>
        apiClient.get('/admin/audit-logs', { params: { page, limit: 50 } })
      )
    ),
  setStatus: (user: AdminUser) =>
    unwrapApiRequest<AdminUser>(() =>
      user.status === AdminUserStatus.SUSPENDED
        ? apiClient.post(`/admin/users/${user._id}/activate`, {})
        : apiClient.post(`/admin/users/${user._id}/suspend`, {
            reason: ADMIN_ACTION_REASONS.MOBILE_ADMIN_ACTION,
          })
    ),
  deleteUser: (user: AdminUser) =>
    unwrapApiRequest<AdminUser>(() =>
      apiClient.delete(`/admin/users/${user._id}`, {
        data: { reason: ADMIN_ACTION_REASONS.MOBILE_ADMIN_ACTION },
      })
    ),
  restoreUser: (user: AdminUser) =>
    unwrapApiRequest<AdminUser>(() =>
      apiClient.post(`/admin/users/${user._id}/restore`, {})
    ),
  changeRole: (user: AdminUser) =>
    unwrapApiRequest<AdminUser>(() =>
      apiClient.patch(`/admin/users/${user._id}/role`, {
        role:
          user.role === AdminUserRole.ADMIN
            ? AdminUserRole.USER
            : AdminUserRole.ADMIN,
      })
    ),
  contentTrends: () =>
    unwrapApiRequest<Record<string, unknown>>(() =>
      apiClient.get('/admin/dashboard/content-trends')
    ),
  userTrends: () =>
    unwrapApiRequest<Record<string, unknown>>(() =>
      apiClient.get('/admin/dashboard/user-trends')
    ),
  categories: () => collectMasterRecords(MasterResourcePath.CATEGORIES),
  allergens: () => collectMasterRecords(MasterResourcePath.ALLERGENS),
  foods: () => collectMasterRecords(MasterResourcePath.FOOD_ITEMS),
  saveCategory: (record: Partial<MasterRecord> & { name: string }) =>
    unwrapApiRequest<MasterRecord>(() =>
      record._id
        ? apiClient.patch(`${MasterResourcePath.CATEGORIES}/${record._id}`, {
            name: record.name,
            type: record.type,
          })
        : apiClient.post(MasterResourcePath.CATEGORIES, {
            name: record.name,
            type: record.type ?? MasterCategoryType.RECIPE,
          })
    ),
  saveAllergen: (record: Partial<MasterRecord> & { name: string }) =>
    unwrapApiRequest<MasterRecord>(() =>
      record._id
        ? apiClient.patch(`${MasterResourcePath.ALLERGENS}/${record._id}`, {
            name: record.name,
          })
        : apiClient.post(MasterResourcePath.ALLERGENS, { name: record.name })
    ),
  saveFood: (record: Partial<MasterRecord> & { name: string }) =>
    unwrapApiRequest<MasterRecord>(() => {
      const { _id, ...body } = record;
      return _id
        ? apiClient.patch(`${MasterResourcePath.FOOD_ITEMS}/${_id}`, body)
        : apiClient.post(MasterResourcePath.FOOD_ITEMS, body);
    }),
  removeMaster: (type: `${MasterResourceType}`, id: string) =>
    unwrapApiRequest(() => apiClient.delete(`/${type}/${id}`)),
  setMasterStatus: (
    type: `${MasterResourceType}`,
    record: MasterRecord,
    status: `${MasterRecordStatus}`
  ) =>
    unwrapApiRequest<MasterRecord>(() =>
      apiClient.patch(`/${type}/${record._id}`, { status })
    ),
};
