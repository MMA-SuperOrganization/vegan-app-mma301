import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppButton,
  AppIcon,
  AppInput,
  AppText,
  CustomHeader,
  EmptyState,
  FilterChip,
  ScreenWrapper,
} from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { GroceryPantryTabs } from '@/features/grocery/components/GroceryPantryTabs';
import { GroceryQueryState } from '@/features/grocery/components/GroceryQueryState';
import { groceryProgress } from '@/features/grocery/groceryState';
import { useGroceryLists } from '@/features/grocery/hooks';
import type { GroceryList, GroceryStatus } from '@/features/grocery/types';
import { PantryQueryState } from '@/features/pantry/components/PantryQueryState';
import { usePantry } from '@/features/pantry/hooks';
import {
  pantryExpiryDay,
  pantryExpiryStatus,
  selectPantryItems,
} from '@/features/pantry/pantryState';
import type { PantryFilter } from '@/features/pantry/types';

type InventoryTab = 'grocery' | 'pantry';

const statuses: GroceryStatus[] = ['active', 'completed', 'archived'];
const pantryFilters: PantryFilter[] = ['all', 'expiring', 'expired'];

export function InventoryScreen({
  initialTab,
}: {
  initialTab: InventoryTab;
}) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<InventoryTab>(initialTab);
  const [groceryStatus, setGroceryStatus] = useState<GroceryStatus>('active');
  const [pantryFilter, setPantryFilter] = useState<PantryFilter>('all');
  const [search, setSearch] = useState('');
  const [now, setNow] = useState(Date.now);
  const lists = useGroceryLists(groceryStatus);
  const pantry = usePantry();

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const pantryItems = selectPantryItems(
    pantry.data?.items ?? [],
    pantryFilter,
    search,
    now
  );

  const openList = (list: GroceryList) =>
    router.push({ pathname: '/(grocery)/[id]', params: { id: list._id } });

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      testID="inventory-screen"
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={t('inventory.title')}
          showBack={initialTab === 'pantry'}
          backFallbackHref="/(tabs)/grocery"
        />
      }
    >
      <View style={styles.content}>
        <GroceryPantryTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'grocery' ? (
          <>
            <View style={styles.filters}>
              {statuses.map((value) => (
                <FilterChip
                  key={value}
                  label={t(`grocery.status.${value}`)}
                  selected={groceryStatus === value}
                  onPress={() => setGroceryStatus(value)}
                />
              ))}
            </View>
            <GroceryQueryState
              loading={lists.isLoading}
              error={lists.isError}
              onRetry={() => void lists.refetch()}
            />
            {!lists.isLoading && !lists.isError && lists.data?.data.length === 0 ? (
              <EmptyState
                testID="grocery-empty-state"
                title={t(`grocery.empty.${groceryStatus}.title`)}
                description={t(`grocery.empty.${groceryStatus}.description`)}
                icon={
                  <View style={styles.emptyIcon}>
                    <AppIcon name="pantry" size={52} color={colors.primary[700]} decorative />
                  </View>
                }
              />
            ) : null}
            {!lists.isLoading && !lists.isError
              ? lists.data?.data.map((list) => {
                  const progress = groceryProgress(list);
                  return (
                    <Pressable
                      key={list._id}
                      accessibilityRole="button"
                      accessibilityLabel={list.name}
                      onPress={() => openList(list)}
                      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                    >
                      <View style={styles.cardIcon}>
                        <AppIcon name="pantry" size={28} color={colors.primary[700]} decorative />
                      </View>
                      <View style={styles.cardContent}>
                        <AppText variant="heading4" numberOfLines={2}>{list.name}</AppText>
                        <AppText variant="bodySmall" color={colors.text.secondary}>
                          {t('grocery.progress', progress)}
                        </AppText>
                      </View>
                      <AppText color={colors.text.secondary}>›</AppText>
                    </Pressable>
                  );
                })
              : null}
          </>
        ) : (
          <>
            <AppInput
              type="search"
              value={search}
              onChangeText={setSearch}
              placeholder={t('pantry.search')}
              accessibilityLabel={t('pantry.search')}
            />
            <View style={styles.filters}>
              {pantryFilters.map((value) => (
                <FilterChip
                  key={value}
                  label={t(`pantry.filter.${value}`)}
                  selected={pantryFilter === value}
                  onPress={() => setPantryFilter(value)}
                />
              ))}
            </View>
            <PantryQueryState
              loading={pantry.isLoading}
              error={pantry.isError}
              onRetry={() => void pantry.refetch()}
            />
            {pantry.data && !pantry.isError ? (
              <>
                <AppText variant="bodySmall" color={colors.text.secondary}>
                  {t('pantry.count', { count: pantryItems.length })}
                </AppText>
                {pantryItems.length === 0 ? (
                  <EmptyState title={t('pantry.emptyTitle')} description={t('pantry.emptyDescription')} />
                ) : null}
                {pantryItems.map((item) => {
                  const status = pantryExpiryStatus(item, now);
                  return (
                    <Pressable
                      key={item.itemId}
                      accessibilityRole="button"
                      accessibilityLabel={t('pantry.editNamed', { name: item.foodNameSnapshot })}
                      onPress={() => router.push({ pathname: '/pantry/item', params: { itemId: item.itemId } })}
                      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                    >
                      <View style={styles.cardContent}>
                        <AppText variant="bodyStrong">{item.foodNameSnapshot}</AppText>
                        <AppText variant="bodySmall" color={colors.text.secondary}>
                          {item.quantity.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')} {t(`grocery.unit.${item.unit}`)}
                        </AppText>
                        <AppText
                          variant="bodySmall"
                          color={status === 'expired' ? colors.status.danger : colors.text.secondary}
                        >
                          {item.expiresAt ? t('pantry.expiryValue', { date: pantryExpiryDay(item.expiresAt) }) : t('pantry.noExpiry')}
                        </AppText>
                      </View>
                      <AppText color={colors.text.secondary}>›</AppText>
                    </Pressable>
                  );
                })}
                <AppButton title={t('pantry.refresh')} variant="ghost" loading={pantry.isFetching} onPress={() => void pantry.refetch()} />
              </>
            ) : null}
          </>
        )}
      </View>

      <View style={styles.footer}>
        {activeTab === 'grocery' ? (
          <>
            <AppButton
              title={t('grocery.generateFromPlan')}
              style={styles.actionButton}
              onPress={() => router.push('/(grocery)/generate')}
            />
            <AppButton
              title={t('grocery.create')}
              variant="outline"
              style={styles.actionButton}
              onPress={() => router.push('/(grocery)/create')}
            />
          </>
        ) : (
          <>
            <AppButton
              title={locale === 'vi' ? 'Kho nâng cao' : 'Advanced pantry'}
              variant="outline"
              style={styles.actionButton}
              onPress={() => router.push('/pantry/advanced')}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('pantry.add')}
              onPress={() => router.push('/pantry/item')}
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
            >
              <AppIcon name="plus" size={20} color={colors.text.inverse} decorative />
              <AppText variant="bodyStrong" color={colors.text.inverse}>
                {t('pantry.add')}
              </AppText>
            </Pressable>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, paddingBottom: spacing.lg },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.background.surface, borderWidth: 1, borderColor: colors.border.default },
  pressed: { backgroundColor: colors.background.selected },
  cardIcon: { width: 48, height: 48, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary[100] },
  cardContent: { flex: 1, gap: spacing.xs },
  emptyIcon: { width: 96, height: 96, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary[100] },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  actionButton: { minHeight: 52, height: 52 },
  addButton: {
    minHeight: 52,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.primary[700],
  },
  addButtonPressed: { opacity: 0.82 },
});
