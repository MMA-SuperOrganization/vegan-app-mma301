import { Pressable, StyleSheet, View } from 'react-native';
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
  const tabs: Array<{ value: GroceryPantryTab; label: string }> = [
    { value: 'grocery', label: t('grocery.title') },
    { value: 'pantry', label: t('pantry.title') },
  ];

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const selected = tab.value === active;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.value)}
            style={({ pressed }) => [
              styles.tab,
              selected && styles.selectedTab,
              pressed && styles.pressed,
            ]}
          >
            <AppText
              variant="bodyStrong"
              color={selected ? colors.text.inverse : colors.primary[700]}
            >
              {tab.label}
            </AppText>
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
    gap: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.background.selected,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  selectedTab: { backgroundColor: colors.primary[700] },
  pressed: { opacity: 0.72 },
});
