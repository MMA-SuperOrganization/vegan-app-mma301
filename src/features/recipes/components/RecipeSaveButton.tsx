import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppButton, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, shadows, spacing } from '@/theme';
import { useRecipeSavedState, useSavedMutation } from '../hooks';
import type { ContentCardData } from '../types';

type RecipeSaveButtonProps = {
  recipe: ContentCardData;
  initialSaved?: boolean;
  compact?: boolean;
};

function HeartIcon({ saved }: { saved: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        fill={saved ? colors.primary[700] : colors.common.transparent}
        stroke={colors.primary[700]}
        strokeWidth={saved ? 1.5 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function RecipeSaveButton({
  recipe,
  initialSaved,
  compact = false,
}: RecipeSaveButtonProps) {
  const { t } = useTranslation();
  const savedState = useRecipeSavedState(recipe._id);
  const mutation = useSavedMutation();
  const saved = savedState.isSuccess ? savedState.isSaved : Boolean(initialSaved);
  const unavailable = !savedState.isSuccess && initialSaved === undefined;

  const toggle = (event?: GestureResponderEvent) => {
    event?.stopPropagation();
    if (mutation.isPending || unavailable) return;
    mutation.mutate({ type: 'recipe', id: recipe._id, saved, target: recipe });
  };

  if (compact) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? t('recipe.unsave') : t('recipe.save')}
        accessibilityState={{
          disabled: mutation.isPending || unavailable,
          selected: saved,
        }}
        disabled={mutation.isPending || unavailable}
        onPress={toggle}
        hitSlop={8}
        style={({ pressed }) => [
          styles.compact,
          saved && styles.compactSaved,
          unavailable && styles.compactDisabled,
          pressed && styles.pressed,
        ]}
      >
        {mutation.isPending ? (
          <ActivityIndicator size="small" color={colors.primary[700]} />
        ) : (
          <HeartIcon saved={saved} />
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.full}>
      <AppButton
        title={saved ? t('recipe.unsave') : t('recipe.save')}
        variant="outline"
        loading={mutation.isPending}
        disabled={unavailable}
        onPress={() => toggle()}
      />
      {mutation.error ? (
        <AppText variant="caption" color={colors.status.danger}>
          {mutation.error.message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  full: { gap: spacing.sm },
  compact: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  compactSaved: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[100],
  },
  compactDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.94 }] },
});
