import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  Toggle,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { isLocalIsoDate } from '@/features/tracking/trackingState';
import { startOfWeek } from '@/features/meal-plan/mealPlanState';
import { SavedMealPlans } from '../components/SavedMealPlans';
import { useTranslation } from '@/i18n';
import { spacing, colors } from '@/theme';
import { useMealProposal } from '../hooks';
import { ProposalMealEditor } from '../components/ProposalMealEditor';
import type { MealProposal } from '../types';
import { reviewMealProposal } from '../proposalState';

export function AiMealPlannerScreen() {
  const vi = useTranslation().locale === 'vi';
  const router = useRouter();
  const [startDate, setStartDate] = useState(startOfWeek(new Date()));
  const [days, setDays] = useState('7');
  const [preferences, setPreferences] = useState('');
  const [useProfile, setUseProfile] = useState(false);
  const [proposal, setProposal] = useState<MealProposal | null>(null);
  const actions = useMealProposal();
  const busy = actions.generate.isPending || actions.confirm.isPending;
  const valid =
    isLocalIsoDate(startDate) &&
    new Date(startDate + 'T12:00:00').getDay() === 1 &&
    /^[1-7]$/.test(days);
  const validProposal =
    proposal &&
    proposal.title.trim().length > 0 &&
    proposal.days.every(
      (day) =>
        day.meals.length > 0 &&
        day.meals.every((meal) => meal.servings > 0 && meal.servings <= 20)
    );
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Lập thực đơn AI' : 'AI meal planner'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
    >
      <AppText color={colors.text.secondary}>
        {vi
          ? 'Xem và chỉnh đề xuất trước khi xác nhận. Chưa có thực đơn nào được lưu khi tạo đề xuất.'
          : 'Review and edit the proposal before confirming. Generating a proposal does not save a meal plan.'}
      </AppText>
      <AppInput
        label={vi ? 'Ngày bắt đầu (YYYY-MM-DD)' : 'Start date (YYYY-MM-DD)'}
        value={startDate}
        onChangeText={setStartDate}
        editable={!busy && !proposal}
      />
      <AppText>
        {vi
          ? 'Chọn thứ Hai để thực đơn khớp với lịch tuần và danh sách mua sắm.'
          : 'Choose a Monday so the plan matches the weekly calendar and grocery list.'}
      </AppText>
      <AppInput
        label={vi ? 'Số ngày (1–7)' : 'Days (1–7)'}
        value={days}
        onChangeText={setDays}
        keyboardType="number-pad"
        editable={!busy && !proposal}
      />
      <AppInput
        label={vi ? 'Sở thích' : 'Preferences'}
        value={preferences}
        onChangeText={setPreferences}
        multiline
        maxLength={2000}
        editable={!busy}
      />
      <Toggle
        label={vi ? 'Sử dụng hồ sơ dinh dưỡng của tôi' : 'Use my nutrition profile'}
        value={useProfile}
        onValueChange={setUseProfile}
        disabled={busy}
      />
      {!proposal ? (
        <AppButton
          title={vi ? 'Tạo đề xuất' : 'Generate proposal'}
          disabled={!valid || busy}
          loading={actions.generate.isPending}
          onPress={() =>
            actions.generate.mutate(
              { startDate, days: Number(days), preferences, useProfile },
              { onSuccess: (result) => setProposal(reviewMealProposal(result)) }
            )
          }
        />
      ) : (
        <>
          <AppInput
            label={vi ? 'Tên thực đơn' : 'Plan title'}
            value={proposal.title}
            maxLength={160}
            onChangeText={(title) => setProposal({ ...proposal, title })}
            editable={!busy}
          />
          {proposal.days.map((day, dayIndex) => (
            <View
              key={day.date}
              style={{
                gap: spacing.md,
                padding: spacing.md,
                backgroundColor: colors.background.surface,
              }}
            >
              <AppText variant="heading3">{day.date}</AppText>
              {day.meals.map((meal, mealIndex) => (
                <ProposalMealEditor
                  key={meal.reviewKey}
                  meal={meal}
                  disabled={busy}
                  onChange={(next) =>
                    setProposal({
                      ...proposal,
                      days: proposal.days.map((entry, index) =>
                        index === dayIndex
                          ? {
                              ...entry,
                              meals: entry.meals.map((current, index) =>
                                index === mealIndex ? next : current
                              ),
                            }
                          : entry
                      ),
                    })
                  }
                  onRemove={() =>
                    setProposal({
                      ...proposal,
                      days: proposal.days.map((entry, index) =>
                        index === dayIndex
                          ? {
                              ...entry,
                              meals: entry.meals.filter(
                                (_, index) => index !== mealIndex
                              ),
                            }
                          : entry
                      ),
                    })
                  }
                />
              ))}
              {!day.meals.length ? (
                <AppText color={colors.status.danger}>
                  {vi
                    ? 'Mỗi ngày cần ít nhất một món. Tạo đề xuất mới nếu cần.'
                    : 'Each day requires at least one meal. Generate a new proposal if needed.'}
                </AppText>
              ) : null}
            </View>
          ))}
          <AppText>{proposal.disclaimer}</AppText>
          <AppButton
            title={vi ? 'Xác nhận và lưu thực đơn' : 'Confirm and save plan'}
            loading={actions.confirm.isPending}
            disabled={!validProposal || busy}
            onPress={() =>
              actions.confirm.mutate(proposal, {
                onSuccess: (result) =>
                  router.replace({
                    pathname: '/(tabs)/meal-plan',
                    params: { planId: result.resource._id, date: startDate },
                  }),
              })
            }
          />
          <AppButton
            title={vi ? 'Bỏ đề xuất' : 'Discard proposal'}
            variant="outline"
            disabled={busy}
            onPress={() => {
              setProposal(null);
              actions.generate.reset();
              actions.confirm.reset();
            }}
          />
        </>
      )}
      <FeatureState error={actions.generate.error || actions.confirm.error} />
      {!proposal ? <SavedMealPlans /> : null}
    </ScreenWrapper>
  );
}
