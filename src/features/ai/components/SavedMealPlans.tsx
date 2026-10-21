import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppText } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useSavedMealPlans } from '../hooks';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
export function SavedMealPlans() {
  const vi = useTranslation().locale === 'vi';
  const router = useRouter();
  const query = useSavedMealPlans();
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="heading3">
        {vi ? 'Thực đơn đã lưu' : 'Saved meal plans'}
      </AppText>
      <FeatureState
        loading={query.isLoading}
        error={query.error}
        retry={() => void query.refetch()}
      />
      {query.data?.data.length === 0 ? (
        <AppText>{vi ? 'Chưa có thực đơn.' : 'No saved plans yet.'}</AppText>
      ) : null}
      {query.data?.data.map((plan) => (
        <AppButton
          key={plan._id}
          variant="outline"
          title={plan.title + ' · ' + plan.weekStartDate.slice(0, 10)}
          onPress={() =>
            router.push({
              pathname: '/(tabs)/meal-plan',
              params: { planId: plan._id, date: plan.weekStartDate.slice(0, 10) },
            })
          }
        />
      ))}
    </View>
  );
}
