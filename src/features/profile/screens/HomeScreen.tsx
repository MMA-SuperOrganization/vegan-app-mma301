import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, ScreenWrapper } from '@/components';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function HomeScreen() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.data);
  const firstName = profile?.user.name.trim().split(/\s+/).at(-1) || 'bạn';

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.screen}
    >
      <View style={styles.hero}>
        <AppText variant="heading1">Xin chào, {firstName} 👋</AppText>
        <AppText variant="bodyLarge" color={colors.text.secondary}>
          Hôm nay bạn muốn ăn gì?
        </AppText>
      </View>

      <View>
        <AppText variant="heading3" style={styles.sectionTitle}>Khám phá</AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Sắp ra mắt', 'Tìm kiếm công thức đang được hoàn thiện.')}
          style={({ pressed }) => [styles.search, pressed && styles.pressed]}
        >
          <AppText color={colors.text.secondary}>Tìm công thức, bài viết, video…</AppText>
          <AppText color={colors.primary[700]}>⌕</AppText>
        </Pressable>
      </View>

      <View style={styles.featured}>
        <AppText variant="overline" color={colors.text.inverse}>GỢI Ý HÔM NAY</AppText>
        <AppText variant="heading1" color={colors.text.inverse}>Bữa ăn xanh của bạn</AppText>
        <AppText color={colors.text.inverse}>
          Gợi ý sẽ được cá nhân hóa theo {profile?.profile?.dietType ? 'chế độ ăn đã chọn' : 'hồ sơ của bạn'}.
        </AppText>
      </View>

      <View>
        <AppText variant="heading2" style={styles.sectionTitle}>Bắt đầu nhanh</AppText>
        <View style={styles.cards}>
          <QuickCard title="Thực đơn" subtitle="Lên kế hoạch bữa ăn" onPress={() => router.push('/(tabs)/meal-plan')} />
          <QuickCard title="Mua sắm" subtitle="Chuẩn bị danh sách" onPress={() => router.push('/(tabs)/grocery')} />
          <QuickCard title="Hồ sơ của bạn" subtitle="Xem dữ liệu dinh dưỡng" onPress={() => router.push('/(tabs)/profile')} />
        </View>
      </View>
    </ScreenWrapper>
  );
}

function QuickCard({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <AppText variant="heading3">{title}</AppText>
      <AppText color={colors.text.secondary}>{subtitle}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing['3xl'] },
  hero: { gap: spacing.xs, paddingTop: spacing.md },
  sectionTitle: { marginBottom: spacing.md },
  search: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featured: {
    minHeight: 190,
    borderRadius: radius.xl,
    backgroundColor: colors.primary[700],
    padding: spacing.xl,
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cards: { gap: spacing.md },
  card: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.72 },
});
