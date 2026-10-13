import { StyleSheet, View } from 'react-native';

import { AppButton, AppIcon, AppText } from '@/components/ui';
import { CustomHeader, ScreenWrapper } from '@/components/layout';
import { colors, radius, spacing, type AssetName } from '@/theme';

export interface GuidedPlaceholderScreenProps {
  title: string;
  icon: AssetName;
  emptyTitle: string;
  description: string;
  guideTitle: string;
  steps: readonly string[];
  availabilityNote: string;
  actionLabel: string;
  onAction: () => void;
}

export function GuidedPlaceholderScreen({
  title,
  icon,
  emptyTitle,
  description,
  guideTitle,
  steps,
  availabilityNote,
  actionLabel,
  onAction,
}: GuidedPlaceholderScreenProps) {
  return (
    <ScreenWrapper
      edges={['top', 'left', 'right']}
      scrollable
      keyboardAvoiding={false}
      contentContainerStyle={styles.screen}
      header={<CustomHeader title={title} showBack={false} />}
    >
      <View style={styles.content}>
        <View style={styles.icon}>
          <AppIcon name={icon} size={40} color={colors.primary[700]} decorative />
        </View>
        <AppText variant="heading3" style={styles.centeredText}>
          {emptyTitle}
        </AppText>
        <AppText
          variant="bodyDefault"
          color={colors.text.secondary}
          style={styles.centeredText}
        >
          {description}
        </AppText>

        <View style={styles.guideCard}>
          <AppText variant="bodyStrong">{guideTitle}</AppText>
          {steps.map((step, index) => (
            <View key={`${index}-${step}`} style={styles.guideRow}>
              <View style={styles.stepBadge}>
                <AppText variant="caption" color={colors.text.inverse}>
                  {index + 1}
                </AppText>
              </View>
              <AppText style={styles.guideText} color={colors.text.secondary}>
                {step}
              </AppText>
            </View>
          ))}
        </View>

        <AppText
          variant="bodySmall"
          color={colors.text.secondary}
          style={styles.centeredText}
        >
          {availabilityNote}
        </AppText>
        <AppButton title={actionLabel} onPress={onAction} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  icon: {
    width: 72,
    height: 72,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.selected,
    marginBottom: spacing.sm,
  },
  centeredText: { textAlign: 'center' },
  guideCard: {
    gap: spacing.md,
    marginVertical: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    backgroundColor: colors.background.surface,
  },
  guideRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBadge: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
  guideText: { flex: 1 },
});
