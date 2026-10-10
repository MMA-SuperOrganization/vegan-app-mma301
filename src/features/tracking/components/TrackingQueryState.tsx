import { StyleSheet, View } from 'react-native';
import { AppButton, AppText, LoadingSpinner } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';

export function TrackingQueryState({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  if (!loading && !error) return null;
  return (
    <View style={styles.container}>
      {loading ? (
        <LoadingSpinner text={t('tracking.data.loading')} />
      ) : (
        <>
          <AppText color={colors.status.danger}>
            {t('tracking.data.loadError')}
          </AppText>
          <AppButton title={t('common.retry')} variant="outline" onPress={onRetry} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: spacing.xl, gap: spacing.md },
});
