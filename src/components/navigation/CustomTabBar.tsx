import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, AppText } from '@/components/ui';
import { useTranslation, type TranslationKey } from '@/i18n';
import {
  colors,
  coreTokens,
  interactionTokens,
  spacing,
  type AssetName,
} from '@/theme';

type TabBarRenderer = NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>;
export type CustomTabBarProps = Parameters<TabBarRenderer>[0];

const TAB_CONFIG: Record<string, { labelKey: TranslationKey; icon: AssetName }> = {
  index: { labelKey: 'nav.home', icon: 'home' },
  explore: { labelKey: 'nav.explore', icon: 'explore' },
  'meal-plan': {
    labelKey: 'nav.mam',
    icon: 'spark',
  },
  grocery: {
    labelKey: 'nav.pantry',
    icon: 'pantry',
  },
  profile: {
    labelKey: 'nav.profile',
    icon: 'profile',
  },
};

const TAB_ORDER = ['index', 'explore', 'meal-plan', 'grocery', 'profile'];

export function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        coreTokens.navigation.tabBarShadow,
        { paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.items}>
        {TAB_ORDER.map((routeName) => {
          const routeIndex = state.routes.findIndex(
            (route) => route.name === routeName
          );
          if (routeIndex < 0) return null;

          const route = state.routes[routeIndex];
          const config = TAB_CONFIG[routeName];
          const label = t(config.labelKey);
          const descriptor = descriptors[route.key];
          const isFocused = state.index === routeIndex;
          const color = isFocused ? colors.primary[700] : colors.text.secondary;
          const accessibilityLabel =
            descriptor.options.tabBarAccessibilityLabel ??
            t('nav.open', { screen: label });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={accessibilityLabel}
              accessibilityState={{ selected: isFocused }}
              testID={descriptor.options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            >
              <View style={[styles.tabContent, isFocused && styles.activeIndicator]}>
                <AppIcon
                  name={config.icon}
                  size={coreTokens.navigation.tabIconSize}
                  color={color}
                  decorative
                />
                <AppText
                  numberOfLines={1}
                  style={[styles.label, { color }, isFocused && styles.activeLabel]}
                >
                  {label}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border.default,
  },
  items: {
    height: coreTokens.navigation.tabBarHeight,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: 9,
    paddingBottom: 11,
    paddingHorizontal: spacing.lg,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    minHeight: interactionTokens.minimumTouch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  pressed: { opacity: 0.7 },
  tabContent: {
    width: coreTokens.navigation.tabItemWidth,
    minHeight: coreTokens.navigation.tabItemHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: coreTokens.navigation.tabItemRadius,
    paddingVertical: spacing.xs,
  },
  activeIndicator: { backgroundColor: colors.background.selected },
  label: {
    ...coreTokens.navigation.tabLabel,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  activeLabel: coreTokens.navigation.activeTabLabel,
});
