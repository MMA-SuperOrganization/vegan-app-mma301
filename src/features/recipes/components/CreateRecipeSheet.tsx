import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import {
  AppButton,
  AppIcon,
  AppInput,
  AppText,
  BottomSheet,
  SearchPickerSheet,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { mediaApi } from '@/features/media/mediaApi';
import { usePantryFoodOptions } from '@/features/pantry/hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { recipeApi } from '../recipeApi';
import { useRecipeCategories } from '../hooks';
import type { RecipeAuthorInput, RecipeDifficulty } from '../types';

type Ingredient = {
  foodItemId: string;
  name: string;
  quantity: string;
  unit: string;
};

type RecipeStep = { instruction: string };
type Visibility = 'public' | 'private' | 'unlisted';
type SaveMode = 'draft' | 'submit';

const WIZARD_STEPS = 3;

export function CreateRecipeSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const categories = useRecipeCategories();
  const [wizardStep, setWizardStep] = useState(0);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [servings, setServings] = useState('2');
  const [prepMinutes, setPrepMinutes] = useState('10');
  const [cookMinutes, setCookMinutes] = useState('20');
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('easy');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [cover, setCover] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<RecipeStep[]>([{ instruction: '' }]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const foodOptions = usePantryFoodOptions(search, pickerOpen);
  const foods = foodOptions.data?.pages.flatMap((page) => page.data) ?? [];

  const save = useMutation({
    mutationFn: async (mode: SaveMode) => {
      const coverMediaId = cover
        ? await mediaApi.uploadImage(cover, 'recipe')
        : undefined;
      const input: RecipeAuthorInput = {
        title: title.trim(),
        summary: summary.trim(),
        ...(coverMediaId ? { coverMediaId } : {}),
        servings: Number(servings),
        prepMinutes: Number(prepMinutes),
        cookMinutes: Number(cookMinutes),
        difficulty,
        categoryIds: categoryId ? [categoryId] : [],
        tags: [],
        ingredients: ingredients.map((ingredient, index) => ({
          foodItemId: ingredient.foodItemId,
          quantity: Number(ingredient.quantity),
          unit: ingredient.unit.trim(),
          order: index + 1,
        })),
        steps: steps
          .filter((step) => step.instruction.trim())
          .map((step, index) => ({
            order: index + 1,
            instruction: step.instruction.trim(),
          })),
        visibility,
      };
      const stored = await recipeApi.create(input);
      return mode === 'submit' ? recipeApi.submit(stored) : stored;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account'] });
      reset();
      onClose();
    },
  });

  const reset = () => {
    setWizardStep(0);
    setTitle('');
    setSummary('');
    setServings('2');
    setPrepMinutes('10');
    setCookMinutes('20');
    setDifficulty('easy');
    setCategoryId(null);
    setVisibility('public');
    setCover(null);
    setIngredients([]);
    setSteps([{ instruction: '' }]);
    setSearch('');
    setValidationError(null);
  };

  const detailsValid =
    Boolean(title.trim()) &&
    Number(servings) > 0 &&
    Number(prepMinutes) >= 0 &&
    Number(cookMinutes) >= 0;
  const ingredientsValid =
    ingredients.length > 0 &&
    ingredients.every(
      (ingredient) => Number(ingredient.quantity) > 0 && ingredient.unit.trim()
    );
  const stepsValid = steps.some((step) => step.instruction.trim());

  const goNext = () => {
    if (wizardStep === 0 && !detailsValid) {
      setValidationError(t('recipeComposer.detailsError'));
      return;
    }
    if (wizardStep === 1 && !ingredientsValid) {
      setValidationError(t('recipeComposer.ingredientsError'));
      return;
    }
    setValidationError(null);
    setWizardStep((current) => Math.min(current + 1, WIZARD_STEPS - 1));
  };

  const goBack = () => {
    setValidationError(null);
    setWizardStep((current) => Math.max(current - 1, 0));
  };

  const saveRecipe = (mode: SaveMode) => {
    if (!detailsValid) {
      setWizardStep(0);
      setValidationError(t('recipeComposer.detailsError'));
      return;
    }
    if (!ingredientsValid) {
      setWizardStep(1);
      setValidationError(t('recipeComposer.ingredientsError'));
      return;
    }
    if (!stepsValid) {
      setWizardStep(2);
      setValidationError(t('recipeComposer.stepsError'));
      return;
    }
    setValidationError(null);
    save.mutate(mode);
  };

  const chooseCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled) setCover(result.assets[0]);
  };

  const busy = save.isPending;

  return (
    <>
      <BottomSheet
        visible={visible}
        title={t('recipeComposer.title')}
        onClose={onClose}
        tall
        height="94%"
        showFooterClose={false}
        headerAction={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            disabled={busy}
            onPress={onClose}
            style={styles.closeButton}
          >
            <AppIcon name="close" size={20} color={colors.text.primary} decorative />
          </Pressable>
        }
      >
        <View style={styles.progressArea}>
          <AppText variant="caption" color={colors.text.secondary}>
            {t('recipeComposer.progress', {
              current: wizardStep + 1,
              total: WIZARD_STEPS,
            })}
          </AppText>
          <View style={styles.progressTrack}>
            {Array.from({ length: WIZARD_STEPS }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.progressSegment,
                  index <= wizardStep && styles.progressSegmentActive,
                ]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {wizardStep === 0 ? (
            <RecipeDetailsStep
              title={title}
              summary={summary}
              servings={servings}
              prepMinutes={prepMinutes}
              cookMinutes={cookMinutes}
              difficulty={difficulty}
              categoryId={categoryId}
              cover={cover}
              categories={categories.data?.data ?? []}
              disabled={busy}
              onTitleChange={setTitle}
              onSummaryChange={setSummary}
              onServingsChange={setServings}
              onPrepMinutesChange={setPrepMinutes}
              onCookMinutesChange={setCookMinutes}
              onDifficultyChange={setDifficulty}
              onCategoryChange={setCategoryId}
              onChooseCover={() => void chooseCover()}
              onRemoveCover={() => setCover(null)}
            />
          ) : null}

          {wizardStep === 1 ? (
            <IngredientsStep
              ingredients={ingredients}
              disabled={busy}
              onAdd={() => setPickerOpen(true)}
              onChange={setIngredients}
            />
          ) : null}

          {wizardStep === 2 ? (
            <InstructionsStep
              steps={steps}
              visibility={visibility}
              disabled={busy}
              onStepsChange={setSteps}
              onVisibilityChange={setVisibility}
            />
          ) : null}

          {validationError ? (
            <AppText color={colors.status.danger} accessibilityRole="alert">
              {validationError}
            </AppText>
          ) : null}
          <FeatureState error={save.error} />
        </ScrollView>

        <View style={styles.footer}>
          {wizardStep < WIZARD_STEPS - 1 ? (
            <View style={styles.footerRow}>
              {wizardStep > 0 ? (
                <AppButton
                  title={t('recipeComposer.back')}
                  variant="ghost"
                  fullWidth={false}
                  disabled={busy}
                  onPress={goBack}
                  style={styles.backButton}
                />
              ) : null}
              <AppButton
                title={t('recipeComposer.next')}
                fullWidth={false}
                disabled={busy}
                onPress={goNext}
                style={styles.nextButton}
              />
            </View>
          ) : (
            <>
              <AppButton
                title={t('recipeComposer.submit')}
                loading={busy}
                disabled={busy}
                onPress={() => saveRecipe('submit')}
              />
              <View style={styles.footerRow}>
                <AppButton
                  title={t('recipeComposer.back')}
                  variant="ghost"
                  fullWidth={false}
                  disabled={busy}
                  onPress={goBack}
                  style={styles.finalButton}
                />
                <AppButton
                  title={t('recipeComposer.saveDraft')}
                  variant="outline"
                  fullWidth={false}
                  disabled={busy}
                  onPress={() => saveRecipe('draft')}
                  style={styles.finalButton}
                />
              </View>
            </>
          )}
        </View>
      </BottomSheet>

      <SearchPickerSheet
        visible={pickerOpen}
        title={t('recipeComposer.chooseFood')}
        searchPlaceholder={t('recipeComposer.searchFood')}
        query={search}
        onQueryChange={setSearch}
        items={foods.map((food) => ({
          id: food._id,
          title: food.name,
          imageUrl: food.imageUrl,
        }))}
        isLoading={foodOptions.isLoading}
        isError={foodOptions.isError}
        onRetry={() => void foodOptions.refetch()}
        onClose={() => setPickerOpen(false)}
        onSelect={(foodItemId) => {
          const food = foods.find((item) => item._id === foodItemId);
          if (food && !ingredients.some((item) => item.foodItemId === foodItemId)) {
            setIngredients((current) => [
              ...current,
              {
                foodItemId,
                name: food.name,
                quantity: '100',
                unit: 'g',
              },
            ]);
          }
          setPickerOpen(false);
        }}
        hasMore={foodOptions.hasNextPage}
        loadingMore={foodOptions.isFetchingNextPage}
        onLoadMore={() => void foodOptions.fetchNextPage()}
      />
    </>
  );
}

function RecipeDetailsStep({
  title,
  summary,
  servings,
  prepMinutes,
  cookMinutes,
  difficulty,
  categoryId,
  cover,
  categories,
  disabled,
  onTitleChange,
  onSummaryChange,
  onServingsChange,
  onPrepMinutesChange,
  onCookMinutesChange,
  onDifficultyChange,
  onCategoryChange,
  onChooseCover,
  onRemoveCover,
}: {
  title: string;
  summary: string;
  servings: string;
  prepMinutes: string;
  cookMinutes: string;
  difficulty: RecipeDifficulty;
  categoryId: string | null;
  cover: ImagePicker.ImagePickerAsset | null;
  categories: Array<{ _id: string; name: string }>;
  disabled: boolean;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onServingsChange: (value: string) => void;
  onPrepMinutesChange: (value: string) => void;
  onCookMinutesChange: (value: string) => void;
  onDifficultyChange: (value: RecipeDifficulty) => void;
  onCategoryChange: (value: string | null) => void;
  onChooseCover: () => void;
  onRemoveCover: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.stepContent}>
      <View style={styles.stepHeading}>
        <AppText variant="heading2">{t('recipeComposer.detailsTitle')}</AppText>
        <AppText color={colors.text.secondary}>
          {t('recipeComposer.detailsHint')}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('recipe.chooseCover')}
        disabled={disabled}
        onPress={onChooseCover}
        style={styles.cover}
      >
        {cover ? (
          <Image source={{ uri: cover.uri }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverEmpty}>
            <AppIcon name="image" size={30} color={colors.primary[700]} decorative />
            <AppText variant="bodyStrong" color={colors.primary[700]}>
              {t('recipe.chooseCover')}
            </AppText>
            <AppText variant="caption" color={colors.text.secondary}>
              {t('recipeComposer.coverHint')}
            </AppText>
          </View>
        )}
        {cover ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('recipeComposer.removeCover')}
            onPress={(event) => {
              event.stopPropagation();
              onRemoveCover();
            }}
            style={styles.removeCover}
          >
            <AppIcon name="close" size={18} color={colors.text.inverse} decorative />
          </Pressable>
        ) : null}
      </Pressable>

      <AppInput
        label={t('recipe.titleLabel')}
        placeholder={t('recipeComposer.titlePlaceholder')}
        value={title}
        onChangeText={onTitleChange}
        autoCapitalize="sentences"
        maxLength={200}
        editable={!disabled}
        required
      />
      <AppInput
        label={t('recipe.summaryLabel')}
        placeholder={t('recipeComposer.summaryPlaceholder')}
        value={summary}
        onChangeText={onSummaryChange}
        autoCapitalize="sentences"
        multiline
        maxLength={1000}
        editable={!disabled}
        inputStyle={styles.summaryInput}
      />

      <View style={styles.metricsRow}>
        <AppInput
          label={t('recipeComposer.servings')}
          value={servings}
          onChangeText={onServingsChange}
          keyboardType="number-pad"
          editable={!disabled}
          style={styles.metricField}
          required
        />
        <AppInput
          label={t('recipeComposer.prepTime')}
          value={prepMinutes}
          onChangeText={onPrepMinutesChange}
          keyboardType="number-pad"
          editable={!disabled}
          style={styles.metricField}
          required
        />
        <AppInput
          label={t('recipeComposer.cookTime')}
          value={cookMinutes}
          onChangeText={onCookMinutesChange}
          keyboardType="number-pad"
          editable={!disabled}
          style={styles.metricField}
          required
        />
      </View>

      <OptionGroup label={t('recipeComposer.difficulty')}>
        {(['easy', 'medium', 'hard'] as const).map((value) => (
          <ChoiceChip
            key={value}
            label={t(`recipeComposer.${value}`)}
            selected={difficulty === value}
            onPress={() => onDifficultyChange(value)}
          />
        ))}
      </OptionGroup>

      {categories.length ? (
        <View style={styles.optionGroup}>
          <AppText variant="bodyStrong">{t('recipeComposer.category')}</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <ChoiceChip
              label={t('recipeComposer.noCategory')}
              selected={!categoryId}
              onPress={() => onCategoryChange(null)}
            />
            {categories.map((category) => (
              <ChoiceChip
                key={category._id}
                label={category.name}
                selected={categoryId === category._id}
                onPress={() => onCategoryChange(category._id)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function IngredientsStep({
  ingredients,
  disabled,
  onAdd,
  onChange,
}: {
  ingredients: Ingredient[];
  disabled: boolean;
  onAdd: () => void;
  onChange: (value: Ingredient[]) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.stepContent}>
      <View style={styles.stepHeading}>
        <AppText variant="heading2">{t('recipeComposer.ingredientsTitle')}</AppText>
        <AppText color={colors.text.secondary}>
          {t('recipeComposer.ingredientsHint')}
        </AppText>
      </View>

      {ingredients.map((ingredient, index) => (
        <View key={ingredient.foodItemId} style={styles.ingredientCard}>
          <View style={styles.cardHeading}>
            <AppText variant="bodyStrong" style={styles.flexText}>
              {ingredient.name}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('recipeComposer.removeIngredient')}
              disabled={disabled}
              onPress={() => onChange(ingredients.filter((_, itemIndex) => itemIndex !== index))}
              style={styles.iconButton}
            >
              <AppIcon name="trash" size={19} color={colors.status.danger} decorative />
            </Pressable>
          </View>
          <View style={styles.ingredientFields}>
            <AppInput
              label={t('recipeComposer.quantity')}
              value={ingredient.quantity}
              onChangeText={(quantity) =>
                onChange(
                  ingredients.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, quantity } : item
                  )
                )
              }
              keyboardType="decimal-pad"
              editable={!disabled}
              style={styles.ingredientField}
            />
            <AppInput
              label={t('recipeComposer.unit')}
              value={ingredient.unit}
              onChangeText={(unit) =>
                onChange(
                  ingredients.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, unit } : item
                  )
                )
              }
              editable={!disabled}
              style={styles.ingredientField}
            />
          </View>
        </View>
      ))}

      {!ingredients.length ? (
        <View style={styles.emptyState}>
          <AppIcon name="pantry" size={34} color={colors.primary[700]} decorative />
          <AppText variant="bodyStrong">{t('recipeComposer.noIngredients')}</AppText>
          <AppText variant="bodySmall" color={colors.text.secondary} style={styles.centerText}>
            {t('recipeComposer.noIngredientsHint')}
          </AppText>
        </View>
      ) : null}

      <AppButton
        title={t('recipeComposer.addIngredient')}
        variant="outline"
        disabled={disabled}
        onPress={onAdd}
      />
    </View>
  );
}

function InstructionsStep({
  steps,
  visibility,
  disabled,
  onStepsChange,
  onVisibilityChange,
}: {
  steps: RecipeStep[];
  visibility: Visibility;
  disabled: boolean;
  onStepsChange: (value: RecipeStep[]) => void;
  onVisibilityChange: (value: Visibility) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.stepContent}>
      <View style={styles.stepHeading}>
        <AppText variant="heading2">{t('recipeComposer.stepsTitle')}</AppText>
        <AppText color={colors.text.secondary}>
          {t('recipeComposer.stepsHint')}
        </AppText>
      </View>

      {steps.map((step, index) => (
        <View key={index} style={styles.instructionCard}>
          <View style={styles.cardHeading}>
            <View style={styles.stepBadge}>
              <AppText variant="caption" color={colors.text.inverse}>
                {index + 1}
              </AppText>
            </View>
            <AppText variant="bodyStrong" style={styles.flexText}>
              {t('recipeComposer.stepLabel', { count: index + 1 })}
            </AppText>
            {steps.length > 1 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('recipeComposer.removeStep')}
                disabled={disabled}
                onPress={() => onStepsChange(steps.filter((_, itemIndex) => itemIndex !== index))}
                style={styles.iconButton}
              >
                <AppIcon name="trash" size={19} color={colors.status.danger} decorative />
              </Pressable>
            ) : null}
          </View>
          <AppInput
            value={step.instruction}
            onChangeText={(instruction) =>
              onStepsChange(
                steps.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, instruction } : item
                )
              )
            }
            placeholder={t('recipeComposer.stepPlaceholder')}
            autoCapitalize="sentences"
            multiline
            editable={!disabled}
            inputStyle={styles.stepInput}
            accessibilityLabel={t('recipeComposer.stepLabel', { count: index + 1 })}
          />
        </View>
      ))}

      <AppButton
        title={t('recipeComposer.addStep')}
        variant="outline"
        disabled={disabled}
        onPress={() => onStepsChange([...steps, { instruction: '' }])}
      />

      <OptionGroup label={t('recipeComposer.visibility')}>
        {(['public', 'private', 'unlisted'] as const).map((value) => (
          <ChoiceChip
            key={value}
            label={t(`recipeComposer.${value}`)}
            selected={visibility === value}
            onPress={() => onVisibilityChange(value)}
          />
        ))}
      </OptionGroup>
      <AppText variant="caption" color={colors.text.secondary}>
        {t(`recipeComposer.${visibility}Hint`)}
      </AppText>
    </View>
  );
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.optionGroup}>
      <AppText variant="bodyStrong">{label}</AppText>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

function ChoiceChip({
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
      {selected ? (
        <AppIcon name="check" size={16} color={colors.primary[700]} decorative />
      ) : null}
      <AppText
        variant={selected ? 'bodyStrong' : 'bodyDefault'}
        color={selected ? colors.primary[700] : colors.text.secondary}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.muted,
  },
  progressArea: { gap: spacing.sm },
  progressTrack: { flexDirection: 'row', gap: spacing.sm },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border.subtle,
  },
  progressSegmentActive: { backgroundColor: colors.primary[700] },
  scroll: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  stepContent: { gap: spacing.xl },
  stepHeading: { gap: spacing.sm },
  cover: {
    height: 190,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.selected,
  },
  coverImage: { width: '100%', height: '100%' },
  coverEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  removeCover: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay.modal,
  },
  summaryInput: { minHeight: 88, paddingTop: spacing.md, textAlignVertical: 'top' },
  metricsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  metricField: { flex: 1 },
  optionGroup: { gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.surface,
  },
  chipSelected: {
    borderColor: colors.primary[300],
    backgroundColor: colors.background.selected,
  },
  ingredientCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.background.muted,
  },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  flexText: { flex: 1 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientFields: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  ingredientField: { flex: 1 },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing['2xl'],
    borderRadius: radius.xl,
    backgroundColor: colors.background.selected,
  },
  centerText: { textAlign: 'center' },
  instructionCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.background.surface,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[700],
  },
  stepInput: { minHeight: 100, paddingTop: spacing.md, textAlignVertical: 'top' },
  footer: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
  backButton: { flex: 1 },
  nextButton: { flex: 2, marginLeft: 'auto' },
  finalButton: { flex: 1 },
});
