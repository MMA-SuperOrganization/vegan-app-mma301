import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, AppText } from '@/components/ui';
import { useTranslation, type TranslationKey } from '@/i18n';
import { colors, coreTokens, interactionTokens, spacing, type AssetName } from '@/theme';

type Props = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];
const CONFIG: Record<string, { key: TranslationKey; icon: AssetName }> = {
  index: { key: 'admin.tabs.overview', icon: 'home' },
  moderation: { key: 'admin.tabs.moderation', icon: 'explore' },
  users: { key: 'admin.tabs.users', icon: 'profile' },
  'master-data': { key: 'admin.tabs.masterData', icon: 'pantry' },
  audit: { key: 'admin.tabs.audit', icon: 'spark' },
};
const ORDER = ['index', 'moderation', 'users', 'master-data', 'audit'];

export function AdminTabBar({ state, descriptors, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View style={[styles.container, coreTokens.navigation.tabBarShadow, { paddingBottom: insets.bottom }]}>
      <View style={styles.items}>
        {ORDER.map((name) => {
          const index = state.routes.findIndex((route) => route.name === name);
          if (index < 0) return null;
          const route = state.routes[index];
          const config = CONFIG[name];
          const focused = state.index === index;
          const descriptor = descriptors[route.key];
          const label = t(config.key);
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          return (
            <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: focused }} testID={descriptor.options.tabBarButtonTestID} onPress={onPress} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
              <View style={[styles.content, focused && styles.active]}>
                <AppIcon name={config.icon} size={coreTokens.navigation.tabIconSize} color={focused ? colors.primary[700] : colors.text.secondary} decorative />
                <AppText numberOfLines={1} style={[styles.label, { color: focused ? colors.primary[700] : colors.text.secondary }]}>{label}</AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border.default },
  items: { height: coreTokens.navigation.tabBarHeight, flexDirection: 'row', alignItems: 'stretch', paddingTop: 9, paddingBottom: 11, paddingHorizontal: spacing.sm },
  tab: { flex: 1, minWidth: 0, minHeight: interactionTokens.minimumTouch, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  pressed: { opacity: 0.7 },
  content: { width: coreTokens.navigation.tabItemWidth, minHeight: coreTokens.navigation.tabItemHeight, alignItems: 'center', justifyContent: 'center', borderRadius: coreTokens.navigation.tabItemRadius, paddingVertical: spacing.xs },
  active: { backgroundColor: colors.background.selected },
  label: { ...coreTokens.navigation.tabLabel, marginTop: spacing.xs, textAlign: 'center' },
});
