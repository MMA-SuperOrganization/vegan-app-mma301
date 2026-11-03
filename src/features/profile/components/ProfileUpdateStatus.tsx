import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import type { User } from '@/features/auth/types/auth.types';

/** Account status and when the personal profile was last saved. */
export function ProfileUpdateStatus({
  status,
  updatedAt,
}: {
  status?: User['status'];
  updatedAt?: string;
}) {
  const { t, locale } = useTranslation();
  const date = updatedAt ? new Date(updatedAt) : null;
  const updated =
    date && !Number.isNaN(date.getTime())
      ? t('profile.lastUpdated', {
          date: date.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        })
      : t('profile.neverUpdated');
  const active = !status || status === 'active';
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.dot,
          { backgroundColor: active ? colors.status.success : colors.status.danger },
        ]}
      />
      <AppText variant="caption" color={colors.text.secondary} style={styles.text}>
        {`${t(active ? 'profile.statusActive' : 'profile.statusInactive')} · ${updated}`}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { flexShrink: 1 },
});
