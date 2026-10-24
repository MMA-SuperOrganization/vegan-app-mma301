import { apiClient, unwrapApiPageRequest, unwrapApiRequest } from '@/services/api';
import { collectPages } from '@/services/api/collectPages';

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
  status: 'active' | 'suspended' | 'deleted';
  role: 'user' | 'admin';
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
  status?: 'active' | 'inactive';
  type?: 'food' | 'recipe' | 'post';
  categoryId?: string;
  defaultServing?: { amount: number; unit: string; gramEquivalent: number };
  nutritionPer100g?: Record<string, number>;
  isVegan?: boolean;
  isVegetarian?: boolean;
}

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
      user.status === 'suspended'
        ? apiClient.post(`/admin/users/${user._id}/activate`, {})
        : apiClient.post(`/admin/users/${user._id}/suspend`, {
            reason: 'Administrative action from VEGETA mobile app',
          })
    ),
  changeRole: (user: AdminUser) =>
    unwrapApiRequest<AdminUser>(() =>
      apiClient.patch(`/admin/users/${user._id}/role`, {
        role: user.role === 'admin' ? 'user' : 'admin',
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
  categories: () =>
    collectPages((page) =>
      unwrapApiPageRequest<MasterRecord>(() =>
        apiClient.get('/categories', { params: { page, limit: 100 } })
      )
    ),
  allergens: () =>
    collectPages((page) =>
      unwrapApiPageRequest<MasterRecord>(() =>
        apiClient.get('/allergens', { params: { page, limit: 100 } })
      )
    ),
  foods: () =>
    collectPages((page) =>
      unwrapApiPageRequest<MasterRecord>(() =>
        apiClient.get('/food-items', { params: { page, limit: 100 } })
      )
    ),
  saveCategory: (record: Partial<MasterRecord> & { name: string }) =>
    unwrapApiRequest<MasterRecord>(() =>
      record._id
        ? apiClient.patch(`/categories/${record._id}`, {
            name: record.name,
            type: record.type,
          })
        : apiClient.post('/categories', {
            name: record.name,
            type: record.type ?? 'recipe',
          })
    ),
  saveAllergen: (record: Partial<MasterRecord> & { name: string }) =>
    unwrapApiRequest<MasterRecord>(() =>
      record._id
        ? apiClient.patch(`/allergens/${record._id}`, { name: record.name })
        : apiClient.post('/allergens', { name: record.name })
    ),
  saveFood: (record: Partial<MasterRecord> & { name: string }) =>
    unwrapApiRequest<MasterRecord>(() => {
      const { _id, ...body } = record;
      return _id
        ? apiClient.patch(`/food-items/${_id}`, body)
        : apiClient.post('/food-items', body);
    }),
  removeMaster: (type: 'categories' | 'allergens' | 'food-items', id: string) =>
    unwrapApiRequest(() => apiClient.delete(`/${type}/${id}`)),
};
