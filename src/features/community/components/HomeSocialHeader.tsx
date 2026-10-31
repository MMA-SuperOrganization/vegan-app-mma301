import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppIcon, AppText, BrandWordmark } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

export function HomeSocialHeader({
  onCreatePost,
  searchExpanded,
  searchQuery,
  onOpenSearch,
  onCloseSearch,
  onChangeSearch,
  onSubmitSearch,
}: {
  onCreatePost: () => void;
  searchExpanded: boolean;
  searchQuery: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeSearch: (query: string) => void;
  onSubmitSearch: () => void;
}) {
  const { t } = useTranslation();
  const window = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const expansion = useRef(new Animated.Value(searchExpanded ? 1 : 0)).current;
  const openSearchWidth = Math.max(
    220,
    window.width - spacing.md * 2 - 40 - spacing.xs
  );

  useEffect(() => {
    Animated.timing(expansion, {
      toValue: searchExpanded ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && searchExpanded) inputRef.current?.focus();
    });
  }, [expansion, searchExpanded]);

  const closeSearch = () => {
    Keyboard.dismiss();
    onCloseSearch();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Animated.View
          style={[
            styles.brandSlot,
            {
              width: expansion.interpolate({
                inputRange: [0, 1],
                outputRange: [182, 0],
              }),
              opacity: expansion.interpolate({
                inputRange: [0, 0.7],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <AppIcon name="mam-companion" size={30} decorative />
            </View>
            <BrandWordmark size={26} />
          </View>
        </Animated.View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel={t('home.createPost')} onPress={onCreatePost} style={styles.action}>
            <AppIcon name="plus" size={23} color={colors.text.primary} decorative />
          </Pressable>
          <Animated.View
            style={[
              styles.searchSlot,
              searchExpanded && styles.searchSlotExpanded,
              {
                width: expansion.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, openSearchWidth],
                }),
              },
            ]}
          >
            {!searchExpanded ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('home.search')}
                onPress={onOpenSearch}
                style={styles.searchTrigger}
              >
                <AppIcon name="search" size={23} color={colors.text.primary} decorative />
              </Pressable>
            ) : (
              <View style={styles.searchField}>
                <AppIcon name="search" size={19} color={colors.primary[700]} decorative />
                <TextInput
                  ref={inputRef}
                  value={searchQuery}
                  onChangeText={onChangeSearch}
                  onSubmitEditing={onSubmitSearch}
                  placeholder={t('home.searchPlaceholder')}
                  placeholderTextColor={colors.text.secondary}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel={t('home.search')}
                  style={styles.searchInput}
                />
                {searchQuery ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('home.clearSearch')}
                    onPress={() => onChangeSearch('')}
                    hitSlop={6}
                    style={styles.inlineAction}
                  >
                    <AppIcon name="close" size={14} color={colors.text.secondary} decorative />
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.close')}
                  onPress={closeSearch}
                  hitSlop={6}
                  style={styles.inlineAction}
                >
                  <AppIcon name="close" size={17} color={colors.primary[700]} decorative />
                </Pressable>
              </View>
            )}
          </Animated.View>
        </View>
      </View>

      {!searchExpanded ? (
        <Pressable accessibilityRole="button" onPress={onCreatePost} style={styles.composer}>
          <AppText color={colors.text.secondary} style={styles.composerText}>{t('home.createPostPrompt')}</AppText>
          <AppIcon name="image" size={24} color={colors.primary[700]} decorative />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingTop: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandSlot: { overflow: 'hidden' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  action: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.background.muted, alignItems: 'center', justifyContent: 'center' },
  searchSlot: { height: 40, borderRadius: radius.full, overflow: 'hidden', backgroundColor: colors.background.muted },
  searchSlotExpanded: { borderWidth: 1.5, borderColor: colors.primary[300], backgroundColor: colors.background.surface },
  searchTrigger: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchField: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.md, paddingRight: spacing.xs, gap: spacing.xs },
  searchInput: { flex: 1, minWidth: 0, color: colors.text.primary, fontSize: 15, paddingVertical: 0 },
  inlineAction: { width: 28, height: 28, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted },
  composer: { minHeight: 64, borderRadius: radius.xl, backgroundColor: colors.background.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  composerText: { flex: 1, fontSize: 16 },
});
