import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  AppButton,
  AppIcon,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  appDialog,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing, webLayout } from '@/theme';
import {
  AdminUserRole,
  AdminUserStatus,
  adminApi,
  type AdminUser,
  type AdminUserDetail,
} from './adminApi';
import {
  AdminEmptyState,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminSurface,
} from './AdminUi';

type UserFilter = 'all' | 'active' | 'suspended' | 'admin' | 'deleted';
const userFilters: UserFilter[] = ['all', 'active', 'suspended', 'admin', 'deleted'];

export function AdminUsersScreen() {
  const { t, locale } = useTranslation();
  const vi = locale === 'vi';
  const client = useQueryClient();
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<UserFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const users = useInfiniteQuery({
    queryKey: ['admin', 'users', search, filter],
    queryFn: ({ pageParam }) =>
      adminApi.users({ page: pageParam, q: search, ...userFilterQuery(filter) }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      return meta && meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
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
  const visibleUsers = useMemo(
    () => users.data?.pages.flatMap((page) => page.data) ?? [],
    [users.data]
  );
  const totalUsers = users.data?.pages[0]?.meta?.total ?? visibleUsers.length;

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
      <AdminSurface>
        <AppInput
          type="search"
          label={t('admin.users.search')}
          placeholder={vi ? 'Tên, email…' : 'Name, email…'}
          value={text}
          onChangeText={setText}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
          trailingIcon="filter"
          onTrailingPress={() => setFilterOpen(true)}
          trailingAccessibilityLabel={
            vi ? 'Mở bộ lọc tài khoản' : 'Open account filters'
          }
          helper={
            filter === 'all'
              ? undefined
              : `${vi ? 'Bộ lọc' : 'Filter'}: ${userFilterLabel(filter, vi)}`
          }
        />
      </AdminSurface>

      <FeatureState
        loading={users.isLoading}
        error={users.error || status.error || role.error}
        retry={() => void users.refetch()}
      />

      {users.data ? (
        <AdminSectionHeader
          title={vi ? 'Danh sách tài khoản' : 'Account list'}
          description={`${vi ? 'Đã tải' : 'Loaded'} ${visibleUsers.length}/${totalUsers}`}
        />
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
          const displayName =
            user.displayName || user.name || user.email || user._id;
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
                  label={
                    user.role === 'admin'
                      ? t('admin.userRole.admin')
                      : t('admin.userRole.user')
                  }
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
                    title={
                      isExpanded
                        ? vi
                          ? 'Thu gọn'
                          : 'Collapse'
                        : vi
                          ? 'Quản lý'
                          : 'Manage'
                    }
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

      {users.hasNextPage ? (
        <AppButton
          title={vi ? 'Tải thêm tài khoản' : 'Load more accounts'}
          variant="outline"
          loading={users.isFetchingNextPage}
          disabled={users.isFetchingNextPage}
          onPress={() => void users.fetchNextPage()}
        />
      ) : users.data && visibleUsers.length ? (
        <AppText
          variant="bodySmall"
          color={colors.text.secondary}
          style={styles.endHint}
        >
          {vi ? 'Đã hiển thị toàn bộ kết quả.' : 'All matching accounts are shown.'}
        </AppText>
      ) : null}

      <Modal
        visible={filterOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setFilterOpen(false)} />
          <View style={styles.filterSheet}>
            <AdminSectionHeader
              title={vi ? 'Lọc tài khoản' : 'Filter accounts'}
              description={
                vi ? 'Chọn một nhóm để hiển thị' : 'Choose one group to display'
              }
            />
            <View style={styles.filterOptions}>
              {userFilters.map((option) => {
                const selectedFilter = filter === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selectedFilter }}
                    onPress={() => {
                      setFilter(option);
                      setFilterOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.filterOption,
                      selectedFilter && styles.filterOptionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <AppText variant="bodyStrong">
                      {userFilterLabel(option, vi)}
                    </AppText>
                    {selectedFilter ? (
                      <AppIcon
                        name="check"
                        size={20}
                        color={colors.primary[700]}
                        decorative
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

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
            <ScrollView contentContainerStyle={styles.sheetContent}>
              <AdminSectionHeader
                title={t('admin.users.detailTitle')}
                description={
                  vi ? 'Thông tin tài khoản đã chọn' : 'Selected account information'
                }
              />
              <FeatureState loading={detail.isLoading} error={detail.error} />
              {detail.data ? <UserDetails data={detail.data} vi={vi} /> : null}
              <AppButton
                title={t('common.close')}
                variant="outline"
                onPress={() => setSelected(null)}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

function UserDetails({ data, vi }: { data: AdminUserDetail; vi: boolean }) {
  const accountEntries = [
    ['displayName', data.user.displayName],
    ['email', data.user.email],
    ['role', data.user.role],
    ['status', data.user.status],
    ['onboardingCompleted', data.user.onboardingCompleted],
    ['lastLoginAt', data.user.lastLoginAt],
    ['createdAt', data.user.createdAt],
    ['updatedAt', data.user.updatedAt],
    ['_id', data.user._id],
  ] as const;
  const profileEntries = [
    ['dietType', data.profile?.dietType],
    ['bio', data.profile?.bio],
    ['locale', data.profile?.locale],
    ['timezone', data.profile?.timezone],
  ] as const;
  return (
    <View style={styles.detailSections}>
      <DetailSection
        title={vi ? 'Tài khoản' : 'Account'}
        entries={accountEntries}
        vi={vi}
      />
      <DetailSection
        title={vi ? 'Hồ sơ cá nhân' : 'Profile'}
        entries={profileEntries}
        vi={vi}
      />
    </View>
  );
}

function DetailSection({
  title,
  entries,
  vi,
}: {
  title: string;
  entries: ReadonlyArray<readonly [string, unknown]>;
  vi: boolean;
}) {
  const visibleEntries = entries.filter(
    ([, value]) => value !== undefined && value !== null
  );
  return (
    <View style={styles.detailSection}>
      <AppText variant="heading4">{title}</AppText>
      {visibleEntries.length ? (
        <View style={styles.details}>
          {visibleEntries.map(([key, value]) => (
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
      ) : (
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {vi ? 'Chưa có thông tin.' : 'No information provided.'}
        </AppText>
      )}
    </View>
  );
}

function userFilterQuery(filter: UserFilter) {
  if (filter === 'admin') return { role: AdminUserRole.ADMIN };
  if (filter === 'active') return { status: AdminUserStatus.ACTIVE };
  if (filter === 'suspended') return { status: AdminUserStatus.SUSPENDED };
  if (filter === 'deleted') return { status: AdminUserStatus.DELETED };
  return {};
}

function userFilterLabel(filter: UserFilter, vi: boolean) {
  const labels: Record<UserFilter, [string, string]> = {
    all: ['Tất cả tài khoản', 'All accounts'],
    active: ['Đang hoạt động', 'Active'],
    suspended: ['Tạm khóa', 'Suspended'],
    admin: ['Quản trị viên', 'Administrators'],
    deleted: ['Đã xóa', 'Deleted'],
  };
  return labels[filter][vi ? 0 : 1];
}

function detailLabel(key: string, vi: boolean) {
  const labels: Record<string, [string, string]> = {
    displayName: ['Tên hiển thị', 'Display name'],
    name: ['Họ tên', 'Name'],
    email: ['Email', 'Email'],
    role: ['Vai trò', 'Role'],
    status: ['Trạng thái', 'Status'],
    onboardingCompleted: ['Đã hoàn tất thiết lập', 'Onboarding completed'],
    lastLoginAt: ['Đăng nhập gần nhất', 'Last login'],
    createdAt: ['Ngày tạo', 'Created'],
    updatedAt: ['Cập nhật', 'Updated'],
    dietType: ['Chế độ ăn', 'Diet'],
    bio: ['Giới thiệu', 'Bio'],
    locale: ['Ngôn ngữ', 'Locale'],
    timezone: ['Múi giờ', 'Timezone'],
    _id: ['Mã tài khoản', 'Account ID'],
    id: ['Mã tài khoản', 'Account ID'],
  };
  return labels[key]?.[vi ? 0 : 1] ?? key;
}

function formatDetailValue(key: string, value: unknown, vi: boolean) {
  if (typeof value === 'boolean')
    return value ? (vi ? 'Có' : 'Yes') : vi ? 'Không' : 'No';
  if (key === 'role') {
    return value === AdminUserRole.ADMIN
      ? vi
        ? 'Quản trị viên'
        : 'Administrator'
      : vi
        ? 'Người dùng'
        : 'User';
  }
  if (key === 'status') return userFilterLabel(String(value) as UserFilter, vi);
  if (typeof value === 'string' && /At$/.test(key)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime()))
      return date.toLocaleString(vi ? 'vi-VN' : 'en-US');
  }
  return String(value);
}

function statusLabel(
  status: AdminUser['status'],
  t: ReturnType<typeof useTranslation>['t']
) {
  if (status === 'active') return t('admin.userStatus.active');
  if (status === 'suspended') return t('admin.userStatus.suspended');
  return t('admin.userStatus.deleted');
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  list: { gap: spacing.md },
  endHint: { textAlign: 'center' },
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
  pressed: { opacity: 0.68 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay.modal },
  filterSheet: {
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.background.base,
  },
  filterOptions: { gap: spacing.sm },
  filterOption: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  filterOptionSelected: {
    borderColor: colors.primary[700],
    backgroundColor: colors.background.selected,
  },
  sheet: {
    maxHeight: '86%',
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.background.base,
  },
  sheetContent: { gap: spacing.lg },
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
  detailSections: { gap: spacing.lg },
  detailSection: { gap: spacing.sm },
  detailRow: {
    padding: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
  },
  detailValue: { flexShrink: 1 },
});
