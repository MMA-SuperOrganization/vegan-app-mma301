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
import {
  ADMIN_QUERY_KEYS,
  ADMIN_ROUTES,
  ADMIN_TRANSLATION_KEYS,
  ADMIN_USER_ROLE_LABEL_KEYS,
  ADMIN_USER_STATUS_LABEL_KEYS,
  AdminUserRole,
  AdminUserStatus,
} from './adminConstants';
import { MasterDataPanel } from './MasterDataPanel';

export function AdminDashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const keys = ADMIN_TRANSLATION_KEYS.DASHBOARD;
  const client = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const summary = useQuery({
    queryKey: ADMIN_QUERY_KEYS.SUMMARY,
    queryFn: adminApi.summary,
  });
  const users = useQuery({
    queryKey: ADMIN_QUERY_KEYS.USERS(search),
    queryFn: () => adminApi.users(search),
  });
  const userDetail = useQuery({
    queryKey: ADMIN_QUERY_KEYS.USER_DETAIL(selectedUserId),
    queryFn: () => adminApi.userDetail(selectedUserId!),
    enabled: Boolean(selectedUserId),
  });
  const contentTrends = useQuery({
    queryKey: ADMIN_QUERY_KEYS.CONTENT_TRENDS,
    queryFn: adminApi.contentTrends,
  });
  const userTrends = useQuery({
    queryKey: ADMIN_QUERY_KEYS.USER_TRENDS,
    queryFn: adminApi.userTrends,
  });
  const logs = useQuery({
    queryKey: ADMIN_QUERY_KEYS.AUDIT_LOGS,
    queryFn: adminApi.auditLogs,
  });

  const invalidateAdmin = () =>
    client.invalidateQueries({ queryKey: ADMIN_QUERY_KEYS.ROOT });

  const status = useMutation({
    mutationFn: adminApi.setStatus,
    onSuccess: invalidateAdmin,
  });
  const role = useMutation({
    mutationFn: adminApi.changeRole,
    onSuccess: invalidateAdmin,
  });
  const removeUser = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: invalidateAdmin,
  });
  const restoreUser = useMutation({
    mutationFn: adminApi.restoreUser,
    onSuccess: invalidateAdmin,
  });

  const changeStatus = (user: AdminUser) => {
    const activate = user.status === AdminUserStatus.SUSPENDED;
    Alert.alert(
      activate ? t(keys.ACTIVATE_TITLE) : t(keys.SUSPEND_TITLE),
      user.displayName || user.name || user.email,
      [
        { text: t(keys.CANCEL), style: 'cancel' },
        {
          text: t(keys.CONFIRM),
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
          title={t(keys.TITLE)}
          showBack
          backFallbackHref={ADMIN_ROUTES.BACK_FALLBACK}
        />
      }
    >
      <View style={card}>
        <AppText variant="heading2">{t(keys.CENTER_TITLE)}</AppText>
        <AppText color={colors.text.secondary}>
          {t(keys.CENTER_DESCRIPTION)}
        </AppText>
        <AppButton
          title={t(keys.REVIEW_CONTENT)}
          onPress={() => router.push(ADMIN_ROUTES.MODERATION)}
        />
        <AppButton
          title={t(keys.AI_MONITORING)}
          variant="outline"
          onPress={() => router.push(ADMIN_ROUTES.AI_MONITORING)}
        />
      </View>

      <FeatureState
        loading={summary.isLoading}
        error={summary.error}
        retry={() => void summary.refetch()}
      />
      {summary.data ? (
        <View style={card}>
          <AppText variant="heading3">{t(keys.OVERVIEW)}</AppText>
          <AppText>
            {t(keys.USERS)}: {summary.data.users.total}
          </AppText>
          <AppText>
            {t(keys.ACTIVE)}: {summary.data.users.active}
          </AppText>
          <AppText>
            {t(keys.SUSPENDED)}: {summary.data.users.suspended}
          </AppText>
          {Object.entries(summary.data.content).map(([type, value]) => (
            <AppText key={type}>
              {type}: {value.pending} {t(keys.PENDING)} · {value.hidden}{' '}
              {t(keys.HIDDEN)}
            </AppText>
          ))}
        </View>
      ) : null}

      <AppText variant="heading2">{t(keys.ACCOUNTS)}</AppText>
      <AppInput
        label={t(keys.SEARCH_LABEL)}
        value={searchText}
        onChangeText={setSearchText}
      />
      <AppButton
        title={t(keys.SEARCH_ACTION)}
        variant="outline"
        onPress={() => setSearch(searchText.trim())}
      />
      <FeatureState
        loading={users.isLoading}
        error={users.error || status.error || removeUser.error || restoreUser.error}
        retry={() => void users.refetch()}
      />
      {users.data?.data.map((user) => {
        const roleLabel =
          t(ADMIN_USER_ROLE_LABEL_KEYS[user.role as AdminUserRole]) || user.role;
        const statusLabel =
          t(ADMIN_USER_STATUS_LABEL_KEYS[user.status as AdminUserStatus]) ||
          user.status;
        return (
          <View key={user._id} style={card}>
            <AppText variant="heading4">
              {user.displayName || user.name || user.email || user._id}
            </AppText>
            <AppText>{user.email}</AppText>
            <AppText>
              {roleLabel} · {statusLabel}
            </AppText>
            {user.status !== AdminUserStatus.DELETED ? (
              <>
                <AppButton
                  title={
                    user.status === AdminUserStatus.SUSPENDED
                      ? t(keys.ACTIVATE)
                      : t(keys.SUSPEND)
                  }
                  variant="outline"
                  loading={status.isPending && status.variables?._id === user._id}
                  disabled={status.isPending || role.isPending}
                  onPress={() => changeStatus(user)}
                />
                <AppButton
                  title={
                    user.role === AdminUserRole.ADMIN
                      ? t(keys.MAKE_USER)
                      : t(keys.MAKE_ADMIN)
                  }
                  variant="outline"
                  disabled={status.isPending || role.isPending}
                  onPress={() => role.mutate(user)}
                />
                <AppButton
                  title={t(keys.VIEW_DETAILS)}
                  variant="ghost"
                  onPress={() => setSelectedUserId(user._id)}
                />
                <AppButton
                  title={t(keys.DELETE_ACCOUNT)}
                  variant="ghost"
                  disabled={
                    removeUser.isPending || status.isPending || role.isPending
                  }
                  onPress={() =>
                    Alert.alert(
                      t(keys.DELETE_CONFIRM_TITLE),
                      t(keys.DELETE_CONFIRM_BODY),
                      [
                        { text: t(keys.CANCEL), style: 'cancel' },
                        {
                          text: t(keys.DELETE_ACTION),
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
                title={t(keys.RESTORE_ACCOUNT)}
                variant="outline"
                disabled={restoreUser.isPending}
                onPress={() => restoreUser.mutate(user)}
              />
            )}
          </View>
        );
      })}

      {selectedUserId ? (
        <View style={card}>
          <AppText variant="heading3">{t(keys.ACCOUNT_DETAILS)}</AppText>
          <FeatureState loading={userDetail.isLoading} error={userDetail.error} />
          {userDetail.data ? (
            <AppText selectable>{JSON.stringify(userDetail.data, null, 2)}</AppText>
          ) : null}
          <AppButton
            title={t(keys.CLOSE)}
            variant="ghost"
            onPress={() => setSelectedUserId(null)}
          />
        </View>
      ) : null}

      <AppText variant="heading2">{t(keys.TRENDS)}</AppText>
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

      <AppText variant="heading2">{t(keys.AUDIT_LOG)}</AppText>
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
