import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, AppText } from '@/components/ui';
import { useTranslation, type TranslationKey } from '@/i18n';
import {
  colors,
  coreTokens,
  interactionTokens,
  radius,
  shadows,
  spacing,
  webLayout,
  type AssetName,
} from '@/theme';

type TabBarRenderer = NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>;
export type CustomTabBarProps = Parameters<TabBarRenderer>[0];
export interface TabBarItemConfig {
  labelKey: TranslationKey;
  icon: AssetName;
}
export interface ReusableTabBarProps extends CustomTabBarProps {
  config?: Record<string, TabBarItemConfig>;
  order?: string[];
}

const TAB_CONFIG: Record<string, { labelKey: TranslationKey; icon: AssetName }> = {
  index: { labelKey: 'nav.home', icon: 'home' },
  'meal-plan': {
    labelKey: 'nav.mealPlan',
    icon: 'spark',
  },
  grocery: {
    labelKey: 'nav.grocery',
    icon: 'pantry',
  },
  diary: { labelKey: 'nav.diary', icon: 'explore' },
  profile: {
    labelKey: 'nav.profile',
    icon: 'profile',
  },
};

const TAB_ORDER = ['index', 'meal-plan', 'grocery', 'diary', 'profile'];
const ACTIVE_LINE_WIDTH = 30;

export function CustomTabBar({
  state,
  descriptors,
  navigation,
  config = TAB_CONFIG,
  order = TAB_ORDER,
}: ReusableTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [itemsWidth, setItemsWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const hasPositionedIndicator = useRef(false);
  const selectedTabIndex = Math.max(
    0,
    order.indexOf(state.routes[state.index]?.name)
  );

  useEffect(() => {
    if (!itemsWidth) return;
    const contentWidth = itemsWidth - spacing.lg * 2;
    const tabWidth = contentWidth / order.length;
    const target =
      spacing.lg + tabWidth * selectedTabIndex + (tabWidth - ACTIVE_LINE_WIDTH) / 2;

    if (!hasPositionedIndicator.current) {
      indicatorX.setValue(target);
      hasPositionedIndicator.current = true;
      return;
    }

    const animation = Animated.spring(indicatorX, {
      toValue: target,
      damping: 20,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [indicatorX, itemsWidth, order.length, selectedTabIndex]);

  const measureItems = (event: LayoutChangeEvent) => {
    setItemsWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        Platform.OS !== 'web' && coreTokens.navigation.tabBarShadow,
        Platform.OS === 'web'
          ? styles.webContainer
          : { paddingBottom: insets.bottom },
      ]}
    >
      <View
        style={[styles.items, Platform.OS === 'web' && styles.webItems]}
        onLayout={measureItems}
      >
        {order.map((routeName) => {
          const routeIndex = state.routes.findIndex(
            (route) => route.name === routeName
          );
          if (routeIndex < 0) return null;

          const route = state.routes[routeIndex];
          const tabConfig = config[routeName];
          if (!tabConfig) return null;
          const label = t(tabConfig.labelKey);
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
              <View style={styles.tabContent}>
                <AppIcon
                  name={tabConfig.icon}
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
        {itemsWidth ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.activeLine, { transform: [{ translateX: indicatorX }] }]}
          />
        ) : null}
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
  activeLine: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    width: ACTIVE_LINE_WIDTH,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.primary[700],
  },
  label: {
    ...coreTokens.navigation.tabLabel,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  activeLabel: coreTokens.navigation.activeTabLabel,
  webContainer: {
    alignItems: 'center',
    paddingHorizontal: webLayout.pageGutter,
    paddingBottom: webLayout.dockBottomSpace,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
  },
  webItems: {
    width: '100%',
    maxWidth: webLayout.navigationMaxWidth,
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.xl,
    backgroundColor: colors.background.surface,
    ...shadows.lg,
  },
});
