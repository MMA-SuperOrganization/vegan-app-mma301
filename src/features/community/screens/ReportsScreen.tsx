import { StyleSheet, View } from 'react-native';
import {
  AppText,
  Badge,
  CustomHeader,
  EmptyState,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { InfoRow, ReportDivider, SectionLabel } from '../components/ReportInfo';
import { useReports } from '../hooks';
import { reportReasons, reportTargetLabels } from '../reportOptions';
import { formatReportCode, formatReportDateTime } from '../reportPresentation';
import { postStatusLabel } from '../status';
import type { UserReport } from '../types';
import type { BadgeVariant } from '@/components/ui/Badge/Badge.types';

const statusVariants: Record<UserReport['status'], BadgeVariant> = {
  open: 'neutral',
  reviewing: 'warning',
  resolved: 'success',
  dismissed: 'danger',
};

/** Final outcomes get a solid system colour: approved = success, rejected = danger. */
const outcomeColors: Partial<Record<UserReport['status'], string>> = {
  resolved: colors.status.success,
  dismissed: colors.status.danger,
};

export function ReportsScreen() {
  const vi = useTranslation().locale === 'vi';
  const locale = vi ? 'vi' : 'en';
  const actions = useReports();
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={styles.content}
      header={
        <CustomHeader
          title={vi ? 'Báo cáo của tôi' : 'My reports'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
    >
      <FeatureState
        loading={actions.query.isLoading}
        error={actions.query.error}
        retry={() => void actions.query.refetch()}
      />
      {actions.query.data?.data.length === 0 ? (
        <EmptyState
          title={vi ? 'Bạn chưa gửi báo cáo nào' : 'No reports submitted yet'}
          description={
            vi
              ? 'Các báo cáo bạn gửi sẽ hiển thị tại đây.'
              : 'Reports you submit will appear here.'
          }
        />
      ) : null}
      {actions.query.data?.data.map((report) => {
        const submittedAt = formatReportDateTime(report.createdAt, locale);
        const outcomeColor = outcomeColors[report.status];
        return (
          <Surface
            key={report._id}
            bordered
            padding="lg"
            radius="md"
            style={[
              styles.card,
              outcomeColor && {
                borderLeftWidth: 4,
                borderLeftColor: outcomeColor,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.codeBlock}>
                <SectionLabel>{vi ? 'Mã báo cáo' : 'Report ID'}</SectionLabel>
                <AppText variant="bodyStrong">#{formatReportCode(report._id)}</AppText>
              </View>
              <Badge
                size="sm"
                variant={statusVariants[report.status] ?? 'neutral'}
                label={postStatusLabel(report.status, vi)}
                style={[
                  styles.statusBadge,
                  outcomeColor && {
                    backgroundColor: outcomeColor,
                    borderColor: outcomeColor,
                  },
                ]}
                textStyle={outcomeColor ? styles.outcomeLabel : undefined}
              />
            </View>

            <ReportDivider />

            <View style={styles.infoTable}>
              <InfoRow
                label={vi ? 'Đối tượng' : 'Target'}
                value={reportTargetLabels[report.targetType]?.[locale] ?? report.targetType}
              />
              <InfoRow
                label={vi ? 'Lý do' : 'Reason'}
                value={
                  reportReasons.find((entry) => entry.value === report.reason)?.[locale] ??
                  report.reason
                }
              />
              {submittedAt ? (
                <InfoRow label={vi ? 'Ngày gửi' : 'Submitted'} value={submittedAt} />
              ) : null}
            </View>

            {report.description ? (
              <View style={styles.section}>
                <SectionLabel>{vi ? 'Nội dung báo cáo' : 'Report details'}</SectionLabel>
                <AppText>{report.description}</AppText>
              </View>
            ) : null}

            {report.resolution ? (
              <View
                style={[
                  styles.response,
                  outcomeColor && { borderLeftColor: outcomeColor },
                ]}
              >
                <SectionLabel>
                  {vi ? 'Phản hồi từ quản trị viên' : 'Moderator response'}
                </SectionLabel>
                <AppText>{report.resolution}</AppText>
              </View>
            ) : null}
          </Surface>
        );
      })}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, gap: spacing.lg },
  card: { gap: spacing.md },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  codeBlock: { flex: 1, minWidth: 0, gap: 2 },
  statusBadge: { borderRadius: radius.sm },
  outcomeLabel: { color: colors.common.white },
  infoTable: { gap: spacing.sm },
  section: { gap: spacing.xs },
  response: {
    gap: spacing.xs,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[700],
  },
});
