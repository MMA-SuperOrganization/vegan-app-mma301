import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppIcon, AppText, ScreenWrapper } from '@/components';
import { getDietOptions, optionLabel } from '@/features/onboarding/constants';
import { useUnreadNotificationCount } from '@/features/settings';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';
import { useProfileStore } from '../profileStore';

export function ProfileScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const vi = locale === 'vi';
  const dietOptions = getDietOptions(t);
  const data = useProfileStore((state) => state.data);
  const unread = useUnreadNotificationCount();
  if (!data) return null;

  const nutrition = data.nutritionProfile;
  const unreadCount = unread.data?.count ?? 0;
  const dietLabel = data.profile?.dietType
    ? optionLabel(dietOptions, data.profile.dietType)
    : t('profile.noDiet');

  return (
    <ScreenWrapper
      scrollable
      keyboardAvoiding={false}
      edges={['top', 'left', 'right']}
      contentContainerStyle={styles.screen}
    >
      <AppText variant="heading1">{t('profile.title')}</AppText>

      <View style={styles.identity}>
        <View style={styles.identityMain}>
          {data.user.avatarUrl ? (
            <Image source={{ uri: data.user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.fallback]}>
              <AppText variant="heading1" color={colors.primary[700]}>
                {data.user.name.charAt(0).toUpperCase()}
              </AppText>
            </View>
          )}
          <View style={styles.identityText}>
            <AppText variant="heading3" numberOfLines={2}>
              {data.user.name}
            </AppText>
            <AppText
              variant="bodySmall"
              color={colors.text.secondary}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {data.user.email || t('profile.noEmail')}
            </AppText>
          </View>
        </View>
        <View style={styles.identityActions}>
          <View style={styles.dietBadge}>
            <AppText variant="bodySmall" color={colors.primary[700]}>
              {dietLabel}
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('profile.edit')}
            onPress={() => router.push('/edit-profile')}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
          >
            <AppText variant="bodySmall" color={colors.primary[700]}>
              {t('profile.edit')}
            </AppText>
            <AppIcon
              name="back"
              size={16}
              color={colors.primary[700]}
              style={styles.editChevron}
              decorative
            />
          </Pressable>
        </View>
      </View>

      <MenuSection title={t('pantry.title')}>
        <MenuItem
          title={vi ? 'Kho nâng cao' : 'Advanced pantry'}
          subtitle={
            vi
              ? 'Thêm hàng loạt, hạn dùng và gợi ý món từ kho'
              : 'Bulk add, expiry and recipe matching'
          }
          onPress={() => router.push('/pantry/advanced')}
        />
        <MenuItem
          title={t('pantry.open')}
          subtitle={t('pantry.subtitle')}
          onPress={() => router.push('/pantry')}
        />
        <MenuItem
          title={t('pantry.add')}
          subtitle={t('pantry.addDescription')}
          onPress={() => router.push('/pantry/item')}
        />
      </MenuSection>

      <MenuSection title={vi ? 'Trợ lý và cộng đồng' : 'Assistant and community'}>
        <MenuItem
          title={vi ? 'Trò chuyện với AI' : 'AI chat'}
          subtitle={
            vi ? 'Trao đổi về chế độ ăn và nấu nướng' : 'Discuss food and cooking'
          }
          onPress={() => router.push('/ai')}
        />
        <MenuItem
          title={vi ? 'AI lên thực đơn' : 'AI meal planner'}
          subtitle={
            vi
              ? 'Xem và sửa đề xuất trước khi lưu'
              : 'Review and edit proposals before saving'
          }
          onPress={() => router.push('/ai/meal-planner')}
        />
        <MenuItem
          title={vi ? 'Nhận diện nguyên liệu' : 'Ingredient recognition'}
          subtitle={
            vi
              ? 'Chụp ảnh, kiểm tra và thêm vào kho'
              : 'Take a photo, review and add to pantry'
          }
          onPress={() => router.push('/ai/ingredients')}
        />
        <MenuItem
          title={vi ? 'Tóm tắt video bằng AI' : 'AI video summary'}
          subtitle={
            vi ? 'Tạo tóm tắt từ bản lời thoại' : 'Summarize a video transcript'
          }
          onPress={() => router.push('/ai/video-summary')}
        />
        <MenuItem
          title={vi ? 'Công thức của tôi' : 'My recipes'}
          subtitle={
            vi
              ? 'Tạo, chỉnh sửa và gửi duyệt công thức'
              : 'Create, edit and submit recipes'
          }
          onPress={() => router.push('/recipes')}
        />
        <MenuItem
          title={vi ? 'Chia sẻ theo công thức' : 'Recipe experiences'}
          subtitle={
            vi
              ? 'Đọc và chia sẻ kinh nghiệm gắn với từng món'
              : 'Read and share experiences tied to each dish'
          }
          onPress={() => router.push('/community')}
        />
        <MenuItem
          title={vi ? 'Báo cáo của tôi' : 'My reports'}
          subtitle={
            vi ? 'Theo dõi kết quả xử lý báo cáo' : 'Track report resolutions'
          }
          onPress={() => router.push('/community/report')}
        />
        <MenuItem
          title={vi ? 'Nhắc lịch' : 'Reminders'}
          subtitle={
            vi
              ? 'Lịch ăn, uống nước và nhắc việc riêng'
              : 'Meals, water and custom schedules'
          }
          onPress={() => router.push('/reminders')}
        />
      </MenuSection>
      <MenuSection title={t('profile.healthSection')}>
        <MenuItem
          title={t('profile.nutrition')}
          subtitle={
            nutrition?.bmi != null
              ? `BMI ${nutrition.bmi}`
              : t('profile.nutritionSubtitle')
          }
          onPress={() => router.push('/nutrition-profile')}
        />
        <MenuItem
          title={t('profile.dietaryTitle')}
          subtitle={t('profile.dietarySubtitle')}
          onPress={() => router.push('/dietary-preferences')}
        />
        <MenuItem
          title={t('profile.allergens')}
          subtitle={
            nutrition?.allergenSelectionCompleted
              ? t('profile.allergensConfigured', {
                  count: nutrition.allergenIds.length,
                })
              : t('profile.notSelected')
          }
          onPress={() => router.push('/allergies-settings')}
        />
      </MenuSection>
      <MenuSection title={t('profile.contentSection')}>
        <MenuItem
          title={vi ? 'Lịch sử đã xem' : 'View history'}
          subtitle={
            vi ? 'Xem lại nội dung gần đây' : 'Revisit recently viewed content'
          }
          onPress={() => router.push('/view-history')}
        />
        <MenuItem
          title={t('profile.saved')}
          subtitle={t('profile.savedSubtitle')}
          onPress={() => router.push('/(discover)/saved')}
        />
        <MenuItem
          title={t('notifications.title')}
          subtitle={
            unreadCount
              ? t('notifications.unreadCount', { count: unreadCount })
              : t('notifications.emptyShort')
          }
          onPress={() => router.push('/notifications')}
        />
        <MenuItem
          title={t('notifications.settingsTitle')}
          subtitle={t('profile.notificationSettingsSubtitle')}
          onPress={() => router.push('/notification-settings')}
        />
      </MenuSection>
      <MenuSection title={t('profile.settingsSection')}>
        <MenuItem
          title={vi ? 'Lịch sử trò chuyện AI' : 'AI chat history'}
          subtitle={
            vi
              ? 'Xem lại và tiếp tục các cuộc trò chuyện'
              : 'Review and continue previous conversations'
          }
          onPress={() => router.push('/ai/history')}
        />
        {data.user.role === 'admin' ? (
          <>
            <MenuItem
              title={vi ? 'Quản trị hệ thống' : 'Administration'}
              subtitle={
                vi
                  ? 'Thống kê, tài khoản và audit log'
                  : 'Metrics, accounts, and audit logs'
              }
              onPress={() => router.push('/admin')}
            />
            <MenuItem
              title={vi ? 'Kiểm duyệt' : 'Moderation'}
              subtitle={
                vi
                  ? 'Duyệt nội dung, báo cáo và hồ sơ xử lý'
                  : 'Review content, reports and moderation cases'
              }
              onPress={() => router.push('/moderation')}
            />
            <MenuItem
              title={vi ? 'Giám sát AI' : 'AI monitoring'}
              subtitle={
                vi
                  ? 'Theo dõi lỗi, độ trễ và phản hồi'
                  : 'Review failures, latency, and feedback'
              }
              onPress={() => router.push('/ai/monitoring')}
            />
          </>
        ) : null}
        <MenuItem
          title={t('profile.language')}
          subtitle={t('profile.languageSubtitle')}
          onPress={() => router.push('/language')}
        />
        <MenuItem
          title={t('profile.securityTitle')}
          subtitle={t('profile.securitySubtitle')}
          onPress={() => router.push('/account-security')}
        />
      </MenuSection>
    </ScreenWrapper>
  );
}

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group}>
      <AppText variant="heading4">{title}</AppText>
      <View style={styles.section}>{children}</View>
    </View>
  );
}

function MenuItem({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.menuText}>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {subtitle}
        </AppText>
      </View>
      <AppText color={colors.primary[700]}>›</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.xl },
  identity: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.background.selected,
  },
  identityMain: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  identityText: { flex: 1, minWidth: 0, gap: spacing.xs },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: colors.background.surface,
  },
  fallback: {
    backgroundColor: colors.background.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dietBadge: {
    flexShrink: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  editButton: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderRadius: radius.full,
    backgroundColor: colors.background.surface,
  },
  editButtonPressed: { opacity: 0.72 },
  editChevron: { transform: [{ rotate: '180deg' }] },
  group: { gap: spacing.sm },
  section: {
    backgroundColor: colors.background.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
  },
  menuText: { flex: 1, gap: spacing.xs },
  pressed: { backgroundColor: colors.background.selected },
});
