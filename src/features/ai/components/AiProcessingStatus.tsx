import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import {
  AI_PROGRESS_STAGE_LABEL_KEYS,
  AI_PROGRESS_STAGES,
  AI_TRANSLATION_KEYS,
} from '../aiConstants';
import { getAiProgressStage } from '../aiProgress';

export function AiProcessingStatus() {
  const { t } = useTranslation();
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt), 1_000);
    return () => clearInterval(timer);
  }, []);

  const stage = getAiProgressStage(elapsedMs);
  const stageLabel = t(AI_PROGRESS_STAGE_LABEL_KEYS[stage]);
  const secondsUnit = t(AI_TRANSLATION_KEYS.PROCESSING.SECONDS_UNIT);
  const activeIndex = AI_PROGRESS_STAGES.indexOf(stage);
  const seconds = Math.floor(elapsedMs / 1_000);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={stageLabel}
      accessibilityValue={{ text: stageLabel }}
      style={styles.container}
    >
      <View style={styles.spinnerBadge}>
        <ActivityIndicator size="small" color={colors.primary[700]} />
      </View>
      <View style={styles.copy}>
        <View style={styles.topRow}>
          <AppIcon name="spark" size={14} color={colors.primary[700]} decorative />
          <AppText
            variant="bodyStrong"
            color={colors.primary[800]}
            style={styles.stageText}
          >
            {stageLabel}
          </AppText>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.steps}>
            {AI_PROGRESS_STAGES.map((item, idx) => (
              <View
                key={item}
                style={[
                  styles.stepDot,
                  idx <= activeIndex && styles.stepDotActive,
                ]}
              />
            ))}
          </View>
          <AppText variant="caption" color={colors.text.secondary}>
            {seconds} {secondsUnit}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderBottomLeftRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary[300],
    backgroundColor: colors.background.surface,
  },
  spinnerBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
  },
  copy: { flex: 1, gap: spacing.xs },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stageText: { flex: 1 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stepDot: {
    width: 14,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border.default,
  },
  stepDotActive: {
    backgroundColor: colors.primary[600],
  },
});
