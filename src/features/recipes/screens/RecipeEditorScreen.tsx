import { useEffect, useState } from 'react';
import { Alert, Image, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  SearchPickerSheet,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { SelectionField } from '@/features/onboarding/components/SelectionField';
import { usePantryFoodOptions } from '@/features/pantry/hooks';
import { useRecipeCategories } from '../hooks';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
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

export function RecipeEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const client = useQueryClient();
  const vi = useTranslation().locale === 'vi';
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [servings, setServings] = useState('2');
  const [prepMinutes, setPrepMinutes] = useState('10');
  const [cookMinutes, setCookMinutes] = useState('20');
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('easy');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
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
    steps.some((step) => step.instruction.trim());
  const saveRecipe = (submit: boolean) => {
    if (!valid) {
      Alert.alert(
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
      <AppInput
        label={vi ? 'Tên công thức' : 'Recipe title'}
        value={title}
        onChangeText={setTitle}
        editable={editable}
      />
      {cover?.uri || recipe.data?.coverImageUrl ? (
        <Image
          source={{ uri: cover?.uri || recipe.data?.coverImageUrl }}
          style={{ width: '100%', height: 220, borderRadius: 12 }}
        />
      ) : null}
      <AppButton
        title={vi ? 'Chọn ảnh bìa' : 'Choose cover image'}
        variant="outline"
        disabled={!editable || save.isPending}
        onPress={() => void chooseCover()}
      />
      <AppInput
        label={vi ? 'Giới thiệu' : 'Summary'}
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
        title={vi ? 'Lưu bản nháp' : 'Save draft'}
        loading={save.isPending}
        disabled={!editable || save.isPending}
        onPress={() => saveRecipe(false)}
      />
      <AppButton
        title={vi ? 'Lưu và gửi duyệt' : 'Save and submit'}
        variant="outline"
        disabled={!editable || save.isPending}
        onPress={() => saveRecipe(true)}
      />
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
