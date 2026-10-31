import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';

export function HomeSocialHeader({
  name,
  avatarUrl,
  onCreatePost,
  onSearch,
}: {
  name: string;
  avatarUrl?: string;
  onCreatePost: () => void;
  onSearch: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <AppText style={styles.brandMarkText}>v</AppText>
          </View>
          <AppText style={styles.brand}>veganly</AppText>
        </View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Create" onPress={onCreatePost} style={styles.action}>
            <AppIcon name="plus" size={23} color={colors.text.primary} decorative />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Search" onPress={onSearch} style={styles.action}>
            <AppIcon name="search" size={23} color={colors.text.primary} decorative />
          </Pressable>
          <View style={styles.messageBubble}>
            <AppText style={styles.messageText}>✦</AppText>
            <View style={styles.notificationDot}>
              <AppText style={styles.notificationText}>3</AppText>
            </View>
          </View>
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={onCreatePost} style={styles.composer}>
        {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarFallback]}><AppText style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</AppText></View>}
        <AppText color={colors.text.secondary} style={styles.composerText}>Bạn đang nghĩ gì?</AppText>
        <AppIcon name="image" size={24} color={colors.primary[700]} decorative />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingTop: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primary[700], alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: colors.common.white, fontSize: 24, fontWeight: '800', lineHeight: 27 },
  brand: { color: colors.primary[700], fontSize: 26, fontWeight: '800', letterSpacing: -1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  action: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.background.muted, alignItems: 'center', justifyContent: 'center' },
  messageBubble: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.text.primary, alignItems: 'center', justifyContent: 'center' },
  messageText: { color: colors.common.white, fontSize: 22, fontWeight: '800' },
  notificationDot: { position: 'absolute', top: -3, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#D92D45', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background.surface },
  notificationText: { color: colors.common.white, fontSize: 10, fontWeight: '800' },
  composer: { minHeight: 64, borderRadius: radius.xl, backgroundColor: colors.background.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.background.selected },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: colors.primary[700], fontSize: 18, fontWeight: '700' },
  composerText: { flex: 1, fontSize: 16 },
});
