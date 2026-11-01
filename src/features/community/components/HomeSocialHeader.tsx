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
  const closingRef = useRef(false);
  const expansion = useRef(new Animated.Value(searchExpanded ? 1 : 0)).current;
  const fieldReveal = useRef(
    new Animated.Value(searchExpanded ? 1 : 0)
  ).current;
  const openSearchWidth = Math.max(220, window.width - spacing.md * 2);

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
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <AppIcon name="mam-companion" size={30} decorative />
          </View>
          <BrandWordmark size={26} />
        </View>

        {!searchExpanded ? (
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.createPost')}
              onPress={onCreatePost}
              style={styles.action}
            >
              <AppIcon
                name="plus"
                size={23}
                color={colors.text.primary}
                decorative
              />
            </Pressable>
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
          </View>
        ) : (
          <Animated.View
            style={[
              styles.searchSlot,
              {
                width: expansion.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, openSearchWidth],
                  extrapolate: 'clamp',
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
        )}
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
  topRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  action: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.background.muted, alignItems: 'center', justifyContent: 'center' },
  searchSlot: { position: 'absolute', top: 0, right: 0, zIndex: 1, height: 40, borderRadius: radius.full, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.primary[300], backgroundColor: colors.background.surface },
  searchField: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.md, paddingRight: spacing.xs, gap: spacing.xs },
  searchInput: { flex: 1, minWidth: 0, color: colors.text.primary, fontSize: 15, paddingVertical: 0 },
  leadingAction: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  inlineAction: { width: 28, height: 28, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.muted },
  composer: { minHeight: 64, borderRadius: radius.xl, backgroundColor: colors.background.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  composerText: { flex: 1, fontSize: 16 },
});
