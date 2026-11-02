import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { AppIcon, AppText } from '@/components';
import { colors, radius, spacing, type AssetName } from '@/theme';

export function AdminPageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.intro}>
      {eyebrow ? (
        <AppText variant="bodySmall" color={colors.primary[700]}>
          {eyebrow.toUpperCase()}
        </AppText>
      ) : null}
      <AppText variant="heading2">{title}</AppText>
      <AppText color={colors.text.secondary}>{description}</AppText>
    </View>
  );
}

export function AdminSectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <AppText variant="heading3">{title}</AppText>
        {description ? (
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {description}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function AdminMetricCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const accent =
    tone === 'success'
      ? colors.status.success
      : tone === 'warning'
        ? colors.status.warning
        : tone === 'danger'
          ? colors.status.danger
          : colors.primary[700];
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricAccent, { backgroundColor: accent }]} />
      <AppText variant="heading2">{String(value)}</AppText>
      <AppText variant="bodyStrong">{label}</AppText>
      {hint ? (
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

export function AdminActionCard({
  icon,
  title,
  description,
  onPress,
}: {
  icon: AssetName;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
    >
      <View style={styles.actionIcon}>
        <AppIcon name={icon} size={22} color={colors.primary[700]} decorative />
      </View>
      <View style={styles.actionText}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {description}
        </AppText>
      </View>
      <AppIcon
        name="back"
        size={18}
        color={colors.primary[700]}
        style={styles.chevron}
        decorative
      />
    </Pressable>
  );
}

export function AdminSegmentedTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string; count?: number }>;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmentTrack} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentSelected,
              pressed && styles.pressed,
            ]}
          >
            <AppText
              variant="bodyStrong"
              color={selected ? colors.text.inverse : colors.text.secondary}
              numberOfLines={2}
              style={styles.segmentLabel}
            >
              {option.label}
            </AppText>
            {option.count !== undefined ? (
              <View style={[styles.count, selected && styles.countSelected]}>
                <AppText
                  variant="bodySmall"
                  color={selected ? colors.primary[700] : colors.text.secondary}
                >
                  {option.count}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function AdminFilterChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string; count?: number }>;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.filters}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.filter,
              selected && styles.filterSelected,
              pressed && styles.pressed,
            ]}
          >
            <AppText
              variant="bodySmall"
              color={selected ? colors.primary[700] : colors.text.secondary}
            >
              {option.label}
              {option.count !== undefined ? `  ${option.count}` : ''}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AdminStatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const color =
    tone === 'success'
      ? colors.status.success
      : tone === 'warning'
        ? colors.status.warning
        : tone === 'danger'
          ? colors.status.danger
          : tone === 'info'
            ? colors.status.info
            : colors.text.secondary;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <AppText variant="bodySmall" color={color}>
        {label}
      </AppText>
    </View>
  );
}

export function AdminEmptyState({
  icon = 'search',
  title,
  description,
}: {
  icon?: AssetName;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <AppIcon name={icon} size={28} color={colors.primary[700]} decorative />
      </View>
      <AppText variant="heading4">{title}</AppText>
      <AppText color={colors.text.secondary} style={styles.emptyCopy}>
        {description}
      </AppText>
    </View>
  );
}

export function AdminSurface({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  intro: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.background.selected,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionHeaderText: { flex: 1, minWidth: 0, gap: spacing.xs },
  metricCard: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 136,
    padding: spacing.lg,
    gap: spacing.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  metricAccent: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 4 },
  actionCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  actionIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  actionText: { flex: 1, minWidth: 0, gap: spacing.xs },
  chevron: { transform: [{ rotate: '180deg' }] },
  pressed: { opacity: 0.68 },
  segmentTrack: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: spacing.xs,
    gap: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.background.muted,
  },
  segment: {
    minWidth: 0,
    minHeight: 58,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderRadius: radius.md,
  },
  segmentLabel: { textAlign: 'center' },
  segmentSelected: { backgroundColor: colors.primary[700] },
  count: {
    minWidth: 22,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  countSelected: { backgroundColor: colors.common.white },
  filters: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filter: {
    height: 40,
    minWidth: 96,
    flexGrow: 1,
    flexBasis: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  filterSelected: {
    borderColor: colors.primary[700],
    backgroundColor: colors.background.selected,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  badgeDot: { width: 7, height: 7, borderRadius: radius.full },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
  },
  emptyCopy: { textAlign: 'center' },
  surface: {
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
  },
});
