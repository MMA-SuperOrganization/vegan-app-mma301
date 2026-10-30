import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { adminApi, type AdminUser } from './adminApi';
import { MasterDataPanel } from './MasterDataPanel';

export function AdminDashboardScreen() {
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const client = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const summary = useQuery({
    queryKey: ['admin', 'summary'],
    queryFn: adminApi.summary,
  });
  const users = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => adminApi.users(search),
  });
  const userDetail = useQuery({
    queryKey: ['admin', 'user', selectedUserId],
    queryFn: () => adminApi.userDetail(selectedUserId!),
    enabled: Boolean(selectedUserId),
  });
  const contentTrends = useQuery({
    queryKey: ['admin', 'content-trends'],
    queryFn: adminApi.contentTrends,
  });
  const userTrends = useQuery({
    queryKey: ['admin', 'user-trends'],
    queryFn: adminApi.userTrends,
  });
  const logs = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: adminApi.auditLogs,
  });
  const status = useMutation({
    mutationFn: adminApi.setStatus,
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin'] }),
  });
  const role = useMutation({
    mutationFn: adminApi.changeRole,
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin'] }),
  });
  const removeUser = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin'] }),
  });
  const restoreUser = useMutation({
    mutationFn: adminApi.restoreUser,
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin'] }),
  });
  const changeStatus = (user: AdminUser) => {
    const activate = user.status === 'suspended';
    Alert.alert(
      activate
        ? vi
          ? 'Kích hoạt tài khoản?'
          : 'Activate account?'
        : vi
          ? 'Tạm khóa tài khoản?'
          : 'Suspend account?',
      user.displayName || user.name || user.email,
      [
        { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
        {
          text: vi ? 'Xác nhận' : 'Confirm',
          style: activate ? 'default' : 'destructive',
          onPress: () => status.mutate(user),
        },
      ]
    );
  };
  const card = {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  } as const;
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Quản trị hệ thống' : 'Administration'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
    >
      <View style={card}>
        <AppText variant="heading2">
          {vi ? 'Trung tâm quản trị' : 'Administration center'}
        </AppText>
        <AppText color={colors.text.secondary}>
          {vi
            ? 'Quản lý tài khoản, dữ liệu nền, nội dung chờ duyệt, báo cáo và hoạt động hệ thống.'
            : 'Manage accounts, master data, pending content, reports, and system activity.'}
        </AppText>
        <AppButton
          title={vi ? 'Duyệt bài viết và công thức' : 'Review posts and recipes'}
          onPress={() => router.push('/moderation')}
        />
        <AppButton
          title={vi ? 'Giám sát AI' : 'AI monitoring'}
          variant="outline"
          onPress={() => router.push('/ai/monitoring')}
        />
      </View>
      <FeatureState
        loading={summary.isLoading}
        error={summary.error}
        retry={() => void summary.refetch()}
      />
      {summary.data ? (
        <View style={card}>
          <AppText variant="heading3">{vi ? 'Tổng quan' : 'Overview'}</AppText>
          <AppText>
            {vi ? 'Người dùng' : 'Users'}: {summary.data.users.total}
          </AppText>
          <AppText>
            {vi ? 'Hoạt động' : 'Active'}: {summary.data.users.active}
          </AppText>
          <AppText>
            {vi ? 'Tạm khóa' : 'Suspended'}: {summary.data.users.suspended}
          </AppText>
          {Object.entries(summary.data.content).map(([type, value]) => (
            <AppText key={type}>
              {type}: {value.pending} {vi ? 'chờ duyệt' : 'pending'} · {value.hidden}{' '}
              {vi ? 'đã ẩn' : 'hidden'}
            </AppText>
          ))}
        </View>
      ) : null}
      <AppText variant="heading2">{vi ? 'Tài khoản' : 'Accounts'}</AppText>
      <AppInput
        label={vi ? 'Tìm tên hoặc email' : 'Search name or email'}
        value={searchText}
        onChangeText={setSearchText}
      />
      <AppButton
        title={vi ? 'Tìm kiếm' : 'Search'}
        variant="outline"
        onPress={() => setSearch(searchText.trim())}
      />
      <FeatureState
        loading={users.isLoading}
        error={users.error || status.error || removeUser.error || restoreUser.error}
        retry={() => void users.refetch()}
      />
      {users.data?.data.map((user) => (
        <View key={user._id} style={card}>
          <AppText variant="heading4">
            {user.displayName || user.name || user.email || user._id}
          </AppText>
          <AppText>{user.email}</AppText>
          <AppText>
            {user.role} · {user.status}
          </AppText>
          {user.status !== 'deleted' ? (
            <>
              <AppButton
                title={
                  user.status === 'suspended'
                    ? vi
                      ? 'Kích hoạt'
                      : 'Activate'
                    : vi
                      ? 'Tạm khóa'
                      : 'Suspend'
                }
                variant="outline"
                loading={status.isPending && status.variables?._id === user._id}
                disabled={status.isPending || role.isPending}
                onPress={() => changeStatus(user)}
              />
              <AppButton
                title={
                  user.role === 'admin'
                    ? vi
                      ? 'Chuyển thành người dùng'
                      : 'Make user'
                    : vi
                      ? 'Cấp quyền admin'
                      : 'Make admin'
                }
                variant="outline"
                disabled={status.isPending || role.isPending}
                onPress={() => role.mutate(user)}
              />
              <AppButton
                title={vi ? 'Xem chi tiết' : 'View details'}
                variant="ghost"
                onPress={() => setSelectedUserId(user._id)}
              />
              <AppButton
                title={vi ? 'Xóa tài khoản' : 'Delete account'}
                variant="ghost"
                disabled={removeUser.isPending || status.isPending || role.isPending}
                onPress={() =>
                  Alert.alert(
                    vi ? 'Xóa tài khoản?' : 'Delete account?',
                    vi
                      ? 'Tài khoản sẽ bị vô hiệu hóa và có thể khôi phục bởi quản trị viên.'
                      : 'The account will be disabled and can be restored by an administrator.',
                    [
                      { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
                      {
                        text: vi ? 'Xóa' : 'Delete',
                        style: 'destructive',
                        onPress: () => removeUser.mutate(user),
                      },
                    ]
                  )
                }
              />
            </>
          ) : (
            <AppButton
              title={vi ? 'Khôi phục tài khoản' : 'Restore account'}
              variant="outline"
              disabled={restoreUser.isPending}
              onPress={() => restoreUser.mutate(user)}
            />
          )}
        </View>
      ))}
      {selectedUserId ? (
        <View style={card}>
          <AppText variant="heading3">
            {vi ? 'Chi tiết tài khoản' : 'Account details'}
          </AppText>
          <FeatureState loading={userDetail.isLoading} error={userDetail.error} />
          {userDetail.data ? (
            <AppText selectable>{JSON.stringify(userDetail.data, null, 2)}</AppText>
          ) : null}
          <AppButton
            title={vi ? 'Đóng' : 'Close'}
            variant="ghost"
            onPress={() => setSelectedUserId(null)}
          />
        </View>
      ) : null}
      <AppText variant="heading2">{vi ? 'Xu hướng' : 'Trends'}</AppText>
      <FeatureState
        loading={contentTrends.isLoading || userTrends.isLoading}
        error={contentTrends.error || userTrends.error}
      />
      {contentTrends.data ? (
        <AppText selectable>{JSON.stringify(contentTrends.data, null, 2)}</AppText>
      ) : null}
      {userTrends.data ? (
        <AppText selectable>{JSON.stringify(userTrends.data, null, 2)}</AppText>
      ) : null}
      <MasterDataPanel />
      <AppText variant="heading2">Audit log</AppText>
      <FeatureState
        loading={logs.isLoading}
        error={logs.error}
        retry={() => void logs.refetch()}
      />
      {logs.data?.data.map((log) => (
        <View key={log._id} style={card}>
          <AppText variant="bodyStrong">{log.action}</AppText>
          <AppText>
            {log.targetType} · {log.targetId}
          </AppText>
          <AppText>{new Date(log.createdAt).toLocaleString()}</AppText>
        </View>
      ))}
    </ScreenWrapper>
  );
}
