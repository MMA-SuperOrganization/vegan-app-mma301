import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppIcon,
  AppText,
  CustomHeader,
  EmptyState,
  ScreenWrapper,
} from '@/components';
import { useSafeBack } from '@/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { GroceryItemRow } from '../components/GroceryItemRow';
import { GroceryQueryState } from '../components/GroceryQueryState';
import { GroceryToPantrySheet } from '../components/GroceryToPantrySheet';
import {
  groceryProgress,
  groceryTransferSummary,
  groupGroceryItems,
} from '../groceryState';
import { useGroceryActions, useGroceryList } from '../hooks';

export function GroceryDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const goBack = useSafeBack('/(tabs)/grocery');
  const { t } = useTranslation();
  const [transferOpen, setTransferOpen] = useState(false);
  const query = useGroceryList(id);
  const actions = useGroceryActions(id);
  const list = query.data;
  const progress = list ? groceryProgress(list) : { checked: 0, total: 0 };
  const groups = groupGroceryItems(list?.items ?? [], t('grocery.category.other'));
  const transfer = groceryTransferSummary(list?.items ?? []);
  const busy =
    actions.update.isPending ||
    actions.archive.isPending ||
    actions.clearChecked.isPending ||
    actions.transferCheckedToPantry.isPending;

  const toggleItem = (itemId: string, checked: boolean) =>
    actions.updateItem.mutate({ itemId, input: { checked } });

  const changeStatus = async () => {
    if (!list) return;
    const status = list.status === 'completed' ? 'active' : 'completed';
    try {
      await actions.update.mutateAsync({ id: list._id, input: { status } });
    } catch {
      // Mutation error remains visible and the current server state is preserved.
    }
  };

  const confirmClear = () =>
    Alert.alert(
      t('grocery.clearCheckedConfirmTitle'),
      t('grocery.clearCheckedConfirmBody'),
      [
        { text: t('common.close'), style: 'cancel' },
        {
          text: t('grocery.clearChecked'),
          style: 'destructive',
          onPress: () => actions.clearChecked.mutate(),
        },
      ]
    );

  const confirmArchive = () =>
    Alert.alert(t('grocery.archiveConfirmTitle'), t('grocery.archiveConfirmBody'), [
      { text: t('common.close'), style: 'cancel' },
      {
        text: t('grocery.archive'),
        style: 'destructive',
        onPress: async () => {
          if (!list) return;
          try {
            await actions.archive.mutateAsync(list._id);
            goBack();
          } catch {
            // Keep this screen open so the user can retry.
          }
        },
      },
    ]);

  const transferToPantry = async () => {
    try {
      const result = await actions.transferCheckedToPantry.mutateAsync();
      setTransferOpen(false);
      Alert.alert(
        t('grocery.transferSuccessTitle'),
        t('grocery.transferSuccessBody', { count: result.transferredCount }),
        [
          { text: t('grocery.transferStay'), style: 'cancel' },
          {
            text: t('grocery.transferViewPantry'),
            onPress: () => router.push('/pantry'),
          },
        ]
      );
    } catch {
      // The sheet stays open and shows a retryable error below the page content.
    }
  };

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={list?.name ?? t('grocery.detailTitle')}
          showBack
          backFallbackHref="/(tabs)/grocery"
          rightAction={
            list && list.status !== 'archived'
              ? {
                  accessibilityLabel: t('grocery.rename'),
                  onPress: () =>
                    router.push({
                      pathname: '/(grocery)/create',
                      params: { id: list._id },
                    }),
                  node: (
                    <AppText variant="bodyStrong" color={colors.primary[700]}>
                      {t('grocery.edit')}
                    </AppText>
                  ),
                }
              : undefined
          }
        />
      }
    >
      <View style={styles.content}>
        <GroceryQueryState
          loading={query.isLoading}
          error={query.isError}
          onRetry={() => void query.refetch()}
        />
        {list ? (
          <>
            <View style={styles.summary}>
              <View style={styles.summaryText}>
                <AppText variant="heading4">
                  {t(`grocery.status.${list.status}`)}
                </AppText>
                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {t('grocery.progress', progress)}
                </AppText>
              </View>
              <AppText variant="heading3" color={colors.primary[700]}>
                {progress.total
                  ? `${Math.round((progress.checked / progress.total) * 100)}%`
                  : '0%'}
              </AppText>
            </View>

            {list.status !== 'archived' && transfer.eligible.length > 0 ? (
              <View style={styles.transferCard}>
                <View style={styles.transferCopy}>
                  <View style={styles.transferIcon}>
                    <AppIcon
                      name="pantry"
                      size={24}
                      color={colors.primary[700]}
                      decorative
                    />
                  </View>
                  <View style={styles.transferText}>
                    <AppText variant="bodyStrong">
                      {t('grocery.transferReady', {
                        count: transfer.eligible.length,
                      })}
                    </AppText>
                    <AppText variant="bodySmall" color={colors.text.secondary}>
                      {t('grocery.transferReadyDescription')}
                    </AppText>
                  </View>
                </View>
                <AppButton
                  title={t('grocery.transferAction')}
                  loading={actions.transferCheckedToPantry.isPending}
                  disabled={busy && !actions.transferCheckedToPantry.isPending}
                  onPress={() => {
                    actions.transferCheckedToPantry.reset();
                    setTransferOpen(true);
                  }}
                />
              </View>
            ) : null}

            {list.items.length === 0 ? (
              <EmptyState
                title={t('grocery.itemsEmptyTitle')}
                description={t('grocery.itemsEmptyDescription')}
                icon={
                  <AppIcon
                    name="pantry"
                    size={52}
                    color={colors.primary[700]}
                    decorative
                  />
                }
              />
            ) : (
              groups.map((group) => (
                <View key={group.category} style={styles.group}>
                  <AppText variant="heading4">{group.category}</AppText>
                  <View style={styles.groupItems}>
                    {group.items.map((item, index) => (
                      <View key={item.itemId}>
                        {index > 0 ? <View style={styles.divider} /> : null}
                        <GroceryItemRow
                          item={item}
                          disabled={
                            list.status === 'archived' ||
                            actions.updateItem.isPending
                          }
                          quantityLabel={t('grocery.quantity', {
                            quantity: String(item.quantity),
                            unit: t(`grocery.unit.${item.unit}`),
                          })}
                          toggleLabel={t('grocery.toggleItem', {
                            name: item.nameSnapshot,
                          })}
                          onToggle={() => toggleItem(item.itemId, !item.checked)}
                          onOpen={() =>
                            router.push({
                              pathname: '/(grocery)/[id]/item',
                              params: { id: list._id, itemId: item.itemId },
                            })
                          }
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}

            {actions.update.error ||
            actions.archive.error ||
            actions.clearChecked.error ||
            actions.updateItem.error ? (
              <AppText color={colors.status.danger}>
                {t('grocery.saveError')}
              </AppText>
            ) : null}
            {list.status !== 'archived' ? (
              <AppButton
                title={t('grocery.addItem')}
                onPress={() =>
                  router.push({
                    pathname: '/(grocery)/[id]/item',
                    params: { id: list._id },
                  })
                }
              />
            ) : null}
            {list.status !== 'archived' && progress.checked > 0 ? (
              <AppButton
                title={t('grocery.clearChecked')}
                variant="outline"
                loading={actions.clearChecked.isPending}
                onPress={confirmClear}
              />
            ) : null}
            {list.status !== 'archived' ? (
              <AppButton
                title={
                  list.status === 'completed'
                    ? t('grocery.reopen')
                    : t('grocery.markCompleted')
                }
                variant="outline"
                loading={actions.update.isPending}
                onPress={() => void changeStatus()}
              />
            ) : null}
            {list.status !== 'archived' ? (
              <AppButton
                title={t('grocery.archive')}
                variant="danger"
                loading={actions.archive.isPending}
                disabled={busy}
                onPress={confirmArchive}
              />
            ) : null}
          </>
        ) : null}
      </View>
      <GroceryToPantrySheet
        visible={transferOpen}
        items={transfer.eligible}
        skippedCount={transfer.skipped.length}
        loading={actions.transferCheckedToPantry.isPending}
        error={actions.transferCheckedToPantry.isError}
        onClose={() => {
          if (!actions.transferCheckedToPantry.isPending) setTransferOpen(false);
        }}
        onConfirm={() => void transferToPantry()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing['4xl'] },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[100],
  },
  summaryText: { flex: 1, gap: spacing.xs },
  transferCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.background.surface,
  },
  transferCopy: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  transferIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[100],
  },
  transferText: { flex: 1, gap: spacing.xs },
  group: { gap: spacing.sm },
  groupItems: {
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.default,
  },
});
