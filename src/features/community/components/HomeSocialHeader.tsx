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

import { useRouter } from 'expo-router';

import { AppIcon, AppText, BrandWordmark } from '@/components';
import { useUnreadNotificationCount } from '@/features/settings';
import { useTranslation } from '@/i18n';
import { colors, inputTypography, radius, spacing } from '@/theme';

export function HomeSocialHeader({
  onScrollToTop,
  onCreatePost,
  searchExpanded,
  searchQuery,
  onOpenSearch,
  onCloseSearch,
  onChangeSearch,
  onSubmitSearch,
}: {
  onScrollToTop?: () => void;
  onCreatePost: () => void;
  searchExpanded: boolean;
  searchQuery: string;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onChangeSearch: (query: string) => void;
  onSubmitSearch: () => void;
}) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const unreadCount = useUnreadNotificationCount().data?.count ?? 0;
  const window = useWindowDimensions();
  const inputRef = useRef<TextInput>(null);
  const closingRef = useRef(false);
  const navigatingRef = useRef(false);

  const handleOpenNotifications = () => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    router.navigate('/notifications');
    setTimeout(() => {
      navigatingRef.current = false;
    }, 1000);
  };
  const expansion = useRef(new Animated.Value(searchExpanded ? 1 : 0)).current;
  const fieldReveal = useRef(new Animated.Value(searchExpanded ? 1 : 0)).current;
  // Search sits left of the bell; the field grows leftwards from the search slot.
  const searchSlotRight = 40 + spacing.xs;
  const openSearchWidth = Math.max(
    220,
    window.width - spacing.md * 2 - searchSlotRight
  );

  useEffect(() => {
    if (!searchExpanded) {
      closingRef.current = false;
      expansion.setValue(0);
      fieldReveal.setValue(0);
      return;
    }

    closingRef.current = false;
    expansion.setValue(0);
    fieldReveal.setValue(0);
    const animation = Animated.parallel([
      Animated.timing(expansion, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(fieldReveal, {
        toValue: 1,
        delay: 70,
        duration: 170,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished && searchExpanded) inputRef.current?.focus();
    });

    return () => animation.stop();
  }, [expansion, fieldReveal, searchExpanded]);

  const closeSearch = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(fieldReveal, {
        toValue: 0,
        duration: 90,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(expansion, {
        toValue: 0,
        delay: 25,
        duration: 230,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      closingRef.current = false;
      if (finished) onCloseSearch();
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locale === 'vi' ? 'Về đầu trang' : 'Scroll to top'}
          onPress={onScrollToTop}
          hitSlop={{ top: 16, bottom: 12, left: 16, right: 16 }}
          style={({ pressed }) => [
            styles.brandRow,
            pressed && styles.brandRowPressed,
          ]}
        >
          <View style={styles.brandIcon}>
            <AppIcon name="mam-companion" size={30} decorative />
          </View>
          <BrandWordmark size={26} />
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.search')}
            onPress={onOpenSearch}
            style={styles.action}
          >
            <AppIcon
              name="search"
              size={23}
              color={colors.primary[700]}
              decorative
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('notifications.title')}
            onPress={handleOpenNotifications}
            style={styles.action}
          >
            <AppIcon name="bell" size={23} color={colors.primary[700]} decorative />
            {unreadCount > 0 ? (
              <View style={styles.bellBadge}>
                <AppText
                  variant="caption"
                  color={colors.common.white}
                  style={styles.bellBadgeText}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        </View>
        {searchExpanded ? (
          <Animated.View
            style={[
              styles.searchSlot,
              {
                right: searchSlotRight,
                // Invisible at rest so the real search button underneath shows
                // (no squashed copy lingering after close).
                opacity: expansion.interpolate({
                  inputRange: [0, 0.08, 1],
                  outputRange: [0, 1, 1],
                  extrapolate: 'clamp',
                }),
                width: expansion.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, openSearchWidth],
                  extrapolate: 'clamp',
                }),
                backgroundColor: expansion.interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.background.muted, colors.background.surface],
                }),
                borderColor: expansion.interpolate({
                  inputRange: [0, 1],
                  outputRange: [colors.background.muted, colors.primary[300]],
                }),
                transform: [
                  {
                    scaleY: expansion.interpolate({
                      inputRange: [0, 0.45, 1],
                      outputRange: [0.82, 1.04, 1],
                      extrapolate: 'clamp',
                    }),
                  },
                ],
              },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.collapsedSearchGlyph,
                {
                  opacity: fieldReveal.interpolate({
                    inputRange: [0, 0.55, 1],
                    outputRange: [1, 0, 0],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      scale: expansion.interpolate({
                        inputRange: [0, 0.35, 1],
                        outputRange: [1, 0.9, 0.9],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            >
              <AppIcon
                name="search"
                size={23}
                color={colors.primary[700]}
                decorative
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.searchField,
                {
                  opacity: fieldReveal,
                  transform: [
                    {
                      translateX: fieldReveal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.back')}
                onPress={closeSearch}
                hitSlop={6}
                style={styles.leadingAction}
              >
                <AppIcon
                  name="back"
                  size={20}
                  color={colors.primary[700]}
                  decorative
                />
              </Pressable>
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
                  <AppIcon
                    name="close"
                    size={17}
                    color={colors.primary[700]}
                    decorative
                  />
                </Pressable>
              ) : null}
            </Animated.View>
          </Animated.View>
        ) : null}
      </View>

      {!searchExpanded ? (
        <Pressable
          accessibilityRole="button"
          onPress={onCreatePost}
          style={styles.composer}
        >
          <AppText color={colors.text.secondary} style={styles.composerText}>
            {t('home.createPostPrompt')}
          </AppText>
          <AppIcon name="image" size={24} color={colors.primary[700]} decorative />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingTop: spacing.sm },
  topRow: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandRowPressed: { opacity: 0.75 },
  brandIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  action: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.background.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.status.danger,
  },
  bellBadgeText: { fontSize: 10, lineHeight: 12 },
  searchSlot: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
    height: 40,
    borderRadius: radius.full,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  collapsedSearchGlyph: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    gap: spacing.xs,
  },
  searchInput: {
    ...inputTypography,
    flex: 1,
    minWidth: 0,
    color: colors.text.primary,
    fontSize: 15,
    paddingVertical: 0,
  },
  leadingAction: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineAction: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.muted,
  },
  composer: {
    minHeight: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  composerText: { flex: 1, fontSize: 16 },
});
