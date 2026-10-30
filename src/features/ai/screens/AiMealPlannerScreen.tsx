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
import { useTranslation } from '@/i18n';
import { spacing, colors } from '@/theme';
import { AI_ROUTES, AI_TRANSLATION_KEYS } from '../aiConstants';
import { ProposalMealEditor } from '../components/ProposalMealEditor';
import { SavedMealPlans } from '../components/SavedMealPlans';
import { useMealProposal } from '../hooks';
import { reviewMealProposal } from '../proposalState';
import type { MealProposal } from '../types';

export function AiMealPlannerScreen() {
  const { t } = useTranslation();
  const keys = AI_TRANSLATION_KEYS.MEAL_PLANNER;
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
          title={t(keys.TITLE)}
          showBack
          backFallbackHref={AI_ROUTES.BACK_FALLBACK}
        />
      }
    >
      <AppText color={colors.text.secondary}>{t(keys.DESCRIPTION)}</AppText>
      <AppInput
        label={t(keys.START_DATE_LABEL)}
        value={startDate}
        onChangeText={setStartDate}
        editable={!busy && !proposal}
      />
      <AppText>{t(keys.MONDAY_HINT)}</AppText>
      <AppInput
        label={t(keys.DAYS_LABEL)}
        value={days}
        onChangeText={setDays}
        keyboardType="number-pad"
        editable={!busy && !proposal}
      />
      <AppInput
        label={t(keys.PREFERENCES_LABEL)}
        value={preferences}
        onChangeText={setPreferences}
        multiline
        maxLength={2000}
        editable={!busy}
      />
      <Toggle
        label={t(keys.USE_PROFILE_LABEL)}
        value={useProfile}
        onValueChange={setUseProfile}
        disabled={busy}
      />
      {!proposal ? (
        <AppButton
          title={t(keys.GENERATE_ACTION)}
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
            label={t(keys.PLAN_TITLE_LABEL)}
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
                  {t(keys.EMPTY_DAY_ERROR)}
                </AppText>
              ) : null}
            </View>
          ))}
          <AppText>{proposal.disclaimer}</AppText>
          <AppButton
            title={t(keys.CONFIRM_ACTION)}
            loading={actions.confirm.isPending}
            disabled={!validProposal || busy}
            onPress={() =>
              actions.confirm.mutate(proposal, {
                onSuccess: (result) =>
                  router.replace({
                    pathname: AI_ROUTES.MEAL_PLAN_TAB,
                    params: { planId: result.resource._id, date: startDate },
                  }),
              })
            }
          />
          <AppButton
            title={t(keys.DISCARD_ACTION)}
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
