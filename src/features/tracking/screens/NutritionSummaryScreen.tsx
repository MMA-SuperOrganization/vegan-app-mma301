import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  AppText,
  CustomHeader,
  NutritionTargetCard,
  ScreenWrapper,
} from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { DayNavigator } from '../components/DayNavigator';
import { TrackingQueryState } from '../components/TrackingQueryState';
import { useDiarySummary, useTrackingTargets } from '../hooks/useTrackingApi';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import { isLocalIsoDate, toLocalIsoDate } from '../trackingState';

export function NutritionSummaryScreen() {
  const params = useLocalSearchParams<{ date?: string }>();
  const { t } = useTranslation();
  const { formatLongDate, formatNumber } = useTrackingFormat();
  const initialDate = isLocalIsoDate(params.date)
    ? params.date
    : toLocalIsoDate(new Date());
  const [date, setDate] = useState(initialDate);
  const [pickerVisible, setPickerVisible] = useState(false);
  const summary = useDiarySummary(date);
  const profileTargets = useTrackingTargets();
  const nutrition = summary.data?.nutrition;
  const targets = summary.data?.dailyTargets;

  return (
    <>
      <ScreenWrapper
        scrollable
        keyboardAvoiding={false}
        edges={['top', 'left', 'right', 'bottom']}
        contentContainerStyle={styles.screen}
        header={
          <CustomHeader
            title={t('tracking.summary.title')}
            showBack
            backFallbackHref="/(tracking)/food-diary"
          />
        }
      >
        <View style={styles.content}>
          <DayNavigator
            date={date}
            onChange={setDate}
            onOpenPicker={() => setPickerVisible(true)}
          />
          <TrackingQueryState
            loading={summary.isLoading}
            error={summary.isError}
            onRetry={() => void summary.refetch()}
          />
          {!summary.isLoading && !summary.isError && nutrition ? (
            <>
              <View style={styles.heading}>
                <AppText variant="heading3">{formatLongDate(date)}</AppText>
                <AppText color={colors.text.secondary}>
                  {t('tracking.summary.entryCount', {
                    count: summary.data?.entryCount ?? 0,
                  })}
                </AppText>
              </View>
              <View style={styles.grid}>
                <NutritionTargetCard
                  label={t('tracking.summary.calories')}
                  value={nutrition.caloriesKcal}
                  target={targets?.caloriesKcal ?? profileTargets.energyKcal}
                  unit="kcal"
                  formatNumber={formatNumber}
                  style={styles.card}
                />
                <NutritionTargetCard
                  label={t('tracking.summary.protein')}
                  value={nutrition.proteinG}
                  target={targets?.proteinG ?? profileTargets.proteinG}
                  unit="g"
                  formatNumber={formatNumber}
                  style={styles.card}
                />
                <NutritionTargetCard
                  label={t('tracking.summary.carbs')}
                  value={nutrition.carbsG}
                  target={targets?.carbsG ?? profileTargets.carbsG}
                  unit="g"
                  formatNumber={formatNumber}
                  style={styles.card}
                />
                <NutritionTargetCard
                  label={t('tracking.summary.fat')}
                  value={nutrition.fatG}
                  target={targets?.fatG ?? profileTargets.fatG}
                  unit="g"
                  formatNumber={formatNumber}
                  style={styles.card}
                />
              </View>
              <AppText variant="bodySmall" color={colors.text.secondary}>
                {t('tracking.summary.description')}
              </AppText>
            </>
          ) : null}
        </View>
      </ScreenWrapper>
      <DatePickerSheet
        visible={pickerVisible}
        selectedDate={date}
        onSelect={setDate}
        onClose={() => setPickerVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing['4xl'] },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  heading: { gap: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: { flexGrow: 1, flexBasis: '46%' },
});
