import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

export function HomeSocialHeader({
  onCreatePost,
  onSearch,
}: {
  onCreatePost: () => void;
  onSearch: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <AppIcon name="mam-companion" size={30} decorative />
          </View>
          <AppText style={styles.brand}>Vegata</AppText>
        </View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.createPost')} onPress={onCreatePost} style={styles.action}>
            <AppIcon name="plus" size={23} color={colors.text.primary} decorative />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.search')} onPress={onSearch} style={styles.action}>
            <AppIcon name="search" size={23} color={colors.text.primary} decorative />
          </Pressable>
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={onCreatePost} style={styles.composer}>
        <AppText color={colors.text.secondary} style={styles.composerText}>{t('home.createPostPrompt')}</AppText>
        <AppIcon name="image" size={24} color={colors.primary[700]} decorative />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingTop: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  brand: { color: colors.primary[700], fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -1, flexShrink: 0 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  action: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.background.muted, alignItems: 'center', justifyContent: 'center' },
  composer: { minHeight: 64, borderRadius: radius.xl, backgroundColor: colors.background.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  composerText: { flex: 1, fontSize: 16 },
});
