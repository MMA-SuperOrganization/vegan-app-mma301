import { useMemo, useState } from 'react';
import { getUserErrorMessage } from '@/services/errors';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppButton,
  AppIcon,
  AppText,
  EmptyState,
  LoadingSpinner,
  SettingsScreenLayout,
} from '@/components';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useNotificationActions, useNotifications } from '../hooks';
import type { NotificationItem } from '../types';
import { notificationHref } from '../notificationNavigation';

type NotificationGroup = 'reminder' | 'social';
type GroupFilter = 'all' | NotificationGroup;
type IconName = 'clock' | 'utensils' | 'water' | 'comment' | 'heart' | 'spark';

const PAGE_SIZE = 10;
const REMINDER_TYPES = ['meal', 'water', 'custom'];

/** Presentation-only grouping: reminders vs. community/social activity. */
function groupOf(item: NotificationItem): NotificationGroup {
  return REMINDER_TYPES.includes(item.type) || item.data?.reminderId
    ? 'reminder'
    : 'social';
}

function iconOf(item: NotificationItem): IconName {
  if (item.type === 'meal') return 'utensils';
  if (item.type === 'water') return 'water';
  if (groupOf(item) === 'reminder') return 'clock';
  const hint = `${item.type} ${item.data?.event ?? ''}`.toLowerCase();
  if (hint.includes('comment')) return 'comment';
  if (hint.includes('reaction') || hint.includes('like') || hint.includes('love'))
    return 'heart';
  return 'spark';
}

type Row =
  | { kind: 'header'; group: NotificationGroup }
  | { kind: 'item'; item: NotificationItem };

// Social bodies look like "<name> commented on your post." – split so the actor
// and the action can be emphasised without touching the stored text.
const ACTOR_PATTERN =
  /^(.+?)\s+(commented on|replied to|reacted to|reacted|liked|loved|shared)\b(.*)$/i;

function parseActor(item: NotificationItem) {
  if (groupOf(item) !== 'social') return null;
  const match = ACTOR_PATTERN.exec(item.body);
  return match ? { actor: match[1], action: match[2], rest: match[3] } : null;
}

function formatTime(value: string, locale: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (Number.isNaN(diff)) return '';
  const vi = locale === 'vi';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return vi ? 'Vừa xong' : 'Just now';
  if (minutes < 60) return vi ? `${minutes} phút trước` : `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return vi ? `${hours} giờ trước` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return vi ? `${days} ngày trước` : `${days}d ago`;
  return date.toLocaleString(locale);
}

export function NotificationInboxScreen() {
  const { t, locale } = useTranslation();
  const vi = locale === 'vi';
  const goBack = useSafeBack('/(tabs)/profile');
  const router = useRouter();
  const notifications = useNotifications();
  const actions = useNotificationActions();
  const [filter, setFilter] = useState<GroupFilter>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const unread = notifications.data?.data.filter((item) => !item.readAt).length ?? 0;
  const openNotification = async (item: NotificationItem) => {
    if (!item.readAt) {
      try {
        await actions.markRead.mutateAsync(item._id);
      } catch {
        // Opening the related content should not be blocked by a read-state sync failure.
      }
    }
    const href = notificationHref(item);
    if (href) router.push(href);
  };

  const groups = useMemo(() => {
    const items = notifications.data?.data ?? [];
    const reminder = items.filter((item) => groupOf(item) === 'reminder');
    const social = items.filter((item) => groupOf(item) === 'social');
    const unreadIn = (list: NotificationItem[]) =>
      list.filter((item) => !item.readAt).length;
    return {
      reminder: { items: reminder, unread: unreadIn(reminder) },
      social: { items: social, unread: unreadIn(social) },
    };
  }, [notifications.data?.data]);

  const hasItems = Boolean(notifications.data?.data.length);
  // "Latest" is a short glance at the newest items; the group tabs page 10 at a time.
  const source =
    filter === 'all' ? (notifications.data?.data ?? []) : groups[filter].items;
  const shown =
    filter === 'all' ? source.slice(0, PAGE_SIZE) : source.slice(0, visibleCount);
  const canLoadMore = filter !== 'all' && visibleCount < source.length;

  const rows: Row[] = [];
  if (filter === 'all') {
    for (const group of ['reminder', 'social'] as const) {
      const items = shown.filter((item) => groupOf(item) === group);
      if (!items.length) continue;
      rows.push({ kind: 'header', group });
      for (const item of items) rows.push({ kind: 'item', item });
    }
  } else {
    for (const item of shown) rows.push({ kind: 'item', item });
  }

  const selectFilter = (next: GroupFilter) => {
    setFilter(next);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <SettingsScreenLayout
      title={t('notifications.title')}
      onBack={goBack}
      scrollable={false}
      contentContainerStyle={styles.layout}
    >
      <FlatList
        data={rows}
        keyExtractor={(row) =>
          row.kind === 'header' ? `header-${row.group}` : row.item._id
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        initialNumToRender={PAGE_SIZE}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (canLoadMore) setVisibleCount((count) => count + PAGE_SIZE);
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText color={colors.text.secondary}>
              {t('notifications.unreadCount', { count: unread })}
            </AppText>
            {hasItems ? (
              <View style={styles.filters}>
                <FilterChip
                  label={vi ? 'Mới nhất' : 'Latest'}
                  count={unread}
                  selected={filter === 'all'}
                  onPress={() => selectFilter('all')}
                />
                <FilterChip
                  label={vi ? 'Nhắc hẹn' : 'Reminders'}
                  count={groups.reminder.unread}
                  selected={filter === 'reminder'}
                  onPress={() => selectFilter('reminder')}
                />
                <FilterChip
                  label={vi ? 'Cộng đồng' : 'Community'}
                  count={groups.social.unread}
                  selected={filter === 'social'}
                  onPress={() => selectFilter('social')}
                />
              </View>
            ) : null}
            {notifications.isLoading ? (
              <LoadingSpinner text={t('notifications.loading')} />
            ) : null}
            {notifications.isError ? (
              <EmptyState
                title={t('notifications.loadError')}
                description={getUserErrorMessage(notifications.error)}
                actionLabel={t('common.retry')}
                onAction={() => void notifications.refetch()}
              />
            ) : null}
            {!notifications.isLoading &&
            !notifications.isError &&
            !notifications.data?.data.length ? (
              <EmptyState
                title={t('notifications.empty')}
                description={t('notifications.emptyDescription')}
              />
            ) : null}
            {hasItems && shown.length === 0 ? (
              <AppText color={colors.text.secondary} style={styles.emptyGroup}>
                {vi
                  ? 'Chưa có thông báo trong mục này.'
                  : 'No notifications in this section yet.'}
              </AppText>
            ) : null}
          </View>
        }
        renderItem={({ item: row }) =>
          row.kind === 'header' ? (
            <View style={styles.sectionHeader}>
              <AppText variant="heading4" style={styles.sectionTitle}>
                {row.group === 'reminder'
                  ? vi
                    ? 'Nhắc hẹn'
                    : 'Reminders'
                  : vi
                    ? 'Cộng đồng & bài viết'
                    : 'Community & posts'}
              </AppText>
              {groups[row.group].unread > 0 ? (
                <AppText variant="caption" color={colors.primary[700]}>
                  {vi
                    ? `${groups[row.group].unread} chưa đọc`
                    : `${groups[row.group].unread} unread`}
                </AppText>
              ) : null}
            </View>
          ) : (
            <NotificationCard
              item={row.item}
              locale={locale}
              pending={actions.markRead.isPending}
              onOpen={() => void openNotification(row.item)}
            />
          )
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {canLoadMore ? (
              <LoadingSpinner text={vi ? 'Đang tải thêm…' : 'Loading more…'} />
            ) : null}
            {hasItems ? (
              <AppButton
                title={t('notifications.markAllRead')}
                variant="outline"
                loading={actions.markAllRead.isPending}
                disabled={!unread}
                onPress={() => actions.markAllRead.mutate()}
              />
            ) : null}
          </View>
        }
      />
    </SettingsScreenLayout>
  );
}

function FilterChip({
  label,
  count,
  selected,
  onPress,
}: {
  label: string;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <AppText
        variant="caption"
        color={selected ? colors.text.inverse : colors.text.secondary}
      >
        {label}
      </AppText>
      {count > 0 ? (
        <View style={[styles.chipBadge, selected && styles.chipBadgeSelected]}>
          <AppText
            variant="caption"
            color={selected ? colors.primary[700] : colors.text.inverse}
          >
            {count > 99 ? '99+' : count}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

function NotificationCard({
  item,
  locale,
  pending,
  onOpen,
}: {
  item: NotificationItem;
  locale: string;
  pending: boolean;
  onOpen: () => void;
}) {
  const unread = !item.readAt;
  const parsed = parseActor(item);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={pending}
      onPress={onOpen}
      style={({ pressed }) => [
        styles.card,
        unread && styles.unread,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconBubble, unread && styles.iconBubbleUnread]}>
        <AppIcon
          name={iconOf(item)}
          size={20}
          color={unread ? colors.primary[700] : colors.text.secondary}
          decorative
        />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          {parsed ? (
            <AppText style={styles.cardTitle}>
              <AppText variant="bodyStrong">{parsed.actor}</AppText>
              <AppText variant="bodyStrong">{` ${parsed.action}`}</AppText>
              {parsed.rest}
            </AppText>
          ) : (
            <AppText variant="heading4" style={styles.cardTitle}>
              {item.title}
            </AppText>
          )}
          {unread ? <View style={styles.dot} /> : null}
        </View>
        {parsed ? null : (
          <AppText color={colors.text.secondary}>{item.body}</AppText>
        )}
        <AppText variant="caption" color={colors.primary[700]}>
          {formatTime(item.createdAt, locale)}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  chipSelected: { backgroundColor: colors.primary[700] },
  chipBadge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
  chipBadgeSelected: { backgroundColor: colors.common.white },
  pressed: { opacity: 0.78 },
  emptyGroup: { paddingVertical: spacing.lg },
  layout: { padding: 0, gap: 0 },
  listContent: { flexGrow: 1, padding: spacing.xl },
  header: { gap: spacing.lg, marginBottom: spacing.lg },
  separator: { height: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { flex: 1 },
  footer: { gap: spacing.lg, marginTop: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  unread: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.selected,
  },
  iconBubble: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  iconBubbleUnread: { backgroundColor: colors.background.surface },
  cardBody: { flex: 1, minWidth: 0, gap: spacing.xs },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { flex: 1 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
});
