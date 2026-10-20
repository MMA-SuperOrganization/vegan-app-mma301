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
import { PantryQueryState } from '../components/PantryQueryState';
import { usePantry } from '../hooks';
import {
  pantryExpiryDay,
  pantryExpiryStatus,
  selectPantryItems,
} from '../pantryState';
import type { PantryFilter } from '../types';

const filters: PantryFilter[] = ['all', 'expiring', 'expired'];

export function PantryScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const pantry = usePantry();
  const [filter, setFilter] = useState<PantryFilter>('all');
  const [search, setSearch] = useState('');
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const items = selectPantryItems(pantry.data?.items ?? [], filter, search, now);

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      testID="pantry-screen"
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={t('pantry.title')}
          showBack
          backFallbackHref="/(tabs)/grocery"
        />
      }
    >
      <View style={styles.content}>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {t('pantry.subtitle')}
        </AppText>
        <AppInput
          type="search"
          value={search}
          onChangeText={setSearch}
          placeholder={t('pantry.search')}
          accessibilityLabel={t('pantry.search')}
        />
        <View style={styles.filters}>
          {filters.map((value) => (
            <FilterChip
              key={value}
              label={t(`pantry.filter.${value}`)}
              selected={filter === value}
              onPress={() => setFilter(value)}
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
              {t('pantry.count', { count: items.length })}
            </AppText>
            {items.length === 0 ? (
              <EmptyState
                title={t('pantry.emptyTitle')}
                description={t('pantry.emptyDescription')}
                icon={
                  <AppIcon
                    name="pantry"
                    size={52}
                    color={colors.primary[700]}
                    decorative
                  />
                }
              />
            ) : null}
            {items.map((item) => {
              const status = pantryExpiryStatus(item, now);
              return (
                <Pressable
                  key={item.itemId}
                  accessibilityRole="button"
                  accessibilityLabel={t('pantry.editNamed', {
                    name: item.foodNameSnapshot,
                  })}
                  onPress={() =>
                    router.push({
                      pathname: '/pantry/item',
                      params: { itemId: item.itemId },
                    })
                  }
                  style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                >
                  <View style={styles.cardContent}>
                    <AppText variant="bodyStrong">{item.foodNameSnapshot}</AppText>
                    <AppText variant="bodySmall" color={colors.text.secondary}>
                      {item.quantity.toLocaleString(
                        locale === 'vi' ? 'vi-VN' : 'en-US'
                      )}{' '}
                      {t(`grocery.unit.${item.unit}`)}
                    </AppText>
                    <AppText
                      variant="bodySmall"
                      color={
                        status === 'expired'
                          ? colors.status.danger
                          : colors.text.secondary
                      }
                    >
                      {item.expiresAt
                        ? t('pantry.expiryValue', {
                            date: pantryExpiryDay(item.expiresAt),
                          })
                        : t('pantry.noExpiry')}
                      {status === 'expired'
                        ? ` · ${t('pantry.filter.expired')}`
                        : status === 'expiring'
                          ? ` · ${t('pantry.expiringSoon')}`
                          : ''}
                    </AppText>
                    {item.note ? (
                      <AppText variant="bodySmall" color={colors.text.secondary}>
                        {item.note}
                      </AppText>
                    ) : null}
                  </View>
                  <AppText color={colors.text.secondary}>›</AppText>
                </Pressable>
              );
            })}
            <AppButton
              title={t('pantry.refresh')}
              variant="ghost"
              loading={pantry.isFetching}
              onPress={() => void pantry.refetch()}
            />
          </>
        ) : null}
      </View>
      <View style={styles.footer}>
        <AppButton
          title={t('pantry.add')}
          onPress={() => router.push('/pantry/item')}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, paddingBottom: spacing['2xl'] },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cardContent: { flex: 1, gap: spacing.xs },
  pressed: { backgroundColor: colors.background.selected },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
});
