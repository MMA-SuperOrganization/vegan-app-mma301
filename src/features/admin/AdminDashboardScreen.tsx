import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, spacing, webLayout } from '@/theme';
import { adminApi } from './adminApi';
import {
  AdminActionCard,
  AdminMetricCard,
  AdminPageIntro,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminSurface,
} from './AdminUi';

export function AdminDashboardScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const vi = locale === 'vi';
  const summary = useQuery({
    queryKey: ['admin', 'summary'],
    queryFn: adminApi.summary,
  });
  const content = summary.data ? Object.entries(summary.data.content) : [];
  const pendingTotal = content.reduce((total, [, value]) => total + value.pending, 0);
  const hiddenTotal = content.reduce((total, [, value]) => total + value.hidden, 0);

  return (
    <ScreenWrapper
      webMaxWidth={webLayout.catalogMaxWidth}
      scrollable
      contentContainerStyle={styles.screen}
      header={<CustomHeader title={t('admin.title')} showBack={false} />}
    >
      <AdminPageIntro
        eyebrow={vi ? 'Không gian quản trị' : 'Admin workspace'}
        title={t('admin.overview.title')}
        description={
          vi
            ? 'Ưu tiên việc cần xử lý, theo dõi sức khỏe hệ thống và đi nhanh đến đúng công cụ.'
            : 'Prioritize work, monitor system health, and jump directly to the right tool.'
        }
      />

      <FeatureState
        loading={summary.isLoading}
        error={summary.error}
        retry={() => void summary.refetch()}
      />

      {summary.data ? (
        <>
          <AdminSectionHeader
            title={vi ? 'Tình hình hôm nay' : 'At a glance'}
            description={
              vi ? 'Những chỉ số cần chú ý trước tiên' : 'The numbers that need attention first'
            }
          />
          <View style={styles.metrics}>
            <AdminMetricCard
              label={t('admin.overview.users')}
              value={summary.data.users.total}
              hint={`${summary.data.users.newInRange} ${vi ? 'mới trong kỳ' : 'new in range'}`}
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
                title={vi ? 'Nội dung theo loại' : 'Content by type'}
                description={
                  vi
                    ? 'Phân loại hàng chờ thay vì trộn tất cả nội dung'
                    : 'A categorized view of the moderation queue'
                }
              />
              {content.map(([type, value]) => (
                <View key={type} style={styles.contentRow}>
                  <View style={styles.contentName}>
                    <AppText variant="bodyStrong">{formatContentType(type, vi)}</AppText>
                    <AppText variant="bodySmall" color={colors.text.secondary}>
                      {value.publishedInRange} {vi ? 'đã xuất bản trong kỳ' : 'published in range'}
                    </AppText>
                  </View>
                  <View style={styles.badges}>
                    <AdminStatusBadge
                      label={`${value.pending} ${t('admin.overview.pending').toLocaleLowerCase()}`}
                      tone={value.pending ? 'warning' : 'success'}
                    />
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
        description={vi ? 'Công cụ thường dùng' : 'Frequently used tools'}
      />
      <View style={styles.actions}>
        <AdminActionCard
          icon="flag"
          title={t('admin.overview.moderation')}
          description={
            vi ? 'Xử lý nội dung chờ duyệt, báo cáo và hồ sơ' : 'Review pending content, reports, and cases'
          }
          onPress={() => router.push('/admin/moderation')}
        />
        <AdminActionCard
          icon="user"
          title={t('admin.tabs.users')}
          description={
            vi ? 'Tìm kiếm, phân loại và quản lý quyền tài khoản' : 'Find, filter, and manage account access'
          }
          onPress={() => router.push('/admin/users')}
        />
        <AdminActionCard
          icon="pantry"
          title={t('admin.tabs.masterData')}
          description={
            vi ? 'Quản lý danh mục, dị nguyên và thực phẩm' : 'Manage categories, allergens, and foods'
          }
          onPress={() => router.push('/admin/master-data')}
        />
        <AdminActionCard
          icon="spark"
          title={t('admin.overview.aiMonitoring')}
          description={
            vi ? 'Theo dõi trạng thái và hoạt động của dịch vụ AI' : 'Monitor AI service status and activity'
          }
          onPress={() => router.push('/ai/monitoring')}
        />
      </View>
    </ScreenWrapper>
  );
}

function formatContentType(type: string, vi: boolean) {
  const labels: Record<string, [string, string]> = {
    post: ['Bài viết', 'Posts'],
    posts: ['Bài viết', 'Posts'],
    recipe: ['Công thức', 'Recipes'],
    recipes: ['Công thức', 'Recipes'],
    video: ['Video', 'Videos'],
    videos: ['Video', 'Videos'],
  };
  return labels[type.toLocaleLowerCase()]?.[vi ? 0 : 1] ?? type;
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
