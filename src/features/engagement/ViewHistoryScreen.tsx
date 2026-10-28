import { Alert, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useAuthStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { engagementApi, type ViewHistoryItem } from './engagementApi';

export function ViewHistoryScreen() {
  const vi = useTranslation().locale === 'vi';
  const router = useRouter();
  const client = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const key = ['account', userId, 'view-history'];
  const history = useQuery({ queryKey: key, queryFn: engagementApi.history });
  const refresh = () => client.invalidateQueries({ queryKey: key });
  const remove = useMutation({
    mutationFn: engagementApi.removeHistory,
    onSuccess: refresh,
  });
  const clear = useMutation({
    mutationFn: engagementApi.clearHistory,
    onSuccess: refresh,
  });
  const open = (item: ViewHistoryItem) => {
    if (item.targetType === 'recipe')
      router.push({
        pathname: '/(discover)/recipe/[id]',
        params: { id: item.targetId },
      });
    else if (item.targetType === 'video')
      router.push({ pathname: '/community/video', params: { id: item.targetId } });
    else router.push({ pathname: '/community/post', params: { id: item.targetId } });
  };
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Lịch sử đã xem' : 'View history'}
          showBack
          backFallbackHref="/(tabs)/profile"
        />
      }
    >
      <AppButton
        title={vi ? 'Xóa toàn bộ lịch sử' : 'Clear history'}
        variant="outline"
        disabled={!history.data?.data.length || clear.isPending}
        onPress={() =>
          Alert.alert(
            vi ? 'Xóa lịch sử?' : 'Clear history?',
            vi ? 'Thao tác này không thể hoàn tác.' : 'This cannot be undone.',
            [
              { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
              {
                text: vi ? 'Xóa' : 'Clear',
                style: 'destructive',
                onPress: () => clear.mutate(),
              },
            ]
          )
        }
      />
      <FeatureState
        loading={history.isLoading}
        error={history.error || remove.error || clear.error}
        retry={() => void history.refetch()}
      />
      {history.data?.data.map((item) => (
        <View
          key={item._id}
          style={{
            padding: spacing.lg,
            gap: spacing.sm,
            borderRadius: radius.lg,
            backgroundColor: colors.background.surface,
          }}
        >
          <AppText variant="heading4">
            {item.target?.title ||
              item.target?.name ||
              (vi ? 'Nội dung không còn khả dụng' : 'Content unavailable')}
          </AppText>
          <AppText>{new Date(item.lastViewedAt).toLocaleString()}</AppText>
          {!item.unavailable ? (
            <AppButton
              title={vi ? 'Mở' : 'Open'}
              variant="outline"
              onPress={() => open(item)}
            />
          ) : null}
          <AppButton
            title={vi ? 'Xóa khỏi lịch sử' : 'Remove'}
            variant="ghost"
            disabled={remove.isPending}
            onPress={() => remove.mutate(item)}
          />
        </View>
      ))}
    </ScreenWrapper>
  );
}
