import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  AppButton,
  AppText,
  CustomHeader,
  EmptyState,
  FilterChip,
  LoadingSpinner,
  ScreenWrapper,
  Surface,
} from '@/components';
import { useProfileStore } from '@/features/profile/profileStore';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

import { ContentSaveButton } from '../components/ContentSaveButton';
import { RecipeImage } from '../components/RecipeImage';
import { useRecipeDetail } from '../hooks';

type DetailTab = 'ingredients' | 'steps';

export function RecipeDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const recipe = useRecipeDetail(id);
  const [tab, setTab] = useState<DetailTab>('ingredients');
  const allergenCatalog = useProfileStore((state) => state.data?.allergens ?? []);

  if (recipe.isLoading) {
    return (
      <ScreenWrapper
        header={
          <CustomHeader
            title={t('recipe.detailTitle')}
            showBack
            backFallbackHref="/(discover)/explore"
          />
        }
        contentContainerStyle={styles.state}
      >
        <LoadingSpinner text={t('discover.loadingRecipes')} />
      </ScreenWrapper>
    );
  }

  if (recipe.isError || !recipe.data) {
    return (
      <ScreenWrapper
        header={
          <CustomHeader
            title={t('recipe.detailTitle')}
            showBack
            backFallbackHref="/(discover)/explore"
          />
        }
        contentContainerStyle={styles.state}
      >
        <EmptyState
          title={t('recipe.openError')}
          description={recipe.error?.message}
          actionLabel={t('common.retry')}
          onAction={() => void recipe.refetch()}
        />
      </ScreenWrapper>
    );
  }

  const data = recipe.data;
  const nutrition = data.nutritionPerServing;
  const nutritionItems = [
    {
      label: 'kcal',
      value:
        nutrition?.caloriesKcal != null
          ? Math.round(nutrition.caloriesKcal).toString()
          : '—',
    },
    {
      label: t('recipe.protein'),
      value: nutrition?.proteinG != null ? `${nutrition.proteinG}g` : '—',
    },
    {
      label: t('recipe.carbs'),
      value: nutrition?.carbsG != null ? `${nutrition.carbsG}g` : '—',
    },
    {
      label: t('recipe.fat'),
      value: nutrition?.fatG != null ? `${nutrition.fatG}g` : '—',
    },
  ];
  const orderedSteps = [...(data.steps ?? [])].sort((a, b) => a.order - b.order);
  const allergenText =
    data.allergenIds === undefined
      ? t('recipe.allergensUnknown')
      : data.allergenIds.length === 0
        ? t('recipe.noDeclaredAllergens')
        : data.allergenIds
            .map(
              (allergenId) =>
                allergenCatalog.find((allergen) => allergen._id === allergenId)
                  ?.name ?? t('recipe.unknownAllergen')
            )
            .join(', ');
  const difficulty = data.difficulty
    ? t(`filters.difficulty.${data.difficulty}` as TranslationKey)
    : null;

  return (
    <ScreenWrapper
      header={
        <CustomHeader
          title={data.title ?? t('recipe.detailTitle')}
          showBack
          backFallbackHref="/(discover)/explore"
        />
      }
      scrollable
      contentContainerStyle={styles.screen}
    >
      <RecipeImage
        uri={data.coverImageUrl}
        style={styles.cover}
        fallbackSize="large"
      />

      <View style={styles.intro}>
        <AppText variant="heading1">{data.title}</AppText>
        <AppText color={colors.text.secondary}>
          {data.summary || data.description || t('recipe.noDescription')}
        </AppText>
        <AppText variant="bodyStrong" color={colors.primary[700]}>
          {[
            data.servings ? t('recipe.servings', { count: data.servings }) : null,
            data.prepMinutes != null
              ? t('recipe.prepMinutes', { count: data.prepMinutes })
              : null,
            data.cookMinutes != null
              ? t('recipe.cookMinutes', { count: data.cookMinutes })
              : null,
            difficulty,
          ]
            .filter(Boolean)
            .join(' · ')}
        </AppText>
      </View>

      <View style={styles.macros}>
        {nutritionItems.map((item) => (
          <Surface
            key={item.label}
            bordered
            padding="md"
            radius="lg"
            style={styles.macro}
          >
            <AppText variant="heading4" color={colors.primary[700]}>
              {item.value}
            </AppText>
            <AppText variant="caption" color={colors.text.secondary}>
              {item.label}
            </AppText>
          </Surface>
        ))}
      </View>

      <View style={styles.tabs}>
        <FilterChip
          label={t('recipe.ingredients')}
          selected={tab === 'ingredients'}
          onPress={() => setTab('ingredients')}
        />
        <FilterChip
          label={t('recipe.steps')}
          selected={tab === 'steps'}
          onPress={() => setTab('steps')}
        />
      </View>

      {tab === 'ingredients' ? (
        <InfoBlock
          title={
            data.servings
              ? t('recipe.ingredientsFor', { count: data.servings })
              : t('recipe.ingredients')
          }
        >
          {data.ingredients?.length ? (
            data.ingredients.map((item, index) => (
              <View
                key={`${item.foodItemId}-${item.quantity}-${index}`}
                style={styles.listRow}
              >
                <AppText color={colors.primary[700]}>•</AppText>
                <AppText style={styles.listText}>
                  {item.foodNameSnapshot}: {item.quantity} {item.unit}
                  {item.note ? ` · ${item.note}` : ''}
                </AppText>
              </View>
            ))
          ) : (
            <AppText color={colors.text.secondary}>
              {t('recipe.noIngredients')}
            </AppText>
          )}
        </InfoBlock>
      ) : (
        <InfoBlock title={t('recipe.steps')}>
          {orderedSteps.length ? (
            orderedSteps.map((step, index) => (
              <View key={`${step.order}-${index}`} style={styles.step}>
                <View style={styles.stepNumber}>
                  <AppText variant="bodyStrong" color={colors.text.inverse}>
                    {index + 1}
                  </AppText>
                </View>
                <AppText style={styles.listText}>{step.instruction}</AppText>
              </View>
            ))
          ) : (
            <AppText color={colors.text.secondary}>
              {t('recipe.noStepsDescription')}
            </AppText>
          )}
        </InfoBlock>
      )}

      <InfoBlock title={t('recipe.allergens')}>
        <AppText color={colors.text.secondary}>{allergenText}</AppText>
      </InfoBlock>

      <AppButton
        title={t('recipe.startCooking')}
        disabled={!orderedSteps.length}
        onPress={() =>
          router.push({ pathname: '/(discover)/recipe/[id]/cook', params: { id } })
        }
      />
      <ContentSaveButton
        content={{ ...data, type: 'recipe' }}
        initialSaved={data.isSaved}
      />
    </ScreenWrapper>
  );
}

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Surface bordered padding="lg" radius="lg" style={styles.block}>
      <AppText variant="heading4">{title}</AppText>
      {children}
    </Surface>
  );
}

const styles = StyleSheet.create({
  state: { padding: spacing.xl, justifyContent: 'center' },
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  cover: { width: '100%', height: 240, borderRadius: radius.xl },
  intro: { gap: spacing.sm },
  macros: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  macro: { flexGrow: 1, flexBasis: '46%', gap: spacing.xs },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  block: { gap: spacing.md },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  listText: { flex: 1, minWidth: 0 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[700],
  },
});
