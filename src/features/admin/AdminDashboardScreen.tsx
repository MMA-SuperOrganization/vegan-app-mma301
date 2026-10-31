import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { adminApi } from './adminApi';

export function AdminDashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const summary = useQuery({ queryKey: ['admin', 'summary'], queryFn: adminApi.summary });
  return (
    <ScreenWrapper scrollable contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }} header={<CustomHeader title={t('admin.title')} showBack={false} />}>
      <View style={styles.hero}><AppText variant="heading2">{t('admin.overview.title')}</AppText><AppText color={colors.text.secondary}>{t('admin.subtitle')}</AppText></View>
      <AppText variant="heading3">{t('admin.overview.quickActions')}</AppText>
      <AppButton title={t('admin.overview.moderation')} onPress={() => router.push('/admin/moderation')} />
      <AppButton title={t('admin.overview.aiMonitoring')} variant="outline" onPress={() => router.push('/ai/monitoring')} />
      <FeatureState loading={summary.isLoading} error={summary.error} retry={() => void summary.refetch()} />
      {summary.data ? <View style={styles.card}>
        <AppText variant="heading3">{t('admin.overview.users')}</AppText>
        <AppText>{t('admin.overview.users')}: {summary.data.users.total}</AppText>
        <AppText>{t('admin.overview.active')}: {summary.data.users.active}</AppText>
        <AppText>{t('admin.overview.suspended')}: {summary.data.users.suspended}</AppText>
        {Object.entries(summary.data.content).map(([type, value]) => <AppText key={type}>{type}: {value.pending} {t('admin.overview.pending')} · {value.hidden} {t('admin.overview.hidden')}</AppText>)}
      </View> : null}
    </ScreenWrapper>
  );
}
const styles = { hero: { padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.background.surface }, card: { padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.background.surface } } as const;
