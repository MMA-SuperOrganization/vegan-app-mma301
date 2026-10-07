import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, EmptyState, LoadingSpinner, ScreenWrapper } from '@/components';
import { colors, radius, spacing } from '@/theme';
import { useTranslation } from '@/i18n';
import { RecipeHeader } from '../components/RecipeHeader';
import { useRecipeDetail } from '../hooks';

export function CookingStepsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? '';
  const recipe = useRecipeDetail(id);
  const [index, setIndex] = useState(0);
  if (recipe.isLoading) return <LoadingSpinner text={t('recipe.preparing')} />;
  if (recipe.isError || !recipe.data) return <ScreenWrapper><EmptyState title={t('recipe.guideError')} description={recipe.error?.message} actionLabel={t('common.retry')} onAction={() => void recipe.refetch()} /></ScreenWrapper>;
  const steps = [...(recipe.data.steps ?? [])].sort((a, b) => a.order - b.order);
  if (!steps.length) return <ScreenWrapper><EmptyState title={t('recipe.noSteps')} description={t('recipe.noStepsDescription')} /></ScreenWrapper>;
  const step = steps[index];
  return (
    <ScreenWrapper contentContainerStyle={styles.screen}>
      <RecipeHeader
        title={t('recipe.cookingTitle')}
        subtitle={t('recipe.stepProgress', { current: index + 1, total: steps.length })}
        backFallbackHref={{ pathname: '/(discover)/recipe/[id]', params: { id } }}
      />
      <View style={styles.illustration}><AppText variant="display">🥬</AppText></View>
      <View style={styles.step}>
        <AppText variant="heading2">{String(step.order).padStart(2, '0')}</AppText>
        <AppText variant="bodyLarge">{step.instruction}</AppText>
        {step.timerSeconds ? <AppText color={colors.primary[700]}>{t('recipe.timer', { count: Math.ceil(step.timerSeconds / 60) })}</AppText> : null}
      </View>
      <View style={styles.actions}>
        <AppButton title={t('recipe.previousStep')} variant="outline" disabled={index === 0} onPress={() => setIndex((value) => value - 1)} style={styles.action} />
        <AppButton title={index === steps.length - 1 ? t('recipe.completed') : t('recipe.nextStep')} disabled={index === steps.length - 1} onPress={() => setIndex((value) => value + 1)} style={styles.action} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, gap: spacing.xl },
  illustration: { height: 220, backgroundColor: colors.background.selected, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  step: { flex: 1, gap: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flex: 1 },
});
