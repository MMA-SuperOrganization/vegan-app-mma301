import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { adminApi } from './adminApi';
export function AdminAuditScreen() { const { t } = useTranslation(); const logs = useQuery({ queryKey: ['admin', 'audit'], queryFn: adminApi.auditLogs }); return <ScreenWrapper scrollable contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }} header={<CustomHeader title={t('admin.audit.title')} showBack={false} />}><FeatureState loading={logs.isLoading} error={logs.error} retry={() => void logs.refetch()} />{logs.data?.data.map((log) => <View key={log._id} style={styles.card}><AppText variant="bodyStrong">{log.action}</AppText><AppText>{t('admin.audit.target')}: {log.targetType || '-'} · {log.targetId || '-'}</AppText><AppText color={colors.text.secondary}>{new Date(log.createdAt).toLocaleString()}</AppText></View>)}</ScreenWrapper>; }
const styles = { card: { padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.background.surface } } as const;
