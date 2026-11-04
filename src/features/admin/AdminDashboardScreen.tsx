import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, spacing, webLayout } from '@/theme';
import { adminApi } from './adminApi';
import {
  AdminActionCard,
  AdminMetricCard,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminSurface,
} from './AdminUi';

export function AdminDashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const summary = useQuery({
    queryKey: ['admin', 'summary'],
    queryFn: adminApi.summary,
  });
  const content = summary.data ? Object.entries(summary.data.content) : [];
  const pendingTotal = content.reduce(
    (total, [type, value]) =>
      isPostContentType(type) ? total : total + value.pending,
    0
  );
  const hiddenTotal = content.reduce((total, [, value]) => total + value.hidden, 0);

  return (
    <ScreenWrapper
      webMaxWidth={webLayout.catalogMaxWidth}
      scrollable
      contentContainerStyle={styles.screen}
      header={<CustomHeader title={t('admin.title')} showBack={false} />}
    >
      <FeatureState
        loading={summary.isLoading}
        error={summary.error}
        retry={() => void summary.refetch()}
      />

      {summary.data ? (
        <>
          <AdminSectionHeader
            title={t('admin.overview.glanceTitle')}
            description={t('admin.overview.glanceDescription')}
          />
          <View style={styles.metrics}>
            <AdminMetricCard
              label={t('admin.overview.users')}
              value={summary.data.users.total}
              hint={t('admin.overview.newInRange', {
                count: summary.data.users.newInRange,
              })}
            />
            <AdminMetricCard
              label={t('admin.overview.active')}
              value={summary.data.users.active}
              tone="success"
            />
            <AdminMetricCard
              label={t('admin.overview.suspended')}
              value={summary.data.users.suspended}
              tone="danger"
            />
            <AdminMetricCard
              label={t('admin.overview.pending')}
              value={pendingTotal}
              hint={`${hiddenTotal} ${t('admin.overview.hidden').toLocaleLowerCase()}`}
              tone="warning"
            />
          </View>

          {content.length ? (
            <AdminSurface>
              <AdminSectionHeader
                title={t('admin.overview.contentByType')}
                description={t('admin.overview.contentByTypeDescription')}
              />
              {content.map(([type, value]) => (
                <View key={type} style={styles.contentRow}>
                  <View style={styles.contentName}>
                    <AppText variant="bodyStrong">
                      {formatContentType(type, t)}
                    </AppText>
                    <AppText variant="bodySmall" color={colors.text.secondary}>
                      {t('admin.overview.publishedInRange', {
                        count: value.publishedInRange,
                      })}
                    </AppText>
                  </View>
                  <View style={styles.badges}>
                    {!isPostContentType(type) ? (
                      <AdminStatusBadge
                        label={`${value.pending} ${t('admin.overview.pending').toLocaleLowerCase()}`}
                        tone={value.pending ? 'warning' : 'success'}
                      />
                    ) : null}
                    <AdminStatusBadge
                      label={`${value.hidden} ${t('admin.overview.hidden').toLocaleLowerCase()}`}
                      tone={value.hidden ? 'danger' : 'neutral'}
                    />
                  </View>
                </View>
              ))}
            </AdminSurface>
          ) : null}
        </>
      ) : null}

      <AdminSectionHeader
        title={t('admin.overview.quickActions')}
        description={t('admin.overview.quickActionsDescription')}
      />
      <View style={styles.actions}>
        <AdminActionCard
          icon="flag"
          title={t('admin.overview.moderation')}
          description={t('admin.overview.moderationDescription')}
          onPress={() => router.push('/admin/moderation')}
        />
        <AdminActionCard
          icon="user"
          title={t('admin.tabs.users')}
          description={t('admin.overview.usersDescription')}
          onPress={() => router.push('/admin/users')}
        />
        <AdminActionCard
          icon="pantry"
          title={t('admin.tabs.masterData')}
          description={t('admin.overview.masterDataDescription')}
          onPress={() => router.push('/admin/master-data')}
        />
        <AdminActionCard
          icon="spark"
          title={t('admin.overview.aiMonitoring')}
          description={t('admin.overview.aiDescription')}
          onPress={() => router.push('/ai/monitoring')}
        />
      </View>
    </ScreenWrapper>
  );
}

function formatContentType(type: string, t: (key: TranslationKey) => string) {
  const labels: Record<string, TranslationKey> = {
    post: 'admin.overview.contentType.post',
    posts: 'admin.overview.contentType.post',
    recipe: 'admin.overview.contentType.recipe',
    recipes: 'admin.overview.contentType.recipe',
    video: 'admin.overview.contentType.video',
    videos: 'admin.overview.contentType.video',
  };
  const key = labels[type.toLocaleLowerCase()];
  return key ? t(key) : type;
}

function isPostContentType(type: string) {
  return ['post', 'posts'].includes(type.toLocaleLowerCase());
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actions: { gap: spacing.md },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
  },
  contentName: { flex: 1, minWidth: 0, gap: spacing.xs },
  badges: { alignItems: 'flex-end', gap: spacing.xs },
});
