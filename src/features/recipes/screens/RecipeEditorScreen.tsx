import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppIcon,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  SearchPickerSheet,
  appDialog,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { usePantryFoodOptions } from '@/features/pantry/hooks';
import { useRecipeCategories } from '../hooks';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing, webLayout } from '@/theme';
import { recipeApi } from '../recipeApi';
import type { RecipeAuthorInput, RecipeDetail, RecipeDifficulty } from '../types';
import { mediaApi } from '@/features/media/mediaApi';

type Ingredient = {
  foodItemId: string;
  name: string;
  quantity: string;
  unit: string;
  note: string;
};

type Step = {
  instruction: string;
  mediaId?: string | null;
  asset?: ImagePicker.ImagePickerAsset;
};

type VariantDraft = {
  variantId?: string;
  name: string;
  region: string;
  countryCode: string;
  ingredients: Ingredient[];
};

export function RecipeEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const client = useQueryClient();
  const { locale, t } = useTranslation();
  const vi = locale === 'vi';
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [servings, setServings] = useState('2');
  const [prepMinutes, setPrepMinutes] = useState('10');
  const [cookMinutes, setCookMinutes] = useState('20');
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('easy');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [steps, setSteps] = useState<Step[]>([{ instruction: '' }]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>(
    'public'
  );
  const [cover, setCover] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const foodOptions = usePantryFoodOptions(search, pickerOpen);
  const foods = foodOptions.data?.pages.flatMap((page) => page.data) ?? [];
  const categories = useRecipeCategories();
  const recipe = useQuery({
    queryKey: ['recipe-author', id],
    queryFn: () => recipeApi.detail(id!),
    enabled: Boolean(id),
  });
  useEffect(() => {
    const value = recipe.data;
    if (!value) return;
    setTitle(value.title || '');
    setSummary(value.summary || '');
    setServings(String(value.servings || 1));
    setPrepMinutes(String(value.prepMinutes || 0));
    setCookMinutes(String(value.cookMinutes || 0));
    setDifficulty(value.difficulty || 'easy');
    setIngredients(
      (value.ingredients || []).map((item) => ({
        foodItemId: item.foodItemId,
        name: item.foodNameSnapshot,
        quantity: String(item.quantity),
        unit: item.unit,
        note: item.note || '',
      }))
    );
    setVariants(
      (value.variants || []).map((variant) => ({
        variantId: variant.variantId,
        name: variant.name,
        region: variant.region || '',
        countryCode: variant.countryCode || '',
        ingredients: variant.ingredients.map((item) => ({
          foodItemId: item.foodItemId,
          name: item.foodNameSnapshot,
          quantity: String(item.quantity),
          unit: item.unit,
          note: item.note || '',
        })),
      }))
    );
    setSteps(
      (value.steps || []).map((step) => ({
        instruction: step.instruction,
        mediaId: step.mediaId,
      }))
    );
    setCategoryId(value.categoryIds?.[0] ?? null);
    setTags((value.tags || []).join(', '));
    setVisibility(value.visibility || 'public');
  }, [recipe.data]);
  const editable =
    !id ||
    ['draft', 'rejected', 'published', 'archived'].includes(
      recipe.data?.status || ''
    );
  const save = useMutation({
    mutationFn: async ({ submit }: { submit: boolean }) => {
      const coverMediaId = cover
        ? await mediaApi.uploadImage(cover, 'recipe')
        : undefined;
      const storedSteps = await Promise.all(
        steps
          .filter((step) => step.instruction.trim())
          .map(async (step, index) => ({
            order: index + 1,
            instruction: step.instruction.trim(),
            mediaId: step.asset
              ? await mediaApi.uploadImage(step.asset, 'recipe_step')
              : step.mediaId,
          }))
      );
      const input: RecipeAuthorInput = {
        title: title.trim(),
        summary: summary.trim(),
        ...(coverMediaId
          ? { coverMediaId }
          : recipe.data?.coverMediaId
            ? { coverMediaId: recipe.data.coverMediaId }
            : {}),
        servings: Number(servings),
        prepMinutes: Number(prepMinutes),
        cookMinutes: Number(cookMinutes),
        difficulty,
        categoryIds: categoryId ? [categoryId] : [],
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        ingredients: ingredients.map((item, index) => ({
          foodItemId: item.foodItemId,
          quantity: Number(item.quantity),
          unit: item.unit,
          order: index + 1,
          note: item.note.trim() || undefined,
        })),
        variants: variants.map((variant) => ({
          ...(variant.variantId ? { variantId: variant.variantId } : {}),
          name: variant.name.trim(),
          region: variant.region.trim() || undefined,
          countryCode: variant.countryCode.trim().toUpperCase() || undefined,
          servings: Number(servings),
          ingredients: variant.ingredients.map((item, index) => ({
            foodItemId: item.foodItemId,
            quantity: Number(item.quantity),
            unit: item.unit,
            order: index + 1,
            note: item.note.trim() || undefined,
          })),
        })),
        steps: storedSteps,
        visibility,
      };
      const stored = recipe.data
        ? await recipeApi.update(recipe.data._id, recipe.data.version ?? 0, input)
        : await recipeApi.create(input);
      return submit ? recipeApi.submit(stored) : stored;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['account'] });
      router.replace('/recipes');
    },
  });
  const valid =
    title.trim() &&
    Number(servings) > 0 &&
    Number(prepMinutes) >= 0 &&
    Number(cookMinutes) >= 0 &&
    ingredients.length > 0 &&
    ingredients.every((item) => Number(item.quantity) > 0) &&
    variants.every(
      (variant) =>
        variant.name.trim() &&
        variant.ingredients.length > 0 &&
        variant.ingredients.every((item) => Number(item.quantity) > 0)
    ) &&
    steps.some((step) => step.instruction.trim());
  const saveRecipe = (submit: boolean) => {
    if (!valid) {
      appDialog.alert(
        vi ? 'Thiếu thông tin' : 'Missing information',
        vi
          ? 'Hãy nhập tiêu đề, khẩu phần, ít nhất một nguyên liệu và một bước.'
          : 'Add a title, servings, at least one ingredient and one step.'
      );
      return;
    }
    save.mutate({ submit });
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
  return (
    <ScreenWrapper
      scrollable
      webMaxWidth={webLayout.formMaxWidth}
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Soạn công thức' : 'Recipe editor'}
          showBack
          backFallbackHref="/recipes"
        />
      }
    >
      <FeatureState
        loading={recipe.isLoading}
        error={recipe.error}
        retry={() => void recipe.refetch()}
      />
      {!editable && recipe.data ? (
        <AppText>
          {vi
            ? 'Công thức đang chờ duyệt nên tạm thời không thể sửa.'
            : 'This recipe is under review and cannot be edited yet.'}
        </AppText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('recipe.chooseCover')}
        disabled={!editable || save.isPending}
        onPress={() => void chooseCover()}
        style={({ pressed }) => [styles.storyCover, pressed && styles.pressed]}
      >
        {cover?.uri || recipe.data?.coverImageUrl ? (
          <Image
            source={{ uri: cover?.uri || recipe.data?.coverImageUrl }}
            style={styles.storyCoverImage}
          />
        ) : (
          <View style={styles.storyCoverEmpty}>
            <AppIcon name="image" size={34} color={colors.primary[700]} decorative />
            <AppText variant="heading4" color={colors.primary[700]}>
              {t('recipe.createStoryTitle')}
            </AppText>
            <AppText variant="bodySmall" color={colors.text.secondary}>
              {t('recipe.createStoryHint')}
            </AppText>
          </View>
        )}
        <View style={styles.storyCoverAction}>
          <AppIcon name="image" size={18} color={colors.common.white} decorative />
          <AppText variant="caption" color={colors.common.white}>
            {t('recipe.chooseCover')}
          </AppText>
        </View>
      </Pressable>
      <AppInput
        label={t('recipe.titleLabel')}
        value={title}
        onChangeText={setTitle}
        editable={editable}
      />
      <AppInput
        label={t('recipe.summaryLabel')}
        value={summary}
        onChangeText={setSummary}
        multiline
        editable={editable}
      />
      <AppInput
        label={vi ? 'Khẩu phần' : 'Servings'}
        value={servings}
        onChangeText={setServings}
        keyboardType="number-pad"
        editable={editable}
      />
      <AppInput
        label={vi ? 'Phút chuẩn bị' : 'Prep minutes'}
        value={prepMinutes}
        onChangeText={setPrepMinutes}
        keyboardType="number-pad"
        editable={editable}
      />
      <AppInput
        label={vi ? 'Phút nấu' : 'Cook minutes'}
        value={cookMinutes}
        onChangeText={setCookMinutes}
        keyboardType="number-pad"
        editable={editable}
      />
      <SelectionField
        label={vi ? 'Độ khó' : 'Difficulty'}
        placeholder=""
        value={difficulty}
        options={(['easy', 'medium', 'hard'] as const).map((value) => ({
          value,
          label: value,
        }))}
        onChange={setDifficulty}
      />
      <SelectionField
        label={vi ? 'Danh mục' : 'Category'}
        placeholder={vi ? 'Chọn danh mục' : 'Choose category'}
        value={categoryId}
        options={(categories.data?.data || []).map((item) => ({
          value: item._id,
          label: item.name,
        }))}
        onChange={setCategoryId}
      />
      <AppInput
        label={vi ? 'Thẻ (phân cách bằng dấu phẩy)' : 'Tags (comma separated)'}
        value={tags}
        onChangeText={setTags}
        editable={editable}
      />
      <SelectionField
        label={vi ? 'Quyền xem' : 'Visibility'}
        placeholder=""
        value={visibility}
        options={(['public', 'private', 'unlisted'] as const).map((value) => ({
          value,
          label:
            value === 'public'
              ? vi
                ? 'Công khai'
                : 'Public'
              : value === 'private'
                ? vi
                  ? 'Riêng tư'
                  : 'Private'
                : vi
                  ? 'Không niêm yết'
                  : 'Unlisted',
        }))}
        onChange={setVisibility}
      />
      <AppText variant="heading3">{vi ? 'Nguyên liệu' : 'Ingredients'}</AppText>
      {ingredients.map((item, index) => (
        <View key={`${item.foodItemId}-${index}`} style={{ gap: spacing.sm }}>
          <AppText variant="bodyStrong">{item.name}</AppText>
          <AppInput
            label={vi ? 'Số lượng' : 'Quantity'}
            value={item.quantity}
            keyboardType="decimal-pad"
            editable={editable}
            onChangeText={(quantity) =>
              setIngredients((current) =>
                current.map((value, itemIndex) =>
                  itemIndex === index ? { ...value, quantity } : value
                )
              )
            }
          />
          <AppInput
            label={vi ? 'Ghi chú nguyên liệu' : 'Ingredient note'}
            value={item.note}
            editable={editable}
            onChangeText={(note) =>
              setIngredients((current) =>
                current.map((value, itemIndex) =>
                  itemIndex === index ? { ...value, note } : value
                )
              )
            }
          />
          <AppInput
            label={vi ? 'Đơn vị (g, ml, piece...)' : 'Unit (g, ml, piece...)'}
            value={item.unit}
            editable={editable}
            onChangeText={(unit) =>
              setIngredients((current) =>
                current.map((value, itemIndex) =>
                  itemIndex === index ? { ...value, unit } : value
                )
              )
            }
          />
          <AppButton
            title={vi ? 'Xóa nguyên liệu' : 'Remove ingredient'}
            variant="ghost"
            disabled={!editable}
            onPress={() =>
              setIngredients((current) =>
                current.filter((_, itemIndex) => itemIndex !== index)
              )
            }
          />
        </View>
      ))}
      <AppButton
        title={vi ? 'Thêm nguyên liệu' : 'Add ingredient'}
        variant="outline"
        disabled={!editable}
        onPress={() => setPickerOpen(true)}
      />
      <AppText variant="heading3">
        {vi ? 'Biến thể vùng miền' : 'Regional variants'}
      </AppText>
      <AppText variant="bodySmall" color={colors.text.secondary}>
        {vi
          ? 'Mỗi biến thể lưu bộ nguyên liệu riêng. Tạo từ danh sách hiện tại rồi chỉnh theo vùng.'
          : 'Each variant keeps its own ingredients. Start from the current list, then tailor it by region.'}
      </AppText>
      {variants.map((variant, index) => (
        <View key={variant.variantId || index} style={styles.variantCard}>
          <AppInput
            label={vi ? 'Tên biến thể' : 'Variant name'}
            value={variant.name}
            editable={editable}
            onChangeText={(name) =>
              setVariants((current) =>
                current.map((item, at) => (at === index ? { ...item, name } : item))
              )
            }
          />
          <AppInput
            label={vi ? 'Vùng / miền' : 'Region'}
            value={variant.region}
            editable={editable}
            onChangeText={(region) =>
              setVariants((current) =>
                current.map((item, at) =>
                  at === index ? { ...item, region } : item
                )
              )
            }
          />
          <AppInput
            label={vi ? 'Mã quốc gia (VD: VN)' : 'Country code (e.g. VN)'}
            value={variant.countryCode}
            editable={editable}
            maxLength={2}
            autoCapitalize="characters"
            onChangeText={(countryCode) =>
              setVariants((current) =>
                current.map((item, at) =>
                  at === index ? { ...item, countryCode } : item
                )
              )
            }
          />
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {vi ? 'Số nguyên liệu' : 'Ingredients'}: {variant.ingredients.length}
          </AppText>
          {variant.ingredients.map((ingredient, ingredientIndex) => (
            <View
              key={`${ingredient.foodItemId}-${ingredientIndex}`}
              style={styles.variantIngredient}
            >
              <AppText variant="bodyStrong">{ingredient.name}</AppText>
              <View style={styles.variantIngredientFields}>
                <AppInput
                  label={vi ? 'Số lượng' : 'Quantity'}
                  value={ingredient.quantity}
                  keyboardType="decimal-pad"
                  editable={editable}
                  onChangeText={(quantity) =>
                    setVariants((current) =>
                      current.map((item, at) =>
                        at === index
                          ? {
                              ...item,
                              ingredients: item.ingredients.map(
                                (value, ingredientAt) =>
                                  ingredientAt === ingredientIndex
                                    ? { ...value, quantity }
                                    : value
                              ),
                            }
                          : item
                      )
                    )
                  }
                />
                <AppInput
                  label={vi ? 'Đơn vị' : 'Unit'}
                  value={ingredient.unit}
                  editable={editable}
                  onChangeText={(unit) =>
                    setVariants((current) =>
                      current.map((item, at) =>
                        at === index
                          ? {
                              ...item,
                              ingredients: item.ingredients.map(
                                (value, ingredientAt) =>
                                  ingredientAt === ingredientIndex
                                    ? { ...value, unit }
                                    : value
                              ),
                            }
                          : item
                      )
                    )
                  }
                />
              </View>
              <AppButton
                title={vi ? 'Bỏ khỏi biến thể' : 'Remove from variant'}
                variant="ghost"
                disabled={!editable || variant.ingredients.length <= 1}
                onPress={() =>
                  setVariants((current) =>
                    current.map((item, at) =>
                      at === index
                        ? {
                            ...item,
                            ingredients: item.ingredients.filter(
                              (_, ingredientAt) => ingredientAt !== ingredientIndex
                            ),
                          }
                        : item
                    )
                  )
                }
              />
            </View>
          ))}
          <AppButton
            title={
              vi ? 'Đồng bộ từ nguyên liệu hiện tại' : 'Sync current ingredients'
            }
            variant="outline"
            disabled={!editable || ingredients.length === 0}
            onPress={() =>
              setVariants((current) =>
                current.map((item, at) =>
                  at === index
                    ? {
                        ...item,
                        ingredients: ingredients.map((ingredient) => ({
                          ...ingredient,
                        })),
                      }
                    : item
                )
              )
            }
          />
          <AppButton
            title={vi ? 'Xóa biến thể' : 'Remove variant'}
            variant="ghost"
            disabled={!editable}
            onPress={() =>
              setVariants((current) => current.filter((_, at) => at !== index))
            }
          />
        </View>
      ))}
      <AppButton
        title={
          vi
            ? 'Tạo biến thể từ nguyên liệu hiện tại'
            : 'Create variant from current ingredients'
        }
        variant="outline"
        disabled={!editable || ingredients.length === 0}
        onPress={() =>
          setVariants((current) => [
            ...current,
            {
              name: vi
                ? `Biến thể ${current.length + 1}`
                : `Variant ${current.length + 1}`,
              region: '',
              countryCode: '',
              ingredients: ingredients.map((item) => ({ ...item })),
            },
          ])
        }
      />
      <AppText variant="heading3">{vi ? 'Các bước' : 'Steps'}</AppText>
      {steps.map((step, index) => (
        <View key={index} style={{ gap: spacing.sm }}>
          <AppInput
            label={`${vi ? 'Bước' : 'Step'} ${index + 1}`}
            value={step.instruction}
            onChangeText={(instruction) =>
              setSteps((current) =>
                current.map((value, itemIndex) =>
                  itemIndex === index ? { ...value, instruction } : value
                )
              )
            }
            multiline
            editable={editable}
          />
          {step.asset?.uri ? (
            <Image
              source={{ uri: step.asset.uri }}
              style={{ width: '100%', height: 160, borderRadius: 12 }}
            />
          ) : null}
          <AppButton
            title={vi ? 'Chọn ảnh cho bước' : 'Choose step image'}
            variant="outline"
            disabled={!editable}
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.85,
              });
              if (!result.canceled)
                setSteps((current) =>
                  current.map((value, itemIndex) =>
                    itemIndex === index
                      ? { ...value, asset: result.assets[0] }
                      : value
                  )
                );
            }}
          />
          {steps.length > 1 ? (
            <AppButton
              title={vi ? 'Xóa bước' : 'Remove step'}
              variant="ghost"
              disabled={!editable}
              onPress={() =>
                setSteps((current) =>
                  current.filter((_, itemIndex) => itemIndex !== index)
                )
              }
            />
          ) : null}
        </View>
      ))}
      <AppButton
        title={vi ? 'Thêm bước' : 'Add step'}
        variant="outline"
        disabled={!editable}
        onPress={() => setSteps((current) => [...current, { instruction: '' }])}
      />
      <FeatureState error={save.error} />
      <AppButton
        title={
          visibility === 'private'
            ? vi
              ? 'Lưu món ăn cá nhân'
              : 'Save personal recipe'
            : vi
              ? 'Lưu bản nháp'
              : 'Save draft'
        }
        loading={save.isPending}
        disabled={!editable || save.isPending}
        onPress={() => saveRecipe(false)}
      />
      {visibility !== 'private' ? (
        <AppButton
          title={vi ? 'Lưu và gửi duyệt' : 'Save and submit'}
          variant="outline"
          disabled={!editable || save.isPending}
          onPress={() => saveRecipe(true)}
        />
      ) : (
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {vi
            ? 'Món ăn cá nhân chỉ hiển thị cho bạn và không được gửi lên cộng đồng.'
            : 'Personal recipes are visible only to you and are never submitted to the community.'}
        </AppText>
      )}
      <SearchPickerSheet
        visible={pickerOpen}
        title={vi ? 'Chọn thực phẩm' : 'Choose food'}
        searchPlaceholder={vi ? 'Tìm thực phẩm' : 'Search food'}
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
          if (food && !ingredients.some((item) => item.foodItemId === foodItemId))
            setIngredients((current) => [
              ...current,
              {
                foodItemId,
                name: food.name,
                quantity: '100',
                unit: 'g',
                note: '',
              },
            ]);
          setPickerOpen(false);
        }}
        hasMore={foodOptions.hasNextPage}
        loadingMore={foodOptions.isFetchingNextPage}
        onLoadMore={() => void foodOptions.fetchNextPage()}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  storyCover: {
    minHeight: 260,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.background.selected,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  storyCoverImage: { width: '100%', height: 260 },
  storyCoverEmpty: {
    flex: 1,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  storyCoverAction: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    minHeight: 42,
    borderRadius: radius.full,
    backgroundColor: 'rgba(24, 60, 43, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  pressed: { opacity: 0.78 },
  variantCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  variantIngredient: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  variantIngredientFields: { gap: spacing.sm },
});
