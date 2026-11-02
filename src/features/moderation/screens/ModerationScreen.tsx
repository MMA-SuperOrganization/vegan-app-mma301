import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppInput, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import {
  AdminEmptyState,
  AdminFilterChips,
  AdminPageIntro,
  AdminSectionHeader,
  AdminSegmentedTabs,
} from '@/features/admin/AdminUi';
import { useTranslation } from '@/i18n';
import { colors, spacing, webLayout } from '@/theme';
import { useModeration } from '../hooks';
import { ReviewCard } from '../components/ReviewCard';
import { ReportReviewCard } from '../components/ReportReviewCard';
import { CaseReviewCard } from '../components/CaseReviewCard';

type ModerationTab = 'pending' | 'reports' | 'cases';
type WorkFilter = 'all' | 'open' | 'reviewing' | 'closed';

export function ModerationScreen({ showBack = true }: { showBack?: boolean }) {
  const { locale, t } = useTranslation();
  const vi = locale === 'vi';
  const actions = useModeration();
  const [tab, setTab] = useState<ModerationTab>('pending');
  const [filter, setFilter] = useState<WorkFilter>('all');
  const [search, setSearch] = useState('');
  const query = actions[tab];
  const pending = actions.pending.data?.data ?? [];
  const reports = actions.reports.data?.data ?? [];
  const cases = actions.cases.data?.data ?? [];
  const filterCounts = {
    all: tab === 'reports' ? reports.length : cases.length,
    open:
      tab === 'reports'
        ? reports.filter((item) => item.status === 'open').length
        : cases.filter((item) => item.status === 'open').length,
    reviewing:
      tab === 'reports'
        ? reports.filter((item) => item.status === 'reviewing').length
        : cases.filter((item) => item.status === 'reviewing').length,
    closed:
      tab === 'reports'
        ? reports.filter((item) => ['resolved', 'dismissed'].includes(item.status)).length
        : cases.filter((item) => ['resolved', 'dismissed'].includes(item.status)).length,
  };
  const needle = search.trim().toLocaleLowerCase();
  const visiblePending = useMemo(
    () =>
      pending.filter((item) =>
        `${item.title} ${item.type}`.toLocaleLowerCase().includes(needle)
      ),
    [needle, pending]
  );
  const visibleReports = useMemo(
    () =>
      reports.filter((item) => {
        const matchesStatus =
          filter === 'all' ||
          (filter === 'closed'
            ? ['resolved', 'dismissed'].includes(item.status)
            : item.status === filter);
        const matchesSearch = `${item.targetType} ${item.reason} ${item.description ?? ''}`
          .toLocaleLowerCase()
          .includes(needle);
        return matchesStatus && matchesSearch;
      }),
    [filter, needle, reports]
  );
  const visibleCases = useMemo(
    () =>
      cases.filter((item) => {
        const matchesStatus =
          filter === 'all' ||
          (filter === 'closed'
            ? ['resolved', 'dismissed'].includes(item.status)
            : item.status === filter);
        const matchesSearch = `${item.targetType} ${item.priority} ${item.resolution ?? ''}`
          .toLocaleLowerCase()
          .includes(needle);
        return matchesStatus && matchesSearch;
      }),
    [cases, filter, needle]
  );
  const visibleCount =
    tab === 'pending'
      ? visiblePending.length
      : tab === 'reports'
        ? visibleReports.length
        : visibleCases.length;

  const selectTab = (value: ModerationTab) => {
    setTab(value);
    setFilter('all');
    setSearch('');
  };

  return (
    <ScreenWrapper
      scrollable
      webMaxWidth={webLayout.catalogMaxWidth}
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={t('admin.moderation.title')}
          showBack={showBack}
          backFallbackHref="/admin"
        />
      }
    >
      <AdminPageIntro
        eyebrow={vi ? 'Hàng đợi vận hành' : 'Operations queue'}
        title={t('admin.moderation.title')}
        description={
          vi
            ? 'Tách nội dung chờ duyệt, báo cáo và hồ sơ để xử lý từng loại công việc đúng ngữ cảnh.'
            : 'Separate pending content, reports, and cases so each workflow keeps the right context.'
        }
      />
      <AdminSegmentedTabs
        value={tab}
        onChange={selectTab}
        options={[
          {
            value: 'pending',
            label: t('admin.moderation.pending'),
            count: pending.length,
          },
          {
            value: 'reports',
            label: t('admin.moderation.reports'),
            count: reports.length,
          },
          {
            value: 'cases',
            label: t('admin.moderation.cases'),
            count: cases.length,
          },
        ]}
      />
      <AppInput
        type="search"
        label={vi ? 'Tìm trong nhóm đang xem' : 'Search current queue'}
        placeholder={
          tab === 'pending'
            ? vi
              ? 'Tiêu đề hoặc loại nội dung…'
              : 'Title or content type…'
            : vi
              ? 'Loại, lý do hoặc trạng thái…'
              : 'Type, reason, or status…'
        }
        value={search}
        onChangeText={setSearch}
      />
      {tab !== 'pending' ? (
        <AdminFilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: vi ? 'Tất cả' : 'All', count: filterCounts.all },
            { value: 'open', label: vi ? 'Mới' : 'Open', count: filterCounts.open },
            {
              value: 'reviewing',
              label: vi ? 'Đang xử lý' : 'Reviewing',
              count: filterCounts.reviewing,
            },
            { value: 'closed', label: vi ? 'Đã đóng' : 'Closed', count: filterCounts.closed },
          ]}
        />
      ) : null}
      <FeatureState
        loading={query.isLoading}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {!query.isLoading && !query.error ? (
        <AdminSectionHeader
          title={
            tab === 'pending'
              ? t('admin.moderation.pending')
              : tab === 'reports'
                ? t('admin.moderation.reports')
                : t('admin.moderation.cases')
          }
          description={`${visibleCount} ${vi ? 'mục phù hợp' : 'matching items'}`}
        />
      ) : null}
      {!query.isLoading && !query.error && visibleCount === 0 ? (
        <AdminEmptyState
          icon="flag"
          title={vi ? 'Không có việc cần hiển thị' : 'Nothing to show'}
          description={
            search || filter !== 'all'
              ? vi
                ? 'Thử thay đổi từ khóa hoặc bộ lọc.'
                : 'Try changing the search term or filter.'
              : vi
                ? 'Hàng đợi này hiện đã được xử lý hết.'
                : 'This queue is currently clear.'
          }
        />
      ) : null}
      <View style={styles.results}>
        {tab === 'pending'
          ? visiblePending.map((item) => (
              <ReviewCard key={item._id} target={item} vi={vi} />
            ))
          : tab === 'reports'
            ? visibleReports.map((item) => (
                <ReportReviewCard key={item._id} report={item} vi={vi} />
              ))
            : visibleCases.map((item) => (
                <CaseReviewCard key={item._id} item={item} vi={vi} />
              ))}
      </View>
      {visibleCount > 4 ? (
        <AppText variant="bodySmall" color={colors.text.secondary} style={styles.hint}>
          {vi
            ? 'Mẹo: dùng tìm kiếm và bộ lọc để rút gọn hàng đợi trước khi xử lý.'
            : 'Tip: use search and filters to narrow the queue before taking action.'}
        </AppText>
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  results: { gap: spacing.md },
  hint: { textAlign: 'center' },
});
