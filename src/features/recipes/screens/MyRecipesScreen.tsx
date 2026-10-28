import { Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { recipeApi } from '../recipeApi';

export function MyRecipesScreen() {
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const recipes = useQuery({
    queryKey: ['account', userId, 'recipes', 'mine'],
    queryFn: recipeApi.mine,
    enabled: Boolean(userId),
  });
  const remove = useMutation({
    mutationFn: recipeApi.remove,
    onSuccess: () => client.invalidateQueries({ queryKey: ['account', userId] }),
  });
  const archive = useMutation({
    mutationFn: recipeApi.archive,
    onSuccess: () => client.invalidateQueries({ queryKey: ['account', userId] }),
  });
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Công thức của tôi' : 'My recipes'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
    >
      <AppButton
        title={vi ? 'Tạo công thức' : 'Create recipe'}
        onPress={() => router.push('/recipes/editor')}
      />
      <FeatureState
        loading={recipes.isLoading}
        error={recipes.error}
        retry={() => void recipes.refetch()}
      />
      {recipes.data?.data.length === 0 ? (
        <AppText>{vi ? 'Chưa có công thức.' : 'No recipes yet.'}</AppText>
      ) : null}
      {recipes.data?.data.map((recipe) => (
        <View
          key={recipe._id}
          style={{
            padding: spacing.lg,
            gap: spacing.sm,
            borderRadius: radius.lg,
            backgroundColor: colors.background.surface,
          }}
        >
          <AppText variant="heading3">{recipe.title}</AppText>
          <AppText>{recipe.status}</AppText>
          {recipe.rejectionReason ? (
            <AppText>{recipe.rejectionReason}</AppText>
          ) : null}
          <AppButton
            title={vi ? 'Mở công thức' : 'Open recipe'}
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/recipes/editor',
                params: { id: recipe._id },
              })
            }
          />
          {['draft', 'rejected', 'published'].includes(recipe.status || '') ? (
            <AppButton
              title={vi ? 'Lưu trữ công thức' : 'Archive recipe'}
              variant="outline"
              disabled={archive.isPending}
              onPress={() =>
                Alert.alert(
                  vi ? 'Lưu trữ công thức?' : 'Archive recipe?',
                  recipe.title,
                  [
                    { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
                    {
                      text: vi ? 'Lưu trữ' : 'Archive',
                      onPress: () => archive.mutate(recipe),
                    },
                  ]
                )
              }
            />
          ) : null}
          <AppButton
            title={vi ? 'Xóa công thức' : 'Delete recipe'}
            variant="ghost"
            disabled={remove.isPending}
            onPress={() =>
              Alert.alert(vi ? 'Xóa công thức?' : 'Delete recipe?', recipe.title, [
                { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
                {
                  text: vi ? 'Xóa' : 'Delete',
                  style: 'destructive',
                  onPress: () => remove.mutate(recipe._id),
                },
              ])
            }
          />
        </View>
      ))}
    </ScreenWrapper>
  );
}
