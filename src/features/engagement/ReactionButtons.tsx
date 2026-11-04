import { Pressable, StyleSheet, View } from 'react-native';
import { AppIcon, AppText } from '@/components';
import { colors, radius, spacing, type AssetName } from '@/theme';
import type { ReactionType } from './engagementApi';

const reactionTypes: {
  type: ReactionType;
  icon: AssetName;
  vi: string;
  en: string;
}[] = [
  { type: 'like', icon: 'thumb-up', vi: 'Thích', en: 'Like' },
  { type: 'love', icon: 'heart', vi: 'Yêu', en: 'Love' },
  { type: 'helpful', icon: 'lightbulb', vi: 'Hữu ích', en: 'Helpful' },
];

/** One reaction per item: pressing the selected reaction removes it, another one replaces it. */
export function ReactionButtons({
  selected,
  disabled,
  vi,
  onPress,
}: {
  selected?: string | null;
  disabled: boolean;
  vi: boolean;
  onPress: (type: ReactionType, remove: boolean) => void;
}) {
  return (
    <View style={styles.reactions}>
      {reactionTypes.map(({ type, icon, ...label }) => {
        const active = selected === type;
        return (
          <Pressable
            key={type}
            accessibilityRole="button"
            accessibilityLabel={vi ? label.vi : label.en}
            accessibilityState={{ selected: active, disabled }}
            disabled={disabled}
            onPress={() => onPress(type, active)}
            style={({ pressed }) => [
              styles.reactionPill,
              active && styles.reactionPillSelected,
              pressed && styles.pressed,
              disabled && styles.disabled,
            ]}
          >
            <AppIcon name={icon} size={19} color={colors.primary[700]} decorative />
            <AppText
              variant="bodyStrong"
              color={colors.primary[700]}
              numberOfLines={1}
            >
              {vi ? label.vi : label.en}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  reactions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reactionPill: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
  },
  reactionPillSelected: {
    backgroundColor: colors.background.selected,
    borderWidth: 1,
    borderColor: colors.primary[300],
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.5,
  },
});
