import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AppInput, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, spacing, webLayout } from '@/theme';
import { adminApi, type AuditLog } from './adminApi';
import {
  AdminEmptyState,
  AdminFilterChips,
  AdminPageIntro,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminSurface,
} from './AdminUi';

type AuditFilter = 'all' | 'user' | 'content' | 'system';

export function AdminAuditScreen() {
  const { t, locale } = useTranslation();
  const vi = locale === 'vi';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AuditFilter>('all');
  const logs = useQuery({ queryKey: ['admin', 'audit'], queryFn: adminApi.auditLogs });
  const allLogs = logs.data?.data ?? [];
  const counts = {
    all: allLogs.length,
    user: allLogs.filter((log) => auditCategory(log) === 'user').length,
    content: allLogs.filter((log) => auditCategory(log) === 'content').length,
    system: allLogs.filter((log) => auditCategory(log) === 'system').length,
  };
  const groups = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    const filtered = allLogs.filter((log) => {
      const matchesFilter = filter === 'all' || auditCategory(log) === filter;
      const haystack = [log.action, log.targetType, log.targetId, log.actorId]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
      return matchesFilter && (!needle || haystack.includes(needle));
    });
    return filtered.reduce<Array<{ key: string; label: string; items: AuditLog[] }>>(
      (result, log) => {
        const date = new Date(log.createdAt);
        const key = Number.isNaN(date.getTime()) ? 'unknown' : date.toISOString().slice(0, 10);
        const current = result[result.length - 1];
        if (current?.key === key) current.items.push(log);
        else result.push({ key, label: dateLabel(date, vi), items: [log] });
        return result;
      },
      []
    );
  }, [allLogs, filter, search, vi]);
  const resultCount = groups.reduce((total, group) => total + group.items.length, 0);

  return (
    <ScreenWrapper
      webMaxWidth={webLayout.catalogMaxWidth}
      scrollable
      contentContainerStyle={styles.screen}
      header={<CustomHeader title={t('admin.audit.title')} showBack={false} />}
    >
      <AdminPageIntro
        eyebrow={vi ? 'Theo dõi & truy vết' : 'Monitor & trace'}
        title={t('admin.audit.title')}
        description={
          vi
            ? 'Tìm hoạt động theo nhóm và theo ngày, thay vì đọc một dòng sự kiện liên tục.'
            : 'Find activity by category and date instead of scanning one continuous event stream.'
        }
      />
      <FeatureState
        loading={logs.isLoading}
        error={logs.error}
        retry={() => void logs.refetch()}
      />
      {logs.data ? (
        <>
          <AppInput
            type="search"
            label={vi ? 'Tìm trong nhật ký' : 'Search activity'}
            placeholder={vi ? 'Hành động, đối tượng, mã…' : 'Action, target, ID…'}
            value={search}
            onChangeText={setSearch}
          />
          <AdminFilterChips
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: vi ? 'Tất cả' : 'All', count: counts.all },
              { value: 'user', label: vi ? 'Tài khoản' : 'Accounts', count: counts.user },
              { value: 'content', label: vi ? 'Nội dung' : 'Content', count: counts.content },
              { value: 'system', label: vi ? 'Hệ thống' : 'System', count: counts.system },
            ]}
          />
          <AdminSectionHeader
            title={vi ? 'Dòng thời gian' : 'Timeline'}
            description={`${resultCount} ${vi ? 'hoạt động phù hợp' : 'matching activities'}`}
          />
        </>
      ) : null}
      {logs.data && resultCount === 0 ? (
        <AdminEmptyState
          icon="history"
          title={vi ? 'Không tìm thấy hoạt động' : 'No activity found'}
          description={
            vi ? 'Hãy thử từ khóa hoặc nhóm hoạt động khác.' : 'Try a different keyword or activity group.'
          }
        />
      ) : null}
      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <AppText variant="heading4">{group.label}</AppText>
          <View style={styles.timeline}>
            {group.items.map((log) => (
              <View key={log._id} style={styles.timelineRow}>
                <View style={styles.rail}>
                  <View style={styles.dot} />
                  <View style={styles.line} />
                </View>
                <AdminSurface style={styles.card}>
                  <View style={styles.cardHeader}>
                    <AppText variant="bodyStrong" style={styles.actionName}>
                      {formatAction(log.action)}
                    </AppText>
                    <AdminStatusBadge
                      label={categoryLabel(auditCategory(log), vi)}
                      tone={auditCategory(log) === 'system' ? 'info' : 'neutral'}
                    />
                  </View>
                  <AppText variant="bodySmall" color={colors.text.secondary}>
                    {t('admin.audit.target')}: {log.targetType || (vi ? 'Không xác định' : 'Unknown')}
                    {log.targetId ? ` · ${shortId(log.targetId)}` : ''}
                  </AppText>
                  <AppText variant="bodySmall" color={colors.text.secondary}>
                    {formatTime(log.createdAt, vi)}
                    {log.actorId ? ` · ${vi ? 'bởi' : 'by'} ${shortId(log.actorId)}` : ''}
                  </AppText>
                </AdminSurface>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScreenWrapper>
  );
}

function auditCategory(log: AuditLog): Exclude<AuditFilter, 'all'> {
  const value = `${log.targetType ?? ''} ${log.action}`.toLocaleLowerCase();
  if (/user|account|role|suspend|activate|auth/.test(value)) return 'user';
  if (/post|recipe|video|content|report|moderation|comment/.test(value)) return 'content';
  return 'system';
}

function categoryLabel(category: Exclude<AuditFilter, 'all'>, vi: boolean) {
  if (category === 'user') return vi ? 'Tài khoản' : 'Account';
  if (category === 'content') return vi ? 'Nội dung' : 'Content';
  return vi ? 'Hệ thống' : 'System';
}

function formatAction(action: string) {
  return action
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toLocaleUpperCase());
}

function dateLabel(date: Date, vi: boolean) {
  if (Number.isNaN(date.getTime())) return vi ? 'Không rõ ngày' : 'Unknown date';
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toDateString();
  if (date.toDateString() === today) return vi ? 'Hôm nay' : 'Today';
  if (date.toDateString() === yesterday) return vi ? 'Hôm qua' : 'Yesterday';
  return date.toLocaleDateString(vi ? 'vi-VN' : 'en-US', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(value: string, vi: boolean) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleTimeString(vi ? 'vi-VN' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
}

function shortId(value: string) {
  return value.length > 12 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  group: { gap: spacing.md },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm },
  rail: { width: 16, alignItems: 'center' },
  dot: {
    width: 10,
    height: 10,
    marginTop: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary[700],
    borderRadius: 5,
    backgroundColor: colors.background.base,
  },
  line: { flex: 1, width: 1, backgroundColor: colors.border.default },
  card: { flex: 1, marginBottom: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  actionName: { flex: 1, minWidth: 0 },
});
