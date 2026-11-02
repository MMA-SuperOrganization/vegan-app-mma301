import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  appDialog,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing, webLayout } from '@/theme';
import { adminApi, type AdminUser } from './adminApi';
import {
  AdminEmptyState,
  AdminFilterChips,
  AdminMetricCard,
  AdminPageIntro,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminSurface,
} from './AdminUi';

type UserFilter = 'all' | 'active' | 'suspended' | 'admin' | 'deleted';

export function AdminUsersScreen() {
  const { t, locale } = useTranslation();
  const vi = locale === 'vi';
  const client = useQueryClient();
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<UserFilter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const users = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => adminApi.users(search),
  });
  const detail = useQuery({
    queryKey: ['admin', 'user', selected],
    queryFn: () => adminApi.userDetail(selected!),
    enabled: Boolean(selected),
  });
  const status = useMutation({
    mutationFn: adminApi.setStatus,
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin'] }),
  });
  const role = useMutation({
    mutationFn: adminApi.changeRole,
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin'] }),
  });
  const allUsers = users.data?.data ?? [];
  const counts = {
    all: allUsers.length,
    active: allUsers.filter((user) => user.status === 'active').length,
    suspended: allUsers.filter((user) => user.status === 'suspended').length,
    admin: allUsers.filter((user) => user.role === 'admin').length,
    deleted: allUsers.filter((user) => user.status === 'deleted').length,
  };
  const visibleUsers = useMemo(
    () =>
      allUsers.filter((user) =>
        filter === 'all'
          ? true
          : filter === 'admin'
            ? user.role === 'admin'
            : user.status === filter
      ),
    [allUsers, filter]
  );

  const submitSearch = () => setSearch(text.trim());
  const changeStatus = (user: AdminUser) =>
    appDialog.alert(
      user.status === 'suspended'
        ? t('admin.users.activateTitle')
        : t('admin.users.suspendTitle'),
      user.displayName || user.name || user.email,
      [
        { text: t('admin.users.cancel'), style: 'cancel' },
        {
          text: t('admin.users.confirm'),
          style: user.status === 'suspended' ? 'default' : 'destructive',
          onPress: () => status.mutate(user),
        },
      ]
    );

  return (
    <ScreenWrapper
      scrollable
      webMaxWidth={webLayout.catalogMaxWidth}
      contentContainerStyle={styles.screen}
      header={<CustomHeader title={t('admin.users.title')} showBack={false} />}
    >
      <AdminPageIntro
        eyebrow={vi ? 'Tài khoản & phân quyền' : 'Accounts & access'}
        title={t('admin.users.title')}
        description={
          vi
            ? 'Tìm đúng tài khoản, lọc theo trạng thái rồi mới mở các thao tác quản trị.'
            : 'Find the right account, filter by status, then open management actions as needed.'
        }
      />

      <AdminSurface>
        <AppInput
          type="search"
          label={t('admin.users.search')}
          placeholder={vi ? 'Tên, email…' : 'Name, email…'}
          value={text}
          onChangeText={setText}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
        />
        <AppButton
          title={t('admin.users.searchButton')}
          variant="outline"
          onPress={submitSearch}
        />
      </AdminSurface>

      <FeatureState
        loading={users.isLoading}
        error={users.error || status.error || role.error}
        retry={() => void users.refetch()}
      />

      {users.data ? (
        <>
          <View style={styles.metrics}>
            <AdminMetricCard label={vi ? 'Kết quả' : 'Results'} value={counts.all} />
            <AdminMetricCard
              label={t('admin.overview.active')}
              value={counts.active}
              tone="success"
            />
            <AdminMetricCard
              label={t('admin.overview.suspended')}
              value={counts.suspended}
              tone="danger"
            />
          </View>
          <AdminSectionHeader
            title={vi ? 'Danh sách tài khoản' : 'Account list'}
            description={`${visibleUsers.length} ${vi ? 'tài khoản phù hợp' : 'matching accounts'}`}
          />
          <AdminFilterChips
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: vi ? 'Tất cả' : 'All', count: counts.all },
              { value: 'active', label: t('admin.overview.active'), count: counts.active },
              {
                value: 'suspended',
                label: t('admin.overview.suspended'),
                count: counts.suspended,
              },
              { value: 'admin', label: vi ? 'Admin' : 'Admins', count: counts.admin },
              { value: 'deleted', label: vi ? 'Đã xóa' : 'Deleted', count: counts.deleted },
            ]}
          />
        </>
      ) : null}

      {users.data && visibleUsers.length === 0 ? (
        <AdminEmptyState
          icon="user"
          title={vi ? 'Không có tài khoản phù hợp' : 'No matching accounts'}
          description={
            vi
              ? 'Thử đổi bộ lọc hoặc tìm bằng một từ khóa khác.'
              : 'Try another filter or use a different search term.'
          }
        />
      ) : null}

      <View style={styles.list}>
        {visibleUsers.map((user) => {
          const isExpanded = expanded === user._id;
          const displayName = user.displayName || user.name || user.email || user._id;
          return (
            <AdminSurface key={user._id}>
              <View style={styles.userHeader}>
                <View style={styles.avatar}>
                  <AppText variant="heading4" color={colors.primary[700]}>
                    {displayName.charAt(0).toLocaleUpperCase()}
                  </AppText>
                </View>
                <View style={styles.userIdentity}>
                  <AppText variant="heading4" numberOfLines={1}>
                    {displayName}
                  </AppText>
                  <AppText
                    variant="bodySmall"
                    color={colors.text.secondary}
                    numberOfLines={1}
                  >
                    {user.email || user._id}
                  </AppText>
                </View>
              </View>
              <View style={styles.badges}>
                <AdminStatusBadge
                  label={user.role === 'admin' ? t('admin.userRole.admin') : t('admin.userRole.user')}
                  tone={user.role === 'admin' ? 'info' : 'neutral'}
                />
                <AdminStatusBadge
                  label={statusLabel(user.status, t)}
                  tone={
                    user.status === 'active'
                      ? 'success'
                      : user.status === 'suspended'
                        ? 'danger'
                        : 'neutral'
                  }
                />
              </View>
              <View style={styles.cardFooter}>
                <AppButton
                  title={t('admin.users.details')}
                  variant="ghost"
                  fullWidth={false}
                  onPress={() => setSelected(user._id)}
                />
                {user.status !== 'deleted' ? (
                  <AppButton
                    title={isExpanded ? (vi ? 'Thu gọn' : 'Collapse') : vi ? 'Quản lý' : 'Manage'}
                    variant="outline"
                    fullWidth={false}
                    onPress={() => setExpanded(isExpanded ? null : user._id)}
                  />
                ) : null}
              </View>
              {isExpanded ? (
                <View style={styles.actionPanel}>
                  <AppText variant="bodySmall" color={colors.text.secondary}>
                    {vi ? 'Thao tác tài khoản' : 'Account actions'}
                  </AppText>
                  <AppButton
                    title={
                      user.status === 'suspended'
                        ? t('admin.users.activate')
                        : t('admin.users.suspend')
                    }
                    variant="outline"
                    loading={status.isPending}
                    disabled={status.isPending || role.isPending}
                    onPress={() => changeStatus(user)}
                  />
                  <AppButton
                    title={
                      user.role === 'admin'
                        ? t('admin.users.makeUser')
                        : t('admin.users.makeAdmin')
                    }
                    variant="outline"
                    disabled={status.isPending || role.isPending}
                    onPress={() => role.mutate(user)}
                  />
                </View>
              ) : null}
              {user.status === 'deleted' ? (
                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {t('admin.users.deleted')}
                </AppText>
              ) : null}
            </AdminSurface>
          );
        })}
      </View>

      <Modal
        visible={Boolean(selected)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setSelected(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <AdminSectionHeader
              title={t('admin.users.detailTitle')}
              description={vi ? 'Thông tin tài khoản đã chọn' : 'Selected account information'}
            />
            <FeatureState loading={detail.isLoading} error={detail.error} />
            {detail.data ? <UserDetails data={detail.data} vi={vi} /> : null}
            <AppButton
              title={t('common.close')}
              variant="outline"
              onPress={() => setSelected(null)}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

function UserDetails({ data, vi }: { data: Record<string, unknown>; vi: boolean }) {
  const preferredKeys = ['displayName', 'name', 'email', 'role', 'status', 'createdAt', 'updatedAt'];
  const entries = Object.entries(data)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .sort(([a], [b]) => preferredKeys.indexOf(a) - preferredKeys.indexOf(b))
    .slice(0, 10);
  return (
    <View style={styles.details}>
      {entries.map(([key, value]) => (
        <View key={key} style={styles.detailRow}>
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {detailLabel(key, vi)}
          </AppText>
          <AppText selectable style={styles.detailValue}>
            {formatDetailValue(key, value, vi)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function detailLabel(key: string, vi: boolean) {
  const labels: Record<string, [string, string]> = {
    displayName: ['Tên hiển thị', 'Display name'],
    name: ['Họ tên', 'Name'],
    email: ['Email', 'Email'],
    role: ['Vai trò', 'Role'],
    status: ['Trạng thái', 'Status'],
    createdAt: ['Ngày tạo', 'Created'],
    updatedAt: ['Cập nhật', 'Updated'],
    _id: ['Mã tài khoản', 'Account ID'],
    id: ['Mã tài khoản', 'Account ID'],
  };
  return labels[key]?.[vi ? 0 : 1] ?? key;
}

function formatDetailValue(key: string, value: unknown, vi: boolean) {
  if (typeof value === 'boolean') return value ? (vi ? 'Có' : 'Yes') : vi ? 'Không' : 'No';
  if (typeof value === 'string' && /At$/.test(key)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString(vi ? 'vi-VN' : 'en-US');
  }
  return String(value);
}

function statusLabel(status: AdminUser['status'], t: ReturnType<typeof useTranslation>['t']) {
  if (status === 'active') return t('admin.userStatus.active');
  if (status === 'suspended') return t('admin.userStatus.suspended');
  return t('admin.userStatus.deleted');
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  list: { gap: spacing.md },
  userHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  userIdentity: { flex: 1, minWidth: 0, gap: spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  actionPanel: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background.muted,
  },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay.modal },
  sheet: {
    maxHeight: '86%',
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.background.base,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    alignSelf: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.border.strong,
  },
  details: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  detailRow: {
    padding: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
  },
  detailValue: { flexShrink: 1 },
});
