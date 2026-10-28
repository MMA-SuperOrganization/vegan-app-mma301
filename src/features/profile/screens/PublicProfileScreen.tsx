import { Image, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { profileApi } from '../profileApi';

export function PublicProfileScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const vi = useTranslation().locale === 'vi';
  const profile = useQuery({
    queryKey: ['public-profile', id],
    queryFn: () => profileApi.publicProfile(id),
    enabled: Boolean(id),
  });
  return (
    <ScreenWrapper
      scrollable
      header={
        <CustomHeader
          title={vi ? 'Hồ sơ tác giả' : 'Author profile'}
          showBack
          backFallbackHref="/community"
        />
      }
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
    >
      <FeatureState
        loading={profile.isLoading}
        error={profile.error}
        retry={() => void profile.refetch()}
      />
      {profile.data ? (
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          {profile.data.avatarUrl ? (
            <Image
              source={{ uri: profile.data.avatarUrl }}
              style={{ width: 112, height: 112, borderRadius: 56 }}
              accessibilityLabel={profile.data.displayName || profile.data.username}
            />
          ) : null}
          <AppText variant="heading1">
            {profile.data.displayName ||
              profile.data.username ||
              (vi ? 'Người dùng' : 'User')}
          </AppText>
          {profile.data.username ? (
            <AppText>@{profile.data.username}</AppText>
          ) : null}
          {profile.data.bio ? (
            <AppText selectable>{profile.data.bio}</AppText>
          ) : null}
          {profile.data.dietType ? (
            <AppText color={colors.text.secondary}>{profile.data.dietType}</AppText>
          ) : null}
          {profile.data.preferredCuisines?.length ? (
            <AppText color={colors.text.secondary}>
              {profile.data.preferredCuisines.join(' · ')}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </ScreenWrapper>
  );
}
