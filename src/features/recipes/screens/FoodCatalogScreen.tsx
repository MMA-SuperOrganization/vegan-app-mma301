import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
  Toggle,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { ContentResultCard } from '../components/ContentResultCard';
import { buildFoodQuery } from '../foodState';
import { RecipeHeader } from '../components/RecipeHeader';
import { useContentCategories, useFoodItems } from '../hooks';

export function FoodCatalogScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>();
  const [avoidAllergens, setAvoidAllergens] = useState(false);
  const allergenIds =
    useProfileStore((state) => state.data?.nutritionProfile?.allergenIds) ?? [];
  const categories = useContentCategories('food');
  const filters = useMemo(
    () =>
      buildFoodQuery({
        query,
        category,
        avoidAllergens,
        profileAllergenIds: allergenIds,
      }),
    [allergenIds, avoidAllergens, category, query]
  );
  const foods = useFoodItems(filters);
  const content = foods.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <RecipeHeader
        title={t('food.catalogTitle')}
        subtitle={t('food.catalogSubtitle')}
        backFallbackHref="/(discover)/explore"
      />
      <AppInput
        type="search"
        value={input}
        onChangeText={setInput}
        placeholder={t('food.searchPlaceholder')}
        returnKeyType="search"
        onSubmitEditing={() => setQuery(input.trim())}
      />
      <View style={styles.categories}>
        <CategoryChip
          label={t('filters.any')}
          selected={!category}
          onPress={() => setCategory(undefined)}
        />
        {categories.data?.data.map((item) => (
          <CategoryChip
            key={item._id}
            label={item.name}
            selected={category === item._id}
            onPress={() => setCategory(item._id)}
          />
        ))}
      </View>
      {categories.isLoading ? (
        <LoadingSpinner text={t('filters.loadingCategories')} />
      ) : null}
      {categories.isError ? (
        <View style={styles.inlineError}>
          <AppText color={colors.status.danger}>
            {t('food.categoryLoadError')}
          </AppText>
          <AppButton
            title={t('common.retry')}
            variant="outline"
            fullWidth={false}
            onPress={() => void categories.refetch()}
          />
        </View>
      ) : null}
      <Toggle
        label={t('food.avoidMyAllergens')}
        value={avoidAllergens}
        disabled={!allergenIds.length}
        onValueChange={setAvoidAllergens}
      />
      {foods.isLoading ? <LoadingSpinner text={t('food.loading')} /> : null}
      {foods.isError ? (
        <EmptyState
          title={t('food.loadError')}
          description={foods.error.message}
          actionLabel={t('common.retry')}
          onAction={() => void foods.refetch()}
        />
      ) : null}
      {!foods.isLoading && !foods.isError && !content.length ? (
        <EmptyState
          title={t('food.empty')}
          description={t('food.emptyDescription')}
        />
      ) : null}
      <View style={styles.list}>
        {content.map((food) => (
          <ContentResultCard
            key={food._id}
            item={{ ...food, type: 'food-item' }}
            onPress={() =>
              router.push({
                pathname: '/(discover)/food/[id]',
                params: { id: food._id },
              })
            }
          />
        ))}
      </View>
      {foods.hasNextPage ? (
        <AppButton
          title={t('discover.loadMore')}
          variant="outline"
          loading={foods.isFetchingNextPage}
          onPress={() => void foods.fetchNextPage()}
        />
      ) : null}
    </ScreenWrapper>
  );
}

function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <AppText color={selected ? colors.text.inverse : colors.text.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.xl },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  chipSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  list: { gap: spacing.md },
  inlineError: { gap: spacing.sm, alignItems: 'flex-start' },
});
