import { StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { AI_TRANSLATION_KEYS, AiSafetyNoticeCode } from '../aiConstants';
import type { AiSafetyNotice } from '../types';

export function AiSafetyNotices({
  notices,
}: {
  notices?: AiSafetyNotice[];
}) {
  const { t } = useTranslation();
  const keys = AI_TRANSLATION_KEYS.SAFETY;

  if (!notices?.length) return null;

  return (
    <View style={styles.list}>
      {notices.map((notice) => (
        <View key={notice.code} accessibilityRole="alert" style={styles.notice}>
          <View style={styles.noticeHeader}>
            <View style={styles.warningBadge}>
              <AppText variant="caption" color={colors.status.warning}>
                !
              </AppText>
            </View>
            <AppText variant="bodyStrong" color={colors.status.warning}>
              {t(keys.ALLERGEN_CAUTION_TITLE)}
            </AppText>
          </View>
          <AppText variant="bodySmall" color={colors.text.secondary}>
            {notice.code === AiSafetyNoticeCode.ALLERGEN_CAUTION
              ? t(keys.ALLERGEN_CAUTION_MESSAGE)
              : notice.message}
          </AppText>
        </View>
      ))}
    </View>
  );
}

export function AiMedicalDisclaimer({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const keys = AI_TRANSLATION_KEYS.SAFETY;

  if (compact) {
    return (
      <View accessibilityRole="alert" style={styles.medicalCompact}>
        <AppIcon name="spark" size={13} color={colors.text.secondary} decorative />
        <AppText
          variant="caption"
          color={colors.text.secondary}
          style={styles.medicalCompactText}
        >
          {t(keys.MEDICAL_DISCLAIMER_COMPACT)}
        </AppText>
      </View>
    );
  }

  return (
    <View accessibilityRole="alert" style={styles.medical}>
      <View style={styles.medicalHeader}>
        <AppIcon name="spark" size={16} color={colors.primary[700]} decorative />
        <AppText variant="bodyStrong" color={colors.primary[800]}>
          {t(keys.MEDICAL_DISCLAIMER_TITLE)}
        </AppText>
      </View>
      <AppText variant="bodySmall" color={colors.text.secondary}>
        {t(keys.MEDICAL_DISCLAIMER_BODY)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.xs, marginTop: spacing.xs },
  notice: {
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.warning,
    borderRadius: radius.md,
    backgroundColor: colors.background.surface,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  warningBadge: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.soft,
  },
  medical: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
  },
  medicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  medicalCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  medicalCompactText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
});
