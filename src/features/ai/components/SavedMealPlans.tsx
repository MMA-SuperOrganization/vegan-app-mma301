import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { AI_ROUTES, AI_TRANSLATION_KEYS } from '../aiConstants';
import { useSavedMealPlans } from '../hooks';

export function SavedMealPlans() {
  const { t } = useTranslation();
  const keys = AI_TRANSLATION_KEYS.MEAL_PLANNER;
  const router = useRouter();
  const query = useSavedMealPlans();

  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="heading3">{t(keys.SAVED_PLANS_TITLE)}</AppText>
      <FeatureState
        loading={query.isLoading}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {query.data?.data.length === 0 ? (
        <AppText>{t(keys.NO_SAVED_PLANS)}</AppText>
      ) : null}
      {query.data?.data.map((plan) => (
        <AppButton
          key={plan._id}
          variant="outline"
          title={plan.title + ' · ' + plan.weekStartDate.slice(0, 10)}
          onPress={() =>
            router.push({
              pathname: AI_ROUTES.MEAL_PLAN_TAB,
              params: { planId: plan._id, date: plan.weekStartDate.slice(0, 10) },
            })
          }
        />
      ))}
    </View>
  );
}
