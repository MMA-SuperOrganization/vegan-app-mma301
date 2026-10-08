import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  AppButton,
  AppText,
  EmptyState,
  LoadingSpinner,
  ScreenWrapper,
} from '@/components';
import { colors, radius, spacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { RecipeHeader } from '../components/RecipeHeader';
import { RecipeImage } from '../components/RecipeImage';
import { formatTimer } from '../timer';
import { useRecipeDetail } from '../hooks';
import { useStepTimer } from '../useStepTimer';

export function CookingStepsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '');
  const recipe = useRecipeDetail(id);
  const [index, setIndex] = useState(0);
  const steps = [...(recipe.data?.steps ?? [])].sort((a, b) => a.order - b.order);
  const safeIndex = Math.min(index, Math.max(0, steps.length - 1));
  const step = steps[safeIndex];
  const timer = useStepTimer(
    step?.timerSeconds ?? 0,
    `${id}:${step?.order ?? 'empty'}`
  );
  const detailHref = {
    pathname: '/(discover)/recipe/[id]',
    params: { id },
  } as const;

  if (recipe.isLoading)
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <RecipeHeader
          title={t('recipe.cookingTitle')}
          backFallbackHref={detailHref}
        />
        <LoadingSpinner text={t('recipe.preparing')} />
      </ScreenWrapper>
    );
  if (recipe.isError || !recipe.data)
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <RecipeHeader
          title={t('recipe.cookingTitle')}
          backFallbackHref={detailHref}
        />
        <EmptyState
          title={t('recipe.guideError')}
          description={recipe.error?.message}
          actionLabel={t('common.retry')}
          onAction={() => void recipe.refetch()}
        />
      </ScreenWrapper>
    );
  if (!step)
    return (
      <ScreenWrapper contentContainerStyle={styles.screen}>
        <RecipeHeader
          title={t('recipe.cookingTitle')}
          backFallbackHref={detailHref}
        />
        <EmptyState
          title={t('recipe.noSteps')}
          description={t('recipe.noStepsDescription')}
        />
      </ScreenWrapper>
    );

  const lastStep = safeIndex === steps.length - 1;
  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.screen}>
      <RecipeHeader
        title={t('recipe.cookingTitle')}
        subtitle={t('recipe.stepProgress', {
          current: safeIndex + 1,
          total: steps.length,
        })}
        backFallbackHref={detailHref}
      />
      <RecipeImage
        uri={recipe.data.coverImageUrl}
        style={styles.illustration}
        fallbackSize="large"
      />
      <View style={styles.step}>
        <AppText variant="heading2">
          {String(step.order).padStart(2, '0')} · {t('recipe.stepLabel')}
        </AppText>
        <AppText variant="bodyLarge" color={colors.text.secondary}>
          {step.instruction}
        </AppText>
      </View>

      {step.timerSeconds ? (
        <View style={styles.timerCard}>
          <AppText variant="heading4">{t('recipe.timerTitle')}</AppText>
          <AppText variant="heading2" color={colors.primary[700]}>
            {formatTimer(timer.remaining)}
          </AppText>
          <AppText color={colors.text.secondary}>
            {timer.running ? t('recipe.timerRunning') : t('recipe.timerHint')}
          </AppText>
          <View style={styles.timerActions}>
            <Pressable
              accessibilityRole="button"
              onPress={timer.running ? timer.pause : timer.start}
              style={styles.timerAction}
            >
              <AppText variant="bodyStrong" color={colors.primary[700]}>
                {timer.running ? t('recipe.timerPause') : t('recipe.timerStart')}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={timer.reset}
              style={styles.timerAction}
            >
              <AppText variant="bodyStrong" color={colors.primary[700]}>
                {t('recipe.timerReset')}
              </AppText>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        <AppButton
          title={t('recipe.previousStep')}
          variant="outline"
          disabled={safeIndex === 0}
          onPress={() => setIndex((value) => Math.max(0, value - 1))}
          style={styles.action}
        />
        <AppButton
          title={lastStep ? t('recipe.completed') : t('recipe.nextStep')}
          onPress={() =>
            lastStep
              ? router.replace(detailHref)
              : setIndex((value) => Math.min(steps.length - 1, value + 1))
          }
          style={styles.action}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.xl },
  illustration: { width: '100%', height: 220, borderRadius: radius.xl },
  step: { gap: spacing.md },
  timerCard: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
  timerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timerAction: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderRadius: radius.full,
  },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flex: 1 },
});
