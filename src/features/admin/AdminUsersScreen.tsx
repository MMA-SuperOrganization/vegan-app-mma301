import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppButton, AppInput, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { adminApi, type AdminUser } from './adminApi';

export function AdminUsersScreen() {
  const { t } = useTranslation(); const client = useQueryClient();
  const [text, setText] = useState(''); const [search, setSearch] = useState(''); const [selected, setSelected] = useState<string | null>(null);
  const users = useQuery({ queryKey: ['admin', 'users', search], queryFn: () => adminApi.users(search) });
  const detail = useQuery({ queryKey: ['admin', 'user', selected], queryFn: () => adminApi.userDetail(selected!), enabled: Boolean(selected) });
  const status = useMutation({ mutationFn: adminApi.setStatus, onSuccess: () => client.invalidateQueries({ queryKey: ['admin'] }) });
  const role = useMutation({ mutationFn: adminApi.changeRole, onSuccess: () => client.invalidateQueries({ queryKey: ['admin'] }) });
  const changeStatus = (user: AdminUser) => Alert.alert(user.status === 'suspended' ? t('admin.users.activateTitle') : t('admin.users.suspendTitle'), user.displayName || user.name || user.email, [{ text: t('admin.users.cancel'), style: 'cancel' }, { text: t('admin.users.confirm'), style: user.status === 'suspended' ? 'default' : 'destructive', onPress: () => status.mutate(user) }]);
  return <ScreenWrapper scrollable contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }} header={<CustomHeader title={t('admin.users.title')} showBack={false} />}>
    <AppInput label={t('admin.users.search')} value={text} onChangeText={setText} /><AppButton title={t('admin.users.searchButton')} variant="outline" onPress={() => setSearch(text.trim())} />
    <FeatureState loading={users.isLoading} error={users.error || status.error || role.error} retry={() => void users.refetch()} />
    {users.data?.data.map((user) => <View key={user._id} style={styles.card}><AppText variant="heading4">{user.displayName || user.name || user.email || user._id}</AppText><AppText>{user.email}</AppText><AppText>{user.role} · {user.status}</AppText>{user.status !== 'deleted' ? <><AppButton title={user.status === 'suspended' ? t('admin.users.activate') : t('admin.users.suspend')} variant="outline" loading={status.isPending} disabled={status.isPending || role.isPending} onPress={() => changeStatus(user)} /><AppButton title={user.role === 'admin' ? t('admin.users.makeUser') : t('admin.users.makeAdmin')} variant="outline" disabled={status.isPending || role.isPending} onPress={() => role.mutate(user)} /><AppButton title={t('admin.users.details')} variant="ghost" onPress={() => setSelected(user._id)} /></> : <AppText color={colors.text.secondary}>{t('admin.users.deleted')}</AppText>}</View>)}
    {selected ? <View style={styles.card}><AppText variant="heading3">{t('admin.users.detailTitle')}</AppText><FeatureState loading={detail.isLoading} error={detail.error} />{detail.data ? <AppText selectable>{JSON.stringify(detail.data, null, 2)}</AppText> : null}<AppButton title={t('common.close')} variant="ghost" onPress={() => setSelected(null)} /></View> : null}
  </ScreenWrapper>;
}
const styles = { card: { padding: spacing.lg, gap: spacing.sm, borderRadius: radius.lg, backgroundColor: colors.background.surface } } as const;
