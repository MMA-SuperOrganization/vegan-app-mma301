import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, CalendarDatePicker, ScreenWrapper } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { DailyDiaryCard } from '../components/DailyDiaryCard';
import { DiaryDayNavigator } from '../components/DiaryDayNavigator';
import { TrackingQuickMetricCard } from '../components/TrackingQuickMetricCard';
import { TrackingQueryState } from '../components/TrackingQueryState';
import {
  useDiary,
  useDiarySummary,
  useTrackingTargets,
  useWater,
  useWeightTrend,
} from '../hooks/useTrackingApi';
import { useTrackingFormat } from '../hooks/useTrackingFormat';
import {
  localIsoDateToDate,
  toLocalIsoDate,
  TRACKING_MINIMUM_DATE,
} from '../trackingState';

export function TrackingHubScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { formatNumber } = useTrackingFormat();
  const today = toLocalIsoDate(new Date());
  const [date, setDate] = useState(today);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const diary = useDiarySummary(date);
  const diaryEntries = useDiary(date);
  const trend = useWeightTrend();
  const waterQuery = useWater(date);
  const targets = useTrackingTargets();
  const overview = {
    date,
    energy: {
      consumedKcal: diary.data?.nutrition.caloriesKcal ?? 0,
      targetKcal: diary.data?.dailyTargets.caloriesKcal ?? targets.energyKcal,
    },
    weight:
      trend.data?.endWeightKg == null
        ? null
        : {
            latestWeightKg: trend.data.endWeightKg,
            changeKg: trend.data.changeKg,
            periodDays: 30,
          },
    water: {
      consumedMl: waterQuery.data?.meta?.totalMl ?? 0,
      targetMl: targets.waterMl,
    },
  };
  const loading =
    diary.isLoading || diaryEntries.isLoading || trend.isLoading || waterQuery.isLoading;
  const error =
    diary.isError || diaryEntries.isError || trend.isError || waterQuery.isError;
  const retry = () =>
    void Promise.all([
      diary.refetch(),
      diaryEntries.refetch(),
      trend.refetch(),
      waterQuery.refetch(),
    ]);

  const { energy, weight, water } = overview;
  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.screen}
    >
      <View style={styles.header}>
        <AppText variant="heading1">{t('tracking.hub.title')}</AppText>
        <AppText color={colors.text.secondary}>{t('tracking.hub.subtitle')}</AppText>
      </View>

      <DiaryDayNavigator
        date={date}
        today={today}
        onChange={setDate}
        onOpenCalendar={() => setCalendarVisible(true)}
      />

      <View style={styles.sectionHeader}>
        <AppText variant="heading4">
          {date === today
            ? t('tracking.hub.todayOverview')
            : t('tracking.hub.dayOverview')}
        </AppText>
      </View>

      <TrackingQueryState loading={loading} error={error} onRetry={retry} />

      {!loading && !error ? (
        <>
          <DailyDiaryCard
            entries={diaryEntries.data?.data ?? []}
            consumedKcal={energy.consumedKcal}
            targetKcal={energy.targetKcal}
            onPress={() =>
              router.push({
                pathname: '/(tracking)/food-diary',
                params: { date },
              })
            }
          />

          <View style={styles.secondaryHeader}>
            <AppText variant="bodyStrong">{t('tracking.hub.secondaryTitle')}</AppText>
          </View>
          <View style={styles.quickMetrics}>
            <TrackingQuickMetricCard
              testID="tracking-hub-weight"
              icon="scale"
              iconColor={colors.primary[700]}
              iconBackground={colors.primary[100]}
              title={t('tracking.hub.weightTitle')}
              value={
                weight
                  ? t('tracking.hub.weightValue', {
                      weight: formatNumber(weight.latestWeightKg, 1, 1),
                    })
                  : t('tracking.hub.weightEmpty')
              }
              onPress={() => router.push('/(tracking)/weight')}
            />

            <TrackingQuickMetricCard
              testID="tracking-hub-water"
              icon="water"
              iconColor={colors.status.info}
              iconBackground={colors.background.muted}
              title={
                date === today
                  ? t('tracking.hub.waterTitle')
                  : t('tracking.hub.waterTitleDay')
              }
              value={
                t('tracking.hub.waterValueNoTarget', {
                  consumed: formatNumber(water.consumedMl),
                })
              }
              onPress={() =>
                router.push({ pathname: '/(tracking)/water', params: { date } })
              }
            />
          </View>
        </>
      ) : null}
      <CalendarDatePicker
        visible={calendarVisible}
        title={t('tracking.day.chooseDate')}
        value={localIsoDateToDate(date)}
        minimumDate={TRACKING_MINIMUM_DATE}
        maximumDate={localIsoDateToDate(today)}
        onConfirm={(selected) => {
          setDate(toLocalIsoDate(selected));
          setCalendarVisible(false);
        }}
        onClose={() => setCalendarVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  sectionHeader: {
    marginTop: spacing.sm,
  },
  secondaryHeader: { marginTop: spacing.xs },
  quickMetrics: { flexDirection: 'row', gap: spacing.md },
});
