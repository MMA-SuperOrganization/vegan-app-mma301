import { useState, type ComponentProps } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  Surface,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { mediaApi } from '@/features/media/mediaApi';
import { RecipeImage } from '@/features/recipes/components/RecipeImage';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing, webLayout } from '@/theme';
import { moderationApi, type RecipeReviewItem } from '../moderationApi';
import { useModeration } from '../hooks';

export function RecipeReviewScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const router = useRouter();
  const vi = useTranslation().locale === 'vi';
  const [reason, setReason] = useState('');
  const [confirm, setConfirm] = useState<'publish' | 'reject' | null>(null);
  const target: RecipeReviewItem = {
    _id: id,
    title: title ?? (vi ? 'Công thức' : 'Recipe'),
    type: 'recipe',
    status: 'pending_review',
  };
  const content = useQuery({
    queryKey: ['moderation-content', 'recipe', id],
    queryFn: () => moderationApi.content(target),
    enabled: !!id,
  });
  const actions = useModeration();
  const recipe = content.data;
  const busy = actions.review.isPending;
  const nutrition = recipe?.nutritionPerServing ?? recipe?.nutritionPer100g;

  const submit = () => {
    if (!recipe || !confirm) return;
    actions.review.mutate(
      {
        target,
        version: recipe.version ?? 0,
        reject: confirm === 'reject',
        reason: reason.trim(),
      },
      {
        onSuccess: () => router.back(),
        onError: () => void content.refetch(),
      }
    );
  };

  return (
    <ScreenWrapper
      scrollable
      webMaxWidth={webLayout.catalogMaxWidth}
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={vi ? 'Chi tiết công thức' : 'Recipe review'}
          showBack
          backFallbackHref="/admin/moderation"
        />
      }
    >
      <FeatureState
        loading={content.isLoading}
        error={content.error}
        retry={() => void content.refetch()}
      />

      {recipe ? (
        <>
          <Surface bordered padding="lg" radius="xl" style={styles.section}>
            <View style={styles.imageBlock}>
              <AppText variant="caption" color={colors.text.secondary}>
                {vi ? 'Ảnh bìa công thức' : 'Recipe cover image'}
              </AppText>
              <ReviewRecipeImage
                directUrl={recipe.coverImageUrl}
                mediaId={recipe.coverMediaId}
                vi={vi}
                style={styles.coverImage}
              />
            </View>
            <AppText variant="heading2">{recipe.title ?? target.title}</AppText>
            {recipe.description || recipe.summary ? (
              <AppText color={colors.text.secondary} selectable>
                {recipe.description ?? recipe.summary}
              </AppText>
            ) : null}
            <View style={styles.metaRow}>
              <Meta label={vi ? 'Khẩu phần' : 'Servings'} value={recipe.servings} />
              <Meta
                label={vi ? 'Chuẩn bị' : 'Prep'}
                value={formatMinutes(recipe.prepMinutes, vi)}
              />
              <Meta
                label={vi ? 'Nấu' : 'Cook'}
                value={formatMinutes(recipe.cookMinutes, vi)}
              />
              <Meta label={vi ? 'Độ khó' : 'Difficulty'} value={recipe.difficulty} />
            </View>
            {recipe.tags?.length ? (
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {recipe.tags.join(' · ')}
              </AppText>
            ) : null}
          </Surface>

          <Surface bordered padding="lg" radius="xl" style={styles.section}>
            <AppText variant="heading3">{vi ? 'Nguyên liệu' : 'Ingredients'}</AppText>
            {recipe.ingredients?.length ? (
              recipe.ingredients.map((ingredient, index) => (
                <View key={`${ingredient.foodItemId}-${index}`} style={styles.listRow}>
                  <AppText style={styles.listIndex}>{index + 1}</AppText>
                  <View style={styles.listCopy}>
                    <AppText variant="bodyStrong">{ingredient.foodNameSnapshot}</AppText>
                    <AppText color={colors.text.secondary}>
                      {ingredient.quantity} {ingredient.unit}
                      {ingredient.note ? ` · ${ingredient.note}` : ''}
                    </AppText>
                  </View>
                </View>
              ))
            ) : (
              <AppText color={colors.text.secondary}>
                {vi ? 'Chưa có nguyên liệu.' : 'No ingredients provided.'}
              </AppText>
            )}
          </Surface>

          <Surface bordered padding="lg" radius="xl" style={styles.section}>
            <AppText variant="heading3">{vi ? 'Các bước thực hiện' : 'Directions'}</AppText>
            {recipe.steps?.length ? (
              [...recipe.steps]
                .sort((a, b) => a.order - b.order)
                .map((step) => (
                  <View key={step.order} style={styles.listRow}>
                    <AppText style={styles.listIndex}>{step.order}</AppText>
                    <View style={styles.listCopy}>
                      <AppText selectable>{step.instruction}</AppText>
                      {step.mediaId ? (
                        <View style={styles.stepImageBlock}>
                          <AppText variant="caption" color={colors.text.secondary}>
                            {vi ? `Ảnh bước ${step.order}` : `Step ${step.order} image`}
                          </AppText>
                          <ReviewRecipeImage
                            mediaId={step.mediaId}
                            vi={vi}
                            style={styles.stepImage}
                          />
                        </View>
                      ) : null}
                      {step.timerSeconds ? (
                        <AppText variant="bodySmall" color={colors.text.secondary}>
                          {vi ? 'Hẹn giờ' : 'Timer'}: {Math.ceil(step.timerSeconds / 60)} min
                        </AppText>
                      ) : null}
                    </View>
                  </View>
                ))
            ) : (
              <AppText color={colors.text.secondary}>
                {vi ? 'Chưa có hướng dẫn.' : 'No directions provided.'}
              </AppText>
            )}
          </Surface>

          {nutrition ? (
            <Surface bordered padding="lg" radius="xl" style={styles.section}>
              <AppText variant="heading3">
                {vi ? 'Dinh dưỡng mỗi khẩu phần' : 'Nutrition per serving'}
              </AppText>
              <View style={styles.metaRow}>
                <Meta label="kcal" value={nutrition.caloriesKcal} />
                <Meta label={vi ? 'Đạm (g)' : 'Protein (g)'} value={nutrition.proteinG} />
                <Meta label="Carbs (g)" value={nutrition.carbsG} />
                <Meta label={vi ? 'Chất béo (g)' : 'Fat (g)'} value={nutrition.fatG} />
              </View>
            </Surface>
          ) : null}

          {recipe.playback?.downloadUrl || recipe.playback?.url ? (
            <AppButton
              title={vi ? 'Xem video' : 'Watch video'}
              variant="outline"
              onPress={() => {
                const url = recipe.playback?.downloadUrl ?? recipe.playback?.url;
                if (url && /^https?:\/\//.test(url)) void Linking.openURL(url);
              }}
            />
          ) : null}

          <Surface bordered padding="lg" radius="xl" style={styles.section}>
            <AppText variant="heading3">{vi ? 'Quyết định kiểm duyệt' : 'Moderation decision'}</AppText>
            <AppInput
              label={vi ? 'Lý do từ chối' : 'Rejection reason'}
              value={reason}
              onChangeText={setReason}
              maxLength={2000}
              editable={!busy}
              multiline
            />
            <View style={styles.actions}>
              <AppButton
                title={vi ? 'Xuất bản' : 'Publish'}
                disabled={busy}
                onPress={() => setConfirm('publish')}
              />
              <AppButton
                title={vi ? 'Từ chối' : 'Reject'}
                variant="outline"
                disabled={busy || !reason.trim()}
                onPress={() => setConfirm('reject')}
              />
            </View>
            {confirm ? (
              <View style={styles.confirmation}>
                <AppText variant="bodyStrong">
                  {vi ? 'Xác nhận quyết định kiểm duyệt này?' : 'Confirm this moderation decision?'}
                </AppText>
                <AppButton
                  title={vi ? 'Xác nhận' : 'Confirm'}
                  loading={busy}
                  disabled={busy}
                  onPress={submit}
                />
                <AppButton
                  title={vi ? 'Hủy' : 'Cancel'}
                  variant="ghost"
                  disabled={busy}
                  onPress={() => setConfirm(null)}
                />
              </View>
            ) : null}
            <FeatureState error={actions.review.error} />
          </Surface>
        </>
      ) : null}
    </ScreenWrapper>
  );
}

function Meta({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <View style={styles.metaItem}>
      <AppText variant="caption" color={colors.text.secondary}>{label}</AppText>
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  );
}

function ReviewRecipeImage({
  directUrl,
  mediaId,
  vi,
  style,
}: {
  directUrl?: string;
  mediaId?: string | null;
  vi: boolean;
  style: ComponentProps<typeof RecipeImage>['style'];
}) {
  const asset = useQuery({
    queryKey: ['moderation', 'recipe-media', mediaId],
    queryFn: () => mediaApi.asset(mediaId!),
    enabled: !directUrl && !!mediaId,
    staleTime: 60_000,
  });

  return (
    <View style={styles.mediaFrame}>
      <RecipeImage
        uri={directUrl ?? asset.data?.downloadUrl}
        style={style}
        fallbackSize="large"
      />
      {asset.isError ? (
        <AppText variant="caption" color={colors.status.danger}>
          {vi ? 'Không tải được ảnh' : 'Could not load image'}
        </AppText>
      ) : null}
    </View>
  );
}

function formatMinutes(value: number | undefined, vi: boolean) {
  return value === undefined ? undefined : `${value} ${vi ? 'phút' : 'min'}`;
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  section: { gap: spacing.md },
  imageBlock: { gap: spacing.xs },
  mediaFrame: { gap: spacing.xs },
  coverImage: {
    width: '100%',
    height: 280,
    borderRadius: radius.lg,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metaItem: {
    minWidth: 108,
    flexGrow: 1,
    padding: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.background.muted,
    borderRadius: 8,
  },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  listIndex: {
    width: 28,
    height: 28,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.primary[700],
    backgroundColor: colors.background.selected,
    borderRadius: 14,
  },
  listCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  stepImageBlock: { marginTop: spacing.xs, gap: spacing.xs },
  stepImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
  },
  actions: { gap: spacing.sm },
  confirmation: { padding: spacing.md, gap: spacing.sm, backgroundColor: colors.background.selected, borderRadius: 8 },
});
