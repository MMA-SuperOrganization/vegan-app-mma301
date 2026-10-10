import { Pressable, StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  CustomHeader,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useNotificationActions, useNotifications } from '../hooks';
import type { NotificationItem } from '../types';

export function NotificationInboxScreen() {
  const { t, locale } = useTranslation();
  const goBack = useSafeBack('/(tabs)/profile');
  const notifications = useNotifications();
  const actions = useNotificationActions();
  const unread = notifications.data?.data.filter((item) => !item.readAt).length ?? 0;
  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <CustomHeader title={t('notifications.title')} showBack onBack={goBack} />
      <AppText color={colors.text.secondary}>
        {t('notifications.unreadCount', { count: unread })}
      </AppText>
      {notifications.isLoading ? (
        <LoadingSpinner text={t('notifications.loading')} />
      ) : null}
      {notifications.isError ? (
        <EmptyState
          title={t('notifications.loadError')}
          description={notifications.error.message}
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
      <View style={styles.list}>
        {notifications.data?.data.map((item) => (
          <NotificationCard
            key={item._id}
            item={item}
            locale={locale}
            pending={actions.markRead.isPending}
            onRead={() => !item.readAt && actions.markRead.mutate(item._id)}
          />
        ))}
      </View>
      {notifications.data?.data.length ? (
        <AppButton
          title={t('notifications.markAllRead')}
          variant="outline"
          loading={actions.markAllRead.isPending}
          disabled={!unread}
          onPress={() => actions.markAllRead.mutate()}
        />
      ) : null}
    </ScreenWrapper>
  );
}

function NotificationCard({
  item,
  locale,
  pending,
  onRead,
}: {
  item: NotificationItem;
  locale: string;
  pending: boolean;
  onRead: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={pending || Boolean(item.readAt)}
      onPress={onRead}
      style={[styles.card, !item.readAt && styles.unread]}
    >
      <View style={styles.cardHeader}>
        <AppText variant="heading4" style={styles.cardTitle}>
          {item.title}
        </AppText>
        {!item.readAt ? <View style={styles.dot} /> : null}
      </View>
      <AppText color={colors.text.secondary}>{item.body}</AppText>
      <AppText variant="caption" color={colors.primary[700]}>
        {new Date(item.createdAt).toLocaleString(locale)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.lg },
  list: { gap: spacing.md },
  card: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  unread: {
    borderColor: colors.primary[500],
    backgroundColor: colors.background.selected,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { flex: 1 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
});
