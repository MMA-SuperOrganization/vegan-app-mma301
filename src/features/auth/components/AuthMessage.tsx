import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';
import type { AppErrorDetails } from '@/services/errors';
import { useTranslation } from '@/i18n';

export function AuthMessage({
  message,
  error,
  success = false,
}: {
  message?: string;
  error?: AppErrorDetails;
  success?: boolean;
}) {
  const { t } = useTranslation();
  const visibleMessage = error?.message ?? message;
  if (!visibleMessage) return null;

  return (
    <View style={[styles.container, success ? styles.success : styles.error]}>
      <AppText
        variant="bodySmall"
        color={success ? colors.status.success : colors.status.danger}
        style={styles.text}
      >
        {visibleMessage}
      </AppText>
      {error ? (
        <AppText variant="caption" color={colors.status.danger} style={styles.code}>
          {t('common.errorCode', { code: error.code })}
          {error.status ? ` · HTTP ${error.status}` : ''}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  error: {
    borderColor: colors.status.danger,
    backgroundColor: colors.background.surface,
  },
  success: {
    borderColor: colors.status.success,
    backgroundColor: colors.background.selected,
  },
  text: { textAlign: 'center' },
  code: { textAlign: 'center', marginTop: spacing.xs },
});
