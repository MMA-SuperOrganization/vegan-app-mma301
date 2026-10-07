import { Image, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppText, ScreenWrapper } from '@/components';
import { useAuthStore } from '@/features/auth';
import { dietOptions, goalOptions, optionLabel } from '@/features/onboarding/constants';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function ProfileScreen() {
  const router = useRouter();
  const data = useProfileStore((state) => state.data);
  const resetProfile = useProfileStore((state) => state.reset);
  const logout = useAuthStore((state) => state.logout);
  const isLoggingOut = useAuthStore((state) => state.isLoading);
  if (!data) return null;

  const nutrition = data.nutritionProfile;
  const allergyNames = nutrition?.allergenIds.map(
    (id) => data.allergens.find((item) => item._id === id)?.name ?? id
  );

  const signOut = async () => {
    await logout();
    resetProfile();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenWrapper scrollable keyboardAvoiding={false} edges={['top', 'left', 'right']} contentContainerStyle={styles.screen}>
      <View>
        <AppText variant="heading1">Hồ sơ</AppText>
        <AppText variant="bodyLarge" color={colors.text.secondary}>Quản lý hành trình ăn chay</AppText>
      </View>

      <View style={styles.identity}>
        {data.user.avatarUrl ? (
          <Image source={{ uri: data.user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.fallback]}>
            <AppText variant="heading1" color={colors.primary[700]}>{data.user.name.charAt(0).toUpperCase()}</AppText>
          </View>
        )}
        <View style={styles.identityText}>
          <AppText variant="heading2">{data.user.name}</AppText>
          <AppText color={colors.primary[700]}>{data.user.email || 'Chưa có email'}</AppText>
          <AppText variant="overline" color={colors.primary[700]}>
            {data.profile?.dietType ? optionLabel(dietOptions, data.profile.dietType) : 'CHƯA CHỌN CHẾ ĐỘ ĂN'}
          </AppText>
        </View>
      </View>

      <ProfileSection title="Hồ sơ dinh dưỡng">
        <Value label="Chiều cao" value={nutrition?.heightCm != null ? `${nutrition.heightCm} cm` : 'Chưa có dữ liệu'} />
        <Value label="Cân nặng" value={nutrition?.currentWeightKg != null ? `${nutrition.currentWeightKg} kg` : 'Chưa có dữ liệu'} />
        <Value label="BMI" value={nutrition?.bmi != null ? String(nutrition.bmi) : 'Chưa có dữ liệu'} />
        <Value label="Mục tiêu" value={nutrition?.goal ? optionLabel(goalOptions, nutrition.goal) : 'Chưa có dữ liệu'} />
      </ProfileSection>

      <ProfileSection title="Dị nguyên của tôi">
        <AppText color={colors.primary[700]}>
          {!nutrition?.allergenSelectionCompleted
            ? 'Chưa chọn'
            : allergyNames?.length
              ? allergyNames.join(', ')
              : 'Không có dị nguyên'}
        </AppText>
      </ProfileSection>

      <AppButton title="Chỉnh sửa hồ sơ" variant="outline" onPress={() => router.push('/edit-profile')} />
      <AppButton title="Đăng xuất" variant="danger" loading={isLoggingOut} onPress={() => void signOut()} />
    </ScreenWrapper>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><AppText variant="heading3">{title}</AppText>{children}</View>;
}

function Value({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><AppText color={colors.text.secondary}>{label}</AppText><AppText variant="bodyStrong" style={styles.value}>{value}</AppText></View>;
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.xl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.xl, borderRadius: radius.xl, backgroundColor: colors.background.selected },
  identityText: { flex: 1, gap: spacing.xs },
  avatar: { width: 76, height: 76, borderRadius: 38 },
  fallback: { backgroundColor: colors.background.surface, alignItems: 'center', justifyContent: 'center' },
  section: { backgroundColor: colors.background.surface, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
  value: { flex: 1, textAlign: 'right' },
});
