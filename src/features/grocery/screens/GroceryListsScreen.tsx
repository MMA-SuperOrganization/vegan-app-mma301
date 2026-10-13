import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppButton,
  AppIcon,
  AppText,
  CustomHeader,
  EmptyState,
  FilterChip,
  ScreenWrapper,
} from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { GroceryQueryState } from '../components/GroceryQueryState';
import { groceryProgress } from '../groceryState';
import { useGroceryLists } from '../hooks';
import type { GroceryList, GroceryStatus } from '../types';
import { useState } from 'react';

const statuses: GroceryStatus[] = ['active', 'completed', 'archived'];

export function GroceryListsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [status, setStatus] = useState<GroceryStatus>('active');
  const lists = useGroceryLists(status);

  const openList = (list: GroceryList) =>
    router.push({ pathname: '/(grocery)/[id]', params: { id: list._id } });

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      contentContainerStyle={styles.screen}
      header={<CustomHeader title={t('grocery.title')} showBack={false} />}
    >
      <View style={styles.content}>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {t('grocery.subtitle')}
        </AppText>
        <View style={styles.filters}>
          {statuses.map((value) => (
            <FilterChip
              key={value}
              label={t(`grocery.status.${value}`)}
              selected={status === value}
              onPress={() => setStatus(value)}
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
            title={t(`grocery.empty.${status}.title`)}
            description={t(`grocery.empty.${status}.description`)}
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
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
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
      </View>
      <View style={styles.footer}>
        <AppButton
          title={t('grocery.create')}
          onPress={() => router.push('/(grocery)/create')}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, paddingBottom: spacing['4xl'] },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.md },
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
  cardPressed: { backgroundColor: colors.background.selected },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[100],
  },
  cardContent: { flex: 1, gap: spacing.xs },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[100],
  },
  footer: { marginTop: 'auto', paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
});
