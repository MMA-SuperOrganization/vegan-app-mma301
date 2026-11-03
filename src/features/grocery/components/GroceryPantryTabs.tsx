import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components';
import { useTranslation } from '@/i18n';
import { colors, radius, spacing } from '@/theme';

export type GroceryPantryTab = 'grocery' | 'pantry';

export function GroceryPantryTabs({
  active,
  onChange,
}: {
  active: GroceryPantryTab;
  onChange: (tab: GroceryPantryTab) => void;
}) {
  const { t } = useTranslation();
  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorProgress = useRef(
    new Animated.Value(active === 'pantry' ? 1 : 0)
  ).current;
  const tabs: Array<{ value: GroceryPantryTab; label: string }> = [
    { value: 'grocery', label: t('grocery.title') },
    { value: 'pantry', label: t('pantry.title') },
  ];

  useEffect(() => {
    const animation = Animated.spring(indicatorProgress, {
      toValue: active === 'pantry' ? 1 : 0,
      stiffness: 250,
      damping: 28,
      mass: 0.7,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [active, indicatorProgress]);

  const indicatorWidth = Math.max(0, (trackWidth - spacing.xs * 2) / tabs.length);
  const indicatorTranslateX = indicatorProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, indicatorWidth],
  });

  return (
    <View
      style={styles.container}
      accessibilityRole="tablist"
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      {indicatorWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: indicatorWidth,
              transform: [{ translateX: indicatorTranslateX }],
            },
          ]}
        />
      ) : null}
      {tabs.map((tab) => {
        const selected = tab.value === active;
        const selectedLabelOpacity = indicatorProgress.interpolate({
          inputRange: [0, 1],
          outputRange: tab.value === 'grocery' ? [1, 0] : [0, 1],
        });
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.value)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={styles.labelStack}>
              <AppText variant="bodyStrong" color={colors.primary[700]}>
                {tab.label}
              </AppText>
              <Animated.View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={[styles.selectedLabel, { opacity: selectedLabelOpacity }]}
              >
                <AppText variant="bodyStrong" color={colors.text.inverse}>
                  {tab.label}
                </AppText>
              </Animated.View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.background.selected,
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: spacing.xs,
    bottom: spacing.xs,
    left: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.primary[700],
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    zIndex: 1,
  },
  labelStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLabel: {
    position: 'absolute',
  },
  pressed: { opacity: 0.72 },
});
